# Hivest

A lightweight, modular HTTP framework for TypeScript with built-in dependency injection.

## Installation

```bash
npm install hivest
```

## Features

- **Routing**: Easy request handling with decorator-based route definitions
- **Dependency Injection**: Simple DI container based on TSyringe
- **Modular Architecture**: Organize your application into modules
- **Middleware Support**: Apply middleware to specific routes or controllers

## Core Components

### Decorators

- **`@Controller(path)`**: Define a controller with an optional base path
- **HTTP Methods**: `@HttpGet()`, `@HttpPost()`, `@HttpPut()`, `@HttpPatch()`, `@HttpDelete()`
- **Dependency Injection**: `@Provider()` for services, `@Inject(token)` for injecting dependencies
- **Middleware**: `@HttpMiddleware(path, options)` for route-specific middleware

### Classes

- **`AppModule`**: The main application container that manages dependencies and HTTP routes
- **`HttpContext`**: Contains the request, response, and next function for each HTTP request

## Quick Start Example

```typescript
import { AppModule, Controller, HttpContext, HttpGet, HttpPost, Inject, Provider } from 'hivest';

// Define a service
@Provider()
class UserService {
  private users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
  ];

  getAll() {
    return this.users;
  }

  create(user: any) {
    const newUser = { ...user, id: this.users.length + 1 };
    this.users.push(newUser);
    return newUser;
  }
}

// Define a controller
@Controller('/users')
class UserController {
  constructor(@Inject('UserService') private userService: UserService) {}

  @HttpGet('/')
  getUsers(ctx: HttpContext) {
    ctx.res.json(this.userService.getAll());
  }

  @HttpPost('/')
  createUser(ctx: HttpContext) {
    const newUser = this.userService.create(ctx.req.body);
    ctx.res.status(201).json(newUser);
  }
}

// Add middleware example
@Controller('/api')
class ApiController {
  @HttpMiddleware('*')
  logRequests(ctx: HttpContext) {
    console.log(`${ctx.req.method} ${ctx.req.url}`);
    ctx.next();
  }

  @HttpGet('/health')
  healthCheck(ctx: HttpContext) {
    ctx.res.json({ status: 'ok' });
  }
}

// Set up and start the application
const app = new AppModule({
  providers: [{ useClass: UserService }, { useClass: UserController }, { useClass: ApiController }],
});

app.start(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
```

## Advanced Usage

### Module Organization

You can organize your application into modules:

```typescript
// User module
const userModule = new AppModule({
  path: '/users',
  providers: [{ useClass: UserService }, { useClass: UserController }],
});

// Authentication module
const authModule = new AppModule({
  path: '/auth',
  providers: [{ useClass: AuthService }, { useClass: AuthController }],
});

// Root application module
const app = new AppModule({
  imports: [userModule, authModule],
  providers: [{ useClass: ApiController }],
});

app.start(3000);
```

## HttpContext

The `HttpContext` object provides access to the Express request, response, and next function:

```typescript
export type HttpContext = {
  req: HttpReq; // Express request with body, params, query, etc.
  res: HttpRes; // Express response with status(), json(), etc.
  next: HttpNext; // Express next function
  err?: HttpErr; // Error object (in error handlers)
};
```

## License

MIT
