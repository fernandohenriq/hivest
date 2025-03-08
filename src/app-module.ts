import express, { Application, NextFunction } from 'express';
import { DependencyContainer, container } from 'tsyringe';

import {
  HttpContext,
  HttpHandler,
  HttpMethods,
  HttpMiddlewareOptions,
  HttpReq,
  HttpRes,
  ModuleOptions,
  ModuleProvider,
} from './app-interfaces';

export class AppModule {
  private expressApp?: Application;
  private isInitialized = false;
  private container: DependencyContainer = container.createChildContainer();

  constructor(private options: ModuleOptions) {
    const app = express();
    app.use(express.json());
  }

  private async initModules(module: AppModule, visited = new Set<AppModule>()) {
    if (visited.has(module)) return;
    visited.add(module);

    // Register providers (now including controllers)
    const allProviders = module.options.providers || [];

    allProviders.forEach((provider: ModuleProvider) => {
      const token = typeof provider === 'function' ? provider.name : provider.key;
      const useClass = typeof provider === 'function' ? provider : provider.useClass;
      this.container.register(token, { useClass });
    });

    // Process imported modules
    await Promise.all(
      module.options.imports?.map((module) => {
        if (module instanceof AppModule) {
          return this.initModules(module, visited);
        }
        return this.initModules(new module(), visited);
      }) ?? [],
    );
  }

  private createExpressHandler(handler: HttpHandler) {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const ctx: HttpContext = {
        req: req as unknown as HttpReq,
        res: res as unknown as HttpRes,
        next,
      };

      try {
        await handler(ctx);
      } catch (err) {
        next(err);
      }
    };
  }

  async init() {
    if (this.isInitialized) return;
    await this.initModules(this);

    // Collect all controllers
    const controllers = [
      ...(this.options.providers?.map((p) => (typeof p === 'function' ? p : p.useClass)) || []),
      ...(this.options.imports?.flatMap((module) => {
        if (module instanceof AppModule) {
          return (
            module.options.providers?.map((p: any) => (typeof p === 'function' ? p : p.useClass)) ||
            []
          );
        }
        return (
          new module().options.providers?.map((p: any) =>
            typeof p === 'function' ? p : p.useClass,
          ) || []
        );
      }) || []),
    ];

    // Initialize Express
    this.expressApp = express();
    this.expressApp.use(express.json());

    // Process controllers
    const processModule = (module: AppModule, parentPath: string = ''): any[] => {
      const currentModulePath = [parentPath, module.options.path]
        .filter((p) => p && p !== '/')
        .join('/')
        .replace(/\/+/g, '/');

      const controllers = [
        ...(module.options.providers?.map((p) => (typeof p === 'function' ? p : p.useClass)) || []),
        ...(module.options.imports?.flatMap((m) =>
          m instanceof AppModule
            ? processModule(m, currentModulePath)
            : processModule(new m(), currentModulePath),
        ) || []),
      ];

      controllers.forEach((ControllerClass) => {
        const controllerPath = Reflect.getMetadata('controller:path', ControllerClass);
        const routes = Reflect.getMetadata('controller:routes', ControllerClass) || [];
        const middlewares = Reflect.getMetadata('controller:middlewares', ControllerClass) || [];

        const router = express.Router();
        const controllerInstance = this.container.resolve(ControllerClass);

        // Apply middlewares
        middlewares.forEach(
          ({
            path,
            handler,
            options,
          }: {
            path: string;
            handler: HttpHandler;
            options: HttpMiddlewareOptions;
          }) => {
            const middleware = this.createExpressHandler(handler.bind(controllerInstance));
            if (options?.errorHandler) {
              router.use(path, ((
                err: any,
                req: express.Request,
                res: express.Response,
                next: express.NextFunction,
              ) => {
                const ctx: HttpContext = {
                  req: req as unknown as HttpReq,
                  res: res as unknown as HttpRes,
                  next,
                  err,
                };
                handler.call(controllerInstance, ctx);
              }) as express.ErrorRequestHandler);
            } else {
              router.use(path, middleware);
            }
          },
        );

        // Apply routes
        routes.forEach(
          ({
            method,
            path,
            handler,
          }: {
            method: HttpMethods;
            path: string;
            handler: HttpHandler;
          }) => {
            const routePath = [path];

            router[method](routePath, this.createExpressHandler(handler.bind(controllerInstance)));
          },
        );

        // Mount the router at the combined path
        const basePath = [currentModulePath, controllerPath]
          .filter((p) => p && p !== '/')
          .join('/')
          .replace(/\/+/g, '/');

        this.expressApp?.use(basePath, router);
      });

      return controllers;
    };

    processModule(this);

    this.isInitialized = true;
  }

  async start(port: number, callback?: () => void) {
    if (!this.isInitialized) await this.init();
    this.expressApp?.listen(port, callback);
  }

  getExpressApp(): Application | undefined {
    return this.expressApp;
  }
}
