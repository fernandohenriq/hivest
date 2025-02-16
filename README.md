# Lightweight HTTP Framework

A TypeScript-based HTTP layer abstraction inspired by Nest.js, providing modular organization and dependency injection.

## Features

- 🏗️ Module-based architecture (`AppModule`)
- 🎯 Decorator-driven API development
- 💉 Dependency Injection with `tsyringe`
- 🛣️ Hierarchical route management
- ⚙️ Express.js integration
- 🛡️ Type-safe HTTP context handling

## Installation

```bash
npm install express typescript tsyringe reflect-metadata
npm install @types/express @types/node --save-dev
```

## Usage

### Basic Structure

```typescript
// service.ts
@Provider()
export class ExampleService {
  getData() {
    return { message: 'Hello World' };
  }
}

// controller.ts
@Controller('/api')
class ExampleController {
  constructor(
    @Inject('ExampleService')
    private service: ExampleService,
  ) {}

  @HttpGet('/hello')
  getHello(ctx: HttpContext) {
    ctx.res.json(this.service.getData());
  }
}

// app.module.ts
const app = new AppModule({
  controllers: [ExampleController],
  providers: [{ key: 'ExampleService', useClass: ExampleService }],
});

app.start(3000);
```

## Core Concepts

### AppModule

- **Purpose**: Root application organizer
- **Features**:
  - Route composition
  - Dependency management
  - Module imports
  - Express.js integration

### Decorators

| Decorator     | Purpose                       |
| ------------- | ----------------------------- |
| `@Controller` | Defines route controllers     |
| `@HttpGet`    | GET endpoint handler          |
| `@HttpPost`   | POST endpoint handler         |
| `@Provider`   | Injectable service marker     |
| `@Inject`     | Dependency injection resolver |

## Example Project Structure

```
/src
├── modules
│   ├── users
│   │   ├── users.controller.ts
│   │   └── users.service.ts
│   └── products
├── app.module.ts
└── main.ts
```

## Contributing

1. Clone repository
2. Install dependencies
3. Follow architecture guidelines below

# AI Assistant Guidance

## Project Context

**Framework Type**: TypeScript HTTP Abstraction Layer
**Primary Goal**: Simplify Express.js development with Nest.js-like patterns
**Key Packages**: Express, TypeScript, tsyringe

## Architectural Priorities

1. **Module Hierarchy**:

   - AppModule as root organizer
   - Path composition: Module → Controller → Handler
   - DI container management

2. **Decorator System**:

   - Controller/Handler path resolution
   - Provider registration/instantiation
   - Middleware error handling

3. **Type Safety**:
   - HttpContext interface enforcement
   - Request/Response validation
   - Error handling signatures

## Assistance Focus Areas

### Code Generation

- Module configuration templates
- DI-enabled service/controller pairs
- Middleware with error handling

### Problem Solving

- Route path composition issues
- DI resolution failures
- Middleware execution order

### Best Practices

- Module organization strategies
- DI scoping patterns
- Type-safe handler implementations

## Example Patterns

### Service Implementation

```typescript
@Provider()
class DataService {
  private storage: any[] = [];

  create(item: any) {
    this.storage.push(item);
    return item;
  }
}
```

### Controller Implementation

```typescript
@Controller('/items')
class ItemController {
  constructor(
    @Inject('DataService')
    private service: DataService,
  ) {}

  @HttpPost('/')
  createItem(ctx: HttpContext) {
    const newItem = this.service.create(ctx.req.body);
    ctx.res.status(201).json(newItem);
  }
}
```

### Module Configuration

```typescript
const app = new AppModule({
  path: '/v1',
  imports: [FeatureModule],
  controllers: [MainController],
  providers: [
    { key: 'DataService', useClass: DataService },
    { key: 'Logger', useClass: LoggerService },
  ],
});
```

## Common Pitfalls to Flag

1. **DI Token Mismatch**:

   - `@Inject('Token')` ↔ Provider registration key

2. **Path Composition**:

   - Accidental duplicate slashes
   - Missing path segments

3. **Middleware Order**:
   - Error handlers after regular middleware
   - Global vs route-specific placement

```

```
