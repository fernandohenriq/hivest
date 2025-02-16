# Hivest

Featherweight modular HTTP framework for TypeScript.

## Installation

```bash
npm install hivest
```

## Core Features

- **Routes**: `@Controller`, `@HttpGet`, `@HttpPost`, `@HttpPut`, `@HttpPatch`, `@HttpDelete`
- **DI**: `@Provider`, `@Inject`
- **Modules**: Combine services/controllers
- **Middleware**: `@HttpMiddleware`

## Example

```typescript
// Service
@Provider()
class UserService {
  private users = [];

  create(user: any) {
    this.users.push(user);
    return user;
  }
}

// Controller
@Controller('/users')
class UserController {
  constructor(@Inject('UserService') private service: UserService) {}

  @HttpPost('/')
  createUser(ctx: HttpContext) {
    ctx.res.status(201).json(this.service.create(ctx.req.body));
  }
}

// App setup
const app = new AppModule({
  providers: [UserService, UserController],
});

app.start(3000);
```

## Key Components

- `AppModule`: Root application class
- `HttpContext`: { req, res, next }
- Decorators: Define routes and dependencies

> **Note**: Educational project, but built thinking about production for small and medium projects.
