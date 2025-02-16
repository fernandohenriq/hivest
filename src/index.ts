import express, { Application, NextFunction, Request, Response } from 'express';
import 'reflect-metadata';
import { DependencyContainer, container, injectable } from 'tsyringe';

// Interfaces
type HttpMethods = 'post' | 'get' | 'patch' | 'put' | 'delete';

interface HttpReq {
  body: any;
  headers: any;
  params: any;
  query: any;
  method: string;
  url: string;
  originalUrl: string;
  baseUrl: string;
  path: string;
  protocol: string;
  secure: boolean;
  subdomains: string[];
  ip: string;
  ips: string[];
  hostname: string;
  [key: string]: any;
}

interface HttpRes {
  status: (status: number) => HttpRes;
  json: (body: any) => HttpRes;
}

type HttpErr = any;
type HttpNext = (err?: any) => void;

interface HttpContext {
  req: HttpReq;
  res: HttpRes;
  next: HttpNext;
  err?: HttpErr;
}

type HttpHandler = (ctx: HttpContext) => any;
type HttpMiddlewareOptions = { errorHandler?: boolean };

interface ModuleOptions {
  path?: string;
  providers?: { key: string; useClass: any }[];
  imports?: AppModule[];
  controllers?: any[];
}

// Decorators
const Inject =
  (token: string) => (target: any, key: string | symbol | undefined, index?: number) => {
    Reflect.defineMetadata('design:inject', token, target, key!);
    injectable()(target);
  };

const Provider = () => (target: any) => {
  injectable()(target);
};

const Controller = (path?: string) => (target: any) => {
  Reflect.defineMetadata('controller:path', path || '', target);
  injectable()(target);
};

const createHttpMethodDecorator =
  (method: HttpMethods) =>
  (path?: string) =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const routes = Reflect.getMetadata('controller:routes', target.constructor) || [];
    routes.push({
      method,
      path: path || '',
      handler: descriptor.value,
    });
    Reflect.defineMetadata('controller:routes', routes, target.constructor);
  };

const HttpPost = createHttpMethodDecorator('post');
const HttpGet = createHttpMethodDecorator('get');
const HttpPut = createHttpMethodDecorator('put');
const HttpPatch = createHttpMethodDecorator('patch');
const HttpDelete = createHttpMethodDecorator('delete');

const HttpMiddleware =
  (path?: string, options?: HttpMiddlewareOptions) =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const middlewares = Reflect.getMetadata('controller:middlewares', target.constructor) || [];
    middlewares.push({
      path: path || '*',
      options,
      handler: descriptor.value,
    });
    Reflect.defineMetadata('controller:middlewares', middlewares, target.constructor);
  };

// AppModule
class AppModule {
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

    // Register providers
    module.options.providers?.forEach((provider) => {
      this.container.register(provider.key, { useClass: provider.useClass });
    });

    // Process imported modules
    await Promise.all(module.options.imports?.map((m) => this.initModules(m, visited)) ?? []);
  }

  private createExpressHandler(handler: HttpHandler) {
    return async (req: Request, res: Response, next: NextFunction) => {
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
      ...(this.options.controllers || []),
      ...(this.options.imports?.flatMap((m) => m.options.controllers || []) || []),
    ];

    // Initialize Express
    this.expressApp = express();
    this.expressApp.use(express.json());

    // Process controllers
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
            router.use(path, (err: any, req: Request, res: Response, next: NextFunction) => {
              const ctx: HttpContext = { req: req as HttpReq, res: res as HttpRes, next, err };
              handler.call(controllerInstance, ctx);
            });
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
          const fullPath = [this.options.path, controllerPath, path]
            .filter((p) => p && p !== '/')
            .join('/')
            .replace(/\/+/g, '/');

          router[method](fullPath, this.createExpressHandler(handler.bind(controllerInstance)));
        },
      );

      this.expressApp?.use(router);
    });

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

/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

@Provider()
class LoggerMiddleware {
  @HttpMiddleware()
  httpEntry({ req, res, next }: HttpContext) {
    const timestamp = new Date().toLocaleString();
    const method = req.method;
    const url = req.originalUrl;
    console.info(
      `\x1b[42m[LOGGER]\x1b[0m \x1b[36m[${timestamp}]\x1b[0m \x1b[33m${method}\x1b[0m ${url}`,
    );
    next();
  }
}

@Provider()
class UserService {
  private users = [{ id: 1, name: 'John' }];

  getAllUsers() {
    return this.users;
  }

  createUser(userData: any) {
    const newUser = { id: this.users.length + 1, ...userData };
    this.users.push(newUser);
    return newUser;
  }
}

@Controller('/users')
class UserController {
  constructor(
    @Inject('UserService')
    private userService: UserService,
  ) {}

  @HttpGet('/')
  getAllUsers(ctx: HttpContext) {
    ctx.res.json(this.userService.getAllUsers());
  }

  @HttpPost('/')
  createUser(ctx: HttpContext) {
    ctx.res.status(201).json(this.userService.createUser(ctx.req.body));
  }
}

class UserModule extends AppModule {
  constructor() {
    super({
      path: '/aaa',
      controllers: [UserController],
      providers: [{ key: 'UserService', useClass: UserService }],
    });
  }
}

// Update main AppModule to import UserModule
const appModule = new AppModule({
  path: '/api',
  imports: [new UserModule()],
  providers: [{ key: 'LoggerMiddleware', useClass: LoggerMiddleware }],
  controllers: [],
});

// Test suite
async function runTests() {
  const baseUrl = 'http://localhost:3000/api/users';

  // Users test
  (async function userTests() {
    // Test 1: Get all users
    try {
      const getResponse = await fetch(baseUrl);
      if (!getResponse.ok) throw new Error(`HTTP error! Status: ${getResponse.status}`);
      const users = await getResponse.json();
      console.log('✅ GET /users success:', users);
    } catch (error) {
      console.error('❌ GET /users failed:', error);
    }

    // Test 2: Create new user
    try {
      const postResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User' }),
      });
      if (!postResponse.ok) throw new Error(`HTTP error! Status: ${postResponse.status}`);
      const newUser = await postResponse.json();
      console.log('✅ POST /users success:', newUser);
    } catch (error) {
      console.error('❌ POST /users failed:', error);
    }

    // Test 3: Verify new user exists
    try {
      const verifyResponse = await fetch(baseUrl);
      if (!verifyResponse.ok) throw new Error(`HTTP error! Status: ${verifyResponse.status}`);
      const updatedUsers = await verifyResponse.json();
      console.log('✅ User count after creation:', updatedUsers.length);
    } catch (error) {
      console.error('❌ Verify user count failed:', error);
    }
  })();
}

// Run tests after server starts
appModule.start(3000, () => {
  console.log('Server running on port 3000');
  setTimeout(runTests, 1000); // Wait 1 second for server to start
});
