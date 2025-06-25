import express from 'express';
import 'reflect-metadata';
import { container } from 'tsyringe';

export type AppProviderType =
  | { key: string; provide: any }
  | { key: string; useValue: any }
  | (new (...args: any[]) => any);

export type AppControllerType = new (...args: any[]) => { [key: string]: any };

export class AppModule {
  private app: express.Application = express();
  private initialized: boolean = false;
  private bootstrapped: boolean = false;
  private parentModule?: AppModule;
  private allProviders: AppProviderType[] = [];

  constructor(
    readonly options: {
      path?: string;
      providers?: AppProviderType[];
      controllers?: AppControllerType[];
      imports?: (AppModule | (new () => AppModule))[];
    },
  ) {
    this.app.use(express.json());
  }

  public getApp() {
    return this.app;
  }

  // Método para obter todos os providers (incluindo os do pai)
  private getAllProviders(): AppProviderType[] {
    const providers = [...this.allProviders];

    // Adicionar providers do módulo pai se existir
    if (this.parentModule) {
      providers.push(...this.parentModule.getAllProviders());
    }

    return providers;
  }

  async bootstrap() {
    if (this.bootstrapped) return this;

    const { path: modulePath = '/', providers = [], controllers = [], imports = [] } = this.options;

    // Registrar providers locais primeiro
    this.allProviders = [...providers];

    // Store imported module instances to avoid creating duplicates
    const importedModuleInstances: AppModule[] = [];

    // Register imported modules first (parents)
    for (const importedModule of imports) {
      const moduleInstance =
        importedModule instanceof AppModule ? importedModule : new importedModule();

      // Set this as parent for the imported module
      moduleInstance.parentModule = this;

      // Store the instance
      importedModuleInstances.push(moduleInstance);

      // Bootstrap the imported module
      await moduleInstance.bootstrap();
    }

    // Register all providers (including inherited ones) AFTER processing imports
    const allProviders = this.getAllProviders();
    for (const provider of allProviders) {
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

    // Register controllers from imported modules AFTER providers are registered
    for (const moduleInstance of importedModuleInstances) {
      const importedControllers = moduleInstance.options.controllers || [];
      const importedPath = moduleInstance.options.path || '/';

      for (const controller of importedControllers) {
        const controllerInstance = container.resolve(controller);
        const controllerPath = Reflect.getMetadata('controller:path', controller) || '';
        const routes: {
          method: 'get' | 'post' | 'put' | 'patch' | 'delete';
          path: string;
          handler: (ctx: { req: any; res: any; next: Function }) => Promise<any>;
          propertyKey: string;
        }[] = Reflect.getMetadata('controller:routes', controller) || [];

        for (const route of routes) {
          const routePath = `${modulePath}${importedPath}${controllerPath}${route.path}`.replace(
            '//',
            '/',
          );
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
    }

    // resolve controllers (only for this module, not imported ones)
    for (const controller of controllers) {
      const controllerInstance = container.resolve(controller);
      const controllerPath = Reflect.getMetadata('controller:path', controller) || '';
      const routes: {
        method: 'get' | 'post' | 'put' | 'patch' | 'delete';
        path: string;
        handler: (ctx: { req: any; res: any; next: Function }) => Promise<any>;
        propertyKey: string;
      }[] = Reflect.getMetadata('controller:routes', controller) || [];

      for (const route of routes) {
        const routePath = `${modulePath}${controllerPath}${route.path}`.replace('//', '/');
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
