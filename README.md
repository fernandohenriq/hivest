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

## HTTP Status Response Helpers

Hivest provides convenient helper methods on the `res` object to handle common HTTP responses:

### Informational responses (100 – 199)

```typescript
res.continue(data); // 100 Continue
res.switchingProtocols(data); // 101 Switching Protocols
res.processing(data); // 102 Processing
res.earlyHints(data); // 103 Early Hints
```

### Successful responses (200 – 299)

```typescript
res.ok(data); // 200 OK
res.created(data); // 201 Created
res.accepted(data); // 202 Accepted
res.nonAuthoritativeInformation(data); // 203 Non-Authoritative Information
res.noContent(); // 204 No Content
res.resetContent(); // 205 Reset Content
res.partialContent(data); // 206 Partial Content
```

### Redirection messages (300 – 399)

```typescript
res.multipleChoices(data); // 300 Multiple Choices
res.movedPermanently(data); // 301 Moved Permanently
res.found(data); // 302 Found
res.seeOther(data); // 303 See Other
res.notModified(); // 304 Not Modified
res.temporaryRedirect(data); // 307 Temporary Redirect
res.permanentRedirect(data); // 308 Permanent Redirect
```

### Client error responses (400 – 499)

```typescript
res.badRequest(data); // 400 Bad Request
res.unauthorized(data); // 401 Unauthorized
res.paymentRequired(data); // 402 Payment Required
res.forbidden(data); // 403 Forbidden
res.notFound(data); // 404 Not Found
res.methodNotAllowed(data); // 405 Method Not Allowed
res.notAcceptable(data); // 406 Not Acceptable
res.requestTimeout(data); // 408 Request Timeout
res.conflict(data); // 409 Conflict
res.gone(data); // 410 Gone
res.unprocessableEntity(data); // 422 Unprocessable Entity
res.tooManyRequests(data); // 429 Too Many Requests
```

### Server error responses (500 – 599)

```typescript
res.internalServerError(data); // 500 Internal Server Error
res.notImplemented(data); // 501 Not Implemented
res.badGateway(data); // 502 Bad Gateway
res.serviceUnavailable(data); // 503 Service Unavailable
res.gatewayTimeout(data); // 504 Gateway Timeout
```

### Example Usage

```typescript
import { Controller, HttpContext, HttpPost } from 'hivest';

@Controller('/api')
class ApiController {
  @HttpPost('/ping')
  ping({ req, res }: HttpContext) {
    return res.ok('pong'); // 200 OK "pong"
  }

  @HttpPost('/find')
  find({ req, res }: HttpContext) {
    return res.notFound({ message: "can't see" }); // 404 Not Found { message: "can't see" }
  }

  @HttpPost('/error')
  handleError({ req, res }: HttpContext) {
    return res.internalServerError({ message: 'something went wrong' }); // 500 Internal Server Error
  }

  @HttpPost('/user')
  createUser({ req, res }: HttpContext) {
    // After creating a user
    return res.created({ id: 123, name: 'New User' }); // 201 Created
  }
}
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
