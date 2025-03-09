import express, { Application, NextFunction, Response } from 'express';
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
  UseClass,
} from './app-interfaces';

// Helper function to enhance Express response with status helpers
function enhanceResponse(res: Response): HttpRes {
  // Cast to any to allow adding properties
  const enhancedRes = res as any;

  // Informational responses (100 – 199)
  enhancedRes.continue = (data?: any) => {
    res.status(100);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.switchingProtocols = (data?: any) => {
    res.status(101);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.processing = (data?: any) => {
    res.status(102);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.earlyHints = (data?: any) => {
    res.status(103);
    if (data) res.json(data);
    return enhancedRes;
  };

  // Successful responses (200 – 299)
  enhancedRes.ok = (data?: any) => {
    res.status(200);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.created = (data?: any) => {
    res.status(201);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.accepted = (data?: any) => {
    res.status(202);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.nonAuthoritativeInformation = (data?: any) => {
    res.status(203);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.noContent = () => {
    res.status(204).end();
    return enhancedRes;
  };

  enhancedRes.resetContent = () => {
    res.status(205).end();
    return enhancedRes;
  };

  enhancedRes.partialContent = (data?: any) => {
    res.status(206);
    if (data) res.json(data);
    return enhancedRes;
  };

  // Redirection messages (300 – 399)
  enhancedRes.multipleChoices = (data?: any) => {
    res.status(300);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.movedPermanently = (data?: any) => {
    res.status(301);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.found = (data?: any) => {
    res.status(302);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.seeOther = (data?: any) => {
    res.status(303);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.notModified = () => {
    res.status(304).end();
    return enhancedRes;
  };

  enhancedRes.temporaryRedirect = (data?: any) => {
    res.status(307);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.permanentRedirect = (data?: any) => {
    res.status(308);
    if (data) res.json(data);
    return enhancedRes;
  };

  // Client error responses (400 – 499)
  enhancedRes.badRequest = (data?: any) => {
    res.status(400);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.unauthorized = (data?: any) => {
    res.status(401);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.paymentRequired = (data?: any) => {
    res.status(402);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.forbidden = (data?: any) => {
    res.status(403);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.notFound = (data?: any) => {
    res.status(404);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.methodNotAllowed = (data?: any) => {
    res.status(405);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.notAcceptable = (data?: any) => {
    res.status(406);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.requestTimeout = (data?: any) => {
    res.status(408);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.conflict = (data?: any) => {
    res.status(409);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.gone = (data?: any) => {
    res.status(410);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.unprocessableEntity = (data?: any) => {
    res.status(422);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.tooManyRequests = (data?: any) => {
    res.status(429);
    if (data) res.json(data);
    return enhancedRes;
  };

  // Server error responses (500 – 599)
  enhancedRes.internalServerError = (data?: any) => {
    res.status(500);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.notImplemented = (data?: any) => {
    res.status(501);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.badGateway = (data?: any) => {
    res.status(502);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.serviceUnavailable = (data?: any) => {
    res.status(503);
    if (data) res.json(data);
    return enhancedRes;
  };

  enhancedRes.gatewayTimeout = (data?: any) => {
    res.status(504);
    if (data) res.json(data);
    return enhancedRes;
  };

  return enhancedRes;
}

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
        res: enhanceResponse(res),
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
                  res: enhanceResponse(res),
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

  setProviders(providers: ModuleProvider[]) {
    this.options.providers = [...(this.options.providers || []), ...providers].filter(
      (p, index, self) => self.indexOf(p) === index,
    );
  }

  setImports(imports: (AppModule | UseClass<AppModule>)[]) {
    this.options.imports = [...(this.options.imports || []), ...imports].filter(
      (p, index, self) => self.indexOf(p) === index,
    );
  }

  setPath(path: string) {
    this.options.path = path;
  }

  setOptions(options: ModuleOptions) {
    const { providers, imports, path } = options ?? {};
    Array.isArray(providers) && this.setProviders(providers);
    Array.isArray(imports) && this.setImports(imports);
    typeof path === 'string' && this.setPath(path);
  }
}
