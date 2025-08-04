import express from 'express';
import 'reflect-metadata';
import { container } from 'tsyringe';

import { EventManager } from '../event-manager';

/**
 * Normalize a path by removing duplicate slashes and ensuring proper format
 * @param paths - Array of path segments to join and normalize
 * @returns Normalized path string
 */
function normalizePath(...paths: string[]): string {
  return (
    paths
      .filter((path) => path !== undefined && path !== null)
      .join('/')
      .replace(/\/+/g, '/') // Replace multiple consecutive slashes with single slash
      .replace(/\/$/, '') || '/'
  ); // Remove trailing slash, but keep root as '/'
}

export type AppProviderType =
  | { key: string; provide: any }
  | { key: string; useValue: any }
  | (new (...args: any[]) => any);

export type AppControllerType = new (...args: any[]) => { [key: string]: any };

// Types for controller items metadata
type ControllerItem = {
  type: 'route' | 'middleware' | 'errorHandler';
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path?: string;
  handler: (ctx: { req: any; res: any; next: Function; err?: any }) => Promise<any>;
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
  private eventManager: EventManager;

  constructor(
    readonly options: {
      path?: string;
      providers?: AppProviderType[];
      controllers?: AppControllerType[];
      imports?: (AppModule | (new () => AppModule))[];
    },
  ) {
    this.app.use(express.json());
    this.eventManager = new EventManager();

    // Initialize providers from options
    if (options.providers) {
      this.allProviders = [...options.providers];
    }
  }

  /**
   * Get the Express application instance
   */
  public getApp() {
    return this.app;
  }

  /**
   * Get the event manager instance
   */
  public getEventManager(): EventManager {
    return this.eventManager;
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
   * Share providers from parent module to this child module
   * This allows child modules to access parent module providers
   */
  public shareParentProviders(parentProviders: AppProviderType[]): void {
    // Add parent providers to this module's provider list
    this.allProviders.push(...parentProviders);
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
  public registerAllProviders(): void {
    const allProviders = this.getAllProviders();
    for (const provider of allProviders) {
      this.registerProvider(provider);
    }
  }

  /**
   * Check if a controller is marked as middleware
   */
  private isMiddlewareController(controller: AppControllerType): boolean {
    return Reflect.getMetadata('controller:isMiddleware', controller) === true;
  }

  /**
   * Check if a controller is marked as error handler middleware
   */
  private isErrorHandlerController(controller: AppControllerType): boolean {
    return Reflect.getMetadata('controller:isErrorHandler', controller) === true;
  }

  /**
   * Process and register a single controller item (route, middleware, or error handler)
   * Uses the Strategy pattern to handle different item types
   */
  private processControllerItem(item: ControllerItem, context: RouteContext): void {
    if (item.type === 'route') {
      this.registerRoute(item, context);
    } else if (item.type === 'middleware') {
      this.registerMiddleware(item, context);
    } else if (item.type === 'errorHandler') {
      this.registerErrorHandler(item, context);
    }
  }

  /**
   * Register a route in the Express application
   */
  private registerRoute(item: ControllerItem, context: RouteContext): void {
    const { modulePath, controllerPath, controllerInstance, app } = context;
    const routePath = normalizePath(modulePath, controllerPath, item.path || '');

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
   * Register an error handler in the Express application
   */
  private registerErrorHandler(item: ControllerItem, context: RouteContext): void {
    const { controllerInstance, app } = context;

    console.log(`Registering error handler: ${item.propertyKey}`);

    app.use(async (err: any, req: any, res: any, next: Function) => {
      try {
        await controllerInstance[item.propertyKey]({ req, res, next, err });
      } catch (error) {
        next(error);
      }
    });
  }

  /**
   * Process and register all controllers from a module
   * Uses the Template Method pattern to process controllers consistently
   * Now automatically detects and processes middleware classes and error handlers
   */
  private processControllers(controllers: AppControllerType[], modulePath: string): void {
    for (const controller of controllers) {
      const controllerInstance = container.resolve(controller);
      const controllerPath = Reflect.getMetadata('controller:path', controller) || '';
      const items: ControllerItem[] = Reflect.getMetadata('controller:items', controller) || [];

      // Register event listeners and emitters
      this.eventManager.registerListeners(controllerInstance);
      this.eventManager.registerEmitters(controllerInstance);

      // If this is a middleware controller, ensure all methods without decorators are treated as middleware
      if (this.isMiddlewareController(controller)) {
        this.ensureMiddlewareMethods(controller, items);
      }

      // If this is an error handler controller, get error handler items
      if (this.isErrorHandlerController(controller)) {
        const errorHandlerItems: ControllerItem[] =
          Reflect.getMetadata('controller:errorHandlers', controller) || [];
        items.push(...errorHandlerItems);
      }

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
   * Ensure all methods without decorators in a middleware controller are treated as middleware
   */
  private ensureMiddlewareMethods(
    controller: AppControllerType,
    existingItems: ControllerItem[],
  ): void {
    const existingMethodNames = existingItems.map((item) => item.propertyKey);

    // Get all method names from the prototype
    const methodNames = Object.getOwnPropertyNames(controller.prototype).filter(
      (name) => name !== 'constructor' && typeof controller.prototype[name] === 'function',
    );

    // Find methods that don't have any decorators (not in existingItems)
    const methodsWithoutDecorators = methodNames.filter(
      (methodName) => !existingMethodNames.includes(methodName),
    );

    // Add middleware items for methods without decorators
    const newMiddlewareItems = methodsWithoutDecorators.map((methodName) => ({
      type: 'middleware' as const,
      handler: controller.prototype[methodName],
      propertyKey: methodName,
    }));

    // Combine existing items (routes) with new middleware items
    const allItems = [...existingItems, ...newMiddlewareItems];

    // Update the metadata with combined items
    Reflect.defineMetadata('controller:items', allItems, controller);
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

      // Share providers from parent to child module
      moduleInstance.shareParentProviders(this.allProviders);

      importedModuleInstances.push(moduleInstance);

      // Register the imported module's own providers in the DI container
      moduleInstance.registerAllProviders();

      // Bootstrap the imported module as a child (without re-registering providers)
      await moduleInstance.bootstrapChild();
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
      const fullModulePath = normalizePath(modulePath, importedPath);

      this.processControllers(importedControllers, fullModulePath);
    }
  }

  /**
   * Bootstrap the application module
   * Orchestrates the entire initialization process using multiple patterns
   */
  async bootstrap() {
    if (this.bootstrapped) return this;

    const { path: modulePath = '/', controllers = [], imports = [] } = this.options;

    // Step 1: Register all providers FIRST (including inherited ones) BEFORE any controllers are resolved
    this.registerAllProviders();

    // Step 2: Bootstrap imported modules (Composite pattern)
    const importedModuleInstances = await this.bootstrapImportedModules(imports);

    // Step 3: Process local controllers FIRST (middleware should be registered before routes)
    this.processControllers(controllers, modulePath);

    // Step 4: Process controllers from imported modules (routes)
    this.processImportedModuleControllers(importedModuleInstances, modulePath);

    this.bootstrapped = true;
    return this;
  }

  /**
   * Bootstrap child modules without re-registering providers
   * This is used by child modules to avoid duplicate provider registration
   */
  async bootstrapChild() {
    if (this.bootstrapped) return this;

    const { path: modulePath = '/', controllers = [], imports = [] } = this.options;

    // Skip provider registration for child modules since they're already registered by parent
    // Step 1: Bootstrap imported modules (Composite pattern)
    const importedModuleInstances = await this.bootstrapImportedModules(imports);

    // Step 2: Process local controllers FIRST (middleware should be registered before routes)
    this.processControllers(controllers, modulePath);

    // Step 3: Process controllers from imported modules (routes)
    this.processImportedModuleControllers(importedModuleInstances, modulePath);

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
