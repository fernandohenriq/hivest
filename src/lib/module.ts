import express from 'express';
import 'reflect-metadata';
import { container } from 'tsyringe';

export type AppProviderType =
  | { key: string; provide: any }
  | { key: string; useValue: any }
  | (new (...args: any[]) => any);

export type AppControllerType = new (...args: any[]) => { [key: string]: any };

// Types for controller items metadata
type ControllerItem = {
  type: 'route' | 'middleware';
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path?: string;
  handler: (ctx: { req: any; res: any; next: Function }) => Promise<any>;
  propertyKey: string;
};

// Types for route registration context
type RouteContext = {
  modulePath: string;
  controllerPath: string;
  controllerInstance: any;
  app: express.Application;
};

/**
 * Main application module class that handles dependency injection,
 * route registration, and module composition
 */
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

  /**
   * Get the Express application instance
   */
  public getApp() {
    return this.app;
  }

  /**
   * Get all providers including parent module providers (recursive)
   * Uses the Composite pattern to gather providers from the module hierarchy
   */
  private getAllProviders(): AppProviderType[] {
    const providers = [...this.allProviders];

    // Add parent module providers recursively
    if (this.parentModule) {
      providers.push(...this.parentModule.getAllProviders());
    }

    return providers;
  }

  /**
   * Register a provider in the dependency injection container
   * Supports class providers, value providers, and smart providers
   */
  private registerProvider(provider: AppProviderType): void {
    if (provider instanceof Function) {
      // Class provider - register as singleton
      container.registerSingleton(provider.name, provider);
    } else if ('useValue' in provider) {
      // Value provider - register as instance
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

  /**
   * Register all providers in the dependency injection container
   * Uses the Strategy pattern to handle different provider types
   */
  private registerAllProviders(): void {
    const allProviders = this.getAllProviders();
    for (const provider of allProviders) {
      this.registerProvider(provider);
    }
  }

  /**
   * Process and register a single controller item (route or middleware)
   * Uses the Strategy pattern to handle different item types
   */
  private processControllerItem(item: ControllerItem, context: RouteContext): void {
    if (item.type === 'route') {
      this.registerRoute(item, context);
    } else if (item.type === 'middleware') {
      this.registerMiddleware(item, context);
    }
  }

  /**
   * Register a route in the Express application
   */
  private registerRoute(item: ControllerItem, context: RouteContext): void {
    const { modulePath, controllerPath, controllerInstance, app } = context;
    const routePath = `${modulePath}${controllerPath}${item.path}`.replace('//', '/');

    console.log(`Registering route: ${item.method?.toUpperCase()} ${routePath}`);

    app[item.method!](routePath, async (req: any, res: any, next: Function) => {
      try {
        await controllerInstance[item.propertyKey]({ req, res });
      } catch (error) {
        next(error);
      }
    });
  }

  /**
   * Register a middleware in the Express application
   */
  private registerMiddleware(item: ControllerItem, context: RouteContext): void {
    const { controllerInstance, app } = context;

    console.log(`Registering middleware: ${item.propertyKey}`);

    app.use(async (req: any, res: any, next: Function) => {
      try {
        await controllerInstance[item.propertyKey]({ req, res, next });
      } catch (error) {
        next(error);
      }
    });
  }

  /**
   * Process and register all controllers from a module
   * Uses the Template Method pattern to process controllers consistently
   */
  private processControllers(controllers: AppControllerType[], modulePath: string): void {
    for (const controller of controllers) {
      const controllerInstance = container.resolve(controller);
      const controllerPath = Reflect.getMetadata('controller:path', controller) || '';
      const items: ControllerItem[] = Reflect.getMetadata('controller:items', controller) || [];

      const context: RouteContext = {
        modulePath,
        controllerPath,
        controllerInstance,
        app: this.app,
      };

      for (const item of items) {
        this.processControllerItem(item, context);
      }
    }
  }

  /**
   * Bootstrap imported modules (parent modules)
   * Uses the Composite pattern to handle module hierarchy
   */
  private async bootstrapImportedModules(
    imports: (AppModule | (new () => AppModule))[],
  ): Promise<AppModule[]> {
    const importedModuleInstances: AppModule[] = [];

    for (const importedModule of imports) {
      const moduleInstance =
        importedModule instanceof AppModule ? importedModule : new importedModule();

      // Set this as parent for the imported module (Composite pattern)
      moduleInstance.parentModule = this;
      importedModuleInstances.push(moduleInstance);

      // Bootstrap the imported module
      await moduleInstance.bootstrap();
    }

    return importedModuleInstances;
  }

  /**
   * Process controllers from imported modules
   * Uses the Visitor pattern to process external module controllers
   */
  private processImportedModuleControllers(
    importedModuleInstances: AppModule[],
    modulePath: string,
  ): void {
    for (const moduleInstance of importedModuleInstances) {
      const importedControllers = moduleInstance.options.controllers || [];
      const importedPath = moduleInstance.options.path || '/';
      const fullModulePath = `${modulePath}${importedPath}`;

      this.processControllers(importedControllers, fullModulePath);
    }
  }

  /**
   * Bootstrap the application module
   * Orchestrates the entire initialization process using multiple patterns
   */
  async bootstrap() {
    if (this.bootstrapped) return this;

    const { path: modulePath = '/', providers = [], controllers = [], imports = [] } = this.options;

    // Step 1: Register local providers
    this.allProviders = [...providers];

    // Step 2: Bootstrap imported modules (Composite pattern)
    const importedModuleInstances = await this.bootstrapImportedModules(imports);

    // Step 3: Register all providers (including inherited ones)
    this.registerAllProviders();

    // Step 4: Process controllers from imported modules
    this.processImportedModuleControllers(importedModuleInstances, modulePath);

    // Step 5: Process local controllers
    this.processControllers(controllers, modulePath);

    this.bootstrapped = true;
    return this;
  }

  /**
   * Start the HTTP server
   * Ensures proper initialization order
   */
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
