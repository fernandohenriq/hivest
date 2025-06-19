import express from 'express';
import 'reflect-metadata';
import { container } from 'tsyringe';

export type Provider =
  | { key: string; provide: any }
  | { key: string; useValue: any }
  | (new (...args: any[]) => any);

export type Controller = new (...args: any[]) => { [key: string]: any };

export class AppModule {
  private app: express.Application = express();
  private initialized: boolean = false;
  private bootstrapped: boolean = false;
  private parentModule?: AppModule;

  constructor(
    readonly options: {
      path?: string;
      providers?: Provider[];
      controllers?: Controller[];
      imports?: (AppModule | (new () => AppModule))[];
    },
  ) {
    this.app.use(express.json());
  }

  async bootstrap() {
    if (this.bootstrapped) return this;

    const { path: modulePath = '/', providers = [], controllers = [], imports = [] } = this.options;

    // Register imported modules first (parents)
    for (const importedModule of imports) {
      const moduleInstance =
        importedModule instanceof AppModule ? importedModule : new importedModule();

      // Set this as parent for the imported module
      moduleInstance.parentModule = this;

      // Bootstrap the imported module
      await moduleInstance.bootstrap();

      // Merge providers from imported module
      const importedProviders = moduleInstance.options.providers || [];
      providers.push(...importedProviders);

      // Register imported module's routes under this module's path
      const importedPath = moduleInstance.options.path || '/';
      const fullImportedPath = `${modulePath}${importedPath}`.replace('//', '/');

      // Mount the imported module's app under this path
      this.app.use(fullImportedPath, moduleInstance.app);
    }

    // register providers (including inherited ones)
    for (const provider of providers) {
      if (provider instanceof Function) {
        // Class provider
        container.registerSingleton(provider.name, provider);
      } else if ('useValue' in provider) {
        // Value provider
        container.registerInstance(provider.key, provider.useValue);
      } else {
        // Smart provider - detect if provide is a class or value
        const provide = provider.provide;
        if (provide instanceof Function) {
          // It's a class
          container.registerSingleton(provider.key, provide);
        } else {
          // It's a value
          container.registerInstance(provider.key, provide);
        }
      }
    }

    // resolve controllers (only for this module, not imported ones)
    for (const controller of controllers) {
      const controllerInstance = container.resolve(controller);
      const routes: {
        method: 'get' | 'post' | 'put' | 'patch' | 'delete';
        path: string;
        handler: (ctx: { req: any; res: any; next: Function }) => Promise<any>;
        propertyKey: string;
      }[] = Reflect.getMetadata('controller:routes', controller) || [];

      for (const route of routes) {
        const routePath = `${modulePath}${route.path}`.replace('//', '/');
        console.log(`Registering route: ${route.method.toUpperCase()} ${routePath}`);

        this.app[route.method](routePath, async (req: any, res: any, next: Function) => {
          try {
            await controllerInstance[route.propertyKey]({ req, res });
          } catch (error) {
            next(error);
          }
        });
      }
    }
    this.bootstrapped = true;
    return this;
  }

  async listen(port: number) {
    if (this.initialized) return this;
    if (!this.bootstrapped) await this.bootstrap();
    this.app.listen(port, () => {
      console.info(`Server is running on port ${port}`);
    });
    this.initialized = true;
    return this;
  }
}
