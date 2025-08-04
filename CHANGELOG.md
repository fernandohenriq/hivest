# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.0] - 2025-08-04

### Added

- **Error Handler Middleware System**: Complete error handling system with automatic error capture and standardized responses
- **ErrorHandlerMiddleware Decorator**: `@ErrorHandlerMiddleware()` decorator for marking classes as error handlers
- **Automatic Error Detection**: AppModule automatically detects and registers error handler middlewares
- **Standardized Error Responses**: Consistent JSON error responses with status, message, timestamp, and metadata
- **Express Error Middleware Integration**: Seamless integration with Express error middleware pattern `(err, req, res, next)`
- **Type-Safe Error Handling**: Full TypeScript support with `HttpContext` including optional `err` parameter
- **Automatic Error Logging**: Built-in error logging with request context information
- **Flexible Error Status Codes**: Support for custom error status codes and messages
- **Development Mode Support**: Optional stack trace inclusion in development environment

### Changed

- **Enhanced AppModule**: Integrated error handler detection and registration
- **Controller Processing**: Extended to support error handler controllers alongside routes and middleware
- **Type Definitions**: Added `errorHandler` type to controller items and enhanced `HttpContext` with error support
- **Decorator System**: Extended decorator system to support error handler registration

### Examples

```typescript
// Error handler middleware
@ErrorHandlerMiddleware()
export class ErrorMiddleware {
  async handleError({ req, res, err }: HttpContext) {
    if (!err) return;
    
    console.error(`[ERROR] ${req.method} ${req.path}:`, err);
    
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    return res.status(status).json({
      error: {
        message,
        status,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
      }
    });
  }
}

// Controller with error throwing
@HttpGet('/:id')
async get({ req, res }: { req: any; res: any }) {
  const user = await this.userService.getUser(req.params.id);
  
  if (!user) {
    const error: any = new Error('User not found');
    error.status = 404;
    throw error; // Capturado automaticamente pelo ErrorMiddleware
  }
  
  return res.status(200).json(user);
}
```

### Technical Details

- Added `ErrorHandlerMiddleware()` decorator for automatic error handler registration
- Extended `ControllerItem` type to include `errorHandler` type
- Added `isErrorHandlerController()` method for error handler detection
- Implemented `registerErrorHandler()` method for Express error middleware registration
- Enhanced `processControllers()` to handle error handler items
- Updated `HttpContext` type to include optional `err` parameter
- Integrated error handler processing into module bootstrap process

### Migration

- **No Breaking Changes**: Fully compatible with previous versions
- **Optional Feature**: Error handler system is optional and can be adopted gradually
- **Existing APIs Preserved**: All existing decorators and functionality remain unchanged
- **Automatic Integration**: Error handlers are automatically detected and registered when using `@ErrorHandlerMiddleware()`

## [0.7.3] - 2025-08-02

### Fixed

- **Type Safety Improvements**: Enhanced generic type parameters for `HttpRequest`, `HttpResponse`, and `HttpError` types to default to object types, improving type safety and flexibility in handling request and response data
- **Consistent Type Definitions**: Ensured consistency across HTTP type definitions to better accommodate various data structures and reduce type casting requirements
- **Better IntelliSense Support**: Improved TypeScript IntelliSense and autocomplete for HTTP context objects

### Technical Details

- Updated `HttpRequest<T = { [key: string]: any }>` to provide better default typing
- Updated `HttpResponse<T = { [key: string]: any }>` for consistent response handling
- Updated `HttpError<T = { [key: string]: any }>` for flexible error data structures
- All HTTP types now provide better type inference and safety while maintaining backward compatibility

### Migration

- **No Breaking Changes**: This is a type safety improvement release. No code changes are required for existing users, but TypeScript will provide better type checking and IntelliSense support.

## [0.7.2] - 2025-07-30

### Fixed

- **Path Normalization**: Fixed route registration to properly handle path concatenation and eliminate duplicate slashes. Routes like `/auth//login` and `/users//:id` are now correctly normalized to `/auth/login` and `/users/:id`.
- **Module Path Handling**: Improved path construction for imported modules to ensure clean, normalized URLs across complex module hierarchies.

### Technical Details

- Added `normalizePath()` utility function that joins path segments and removes duplicate slashes
- Updated `registerRoute()` method to use proper path normalization
- Updated `processImportedModuleControllers()` method for consistent path handling
- Uses regex `/\/+/g` to replace multiple consecutive slashes with single slash

### Migration

- **No Breaking Changes**: This is a bugfix release. No code changes are required for existing users, but route URLs will now be properly normalized without duplicate slashes.

## [0.7.1] - 2025-07-13

### Fixed

- **Provider Inheritance**: Providers defined in parent modules are now correctly available to all imported child modules and their controllers. This fixes issues where services or repositories registered in a parent module could not be injected into controllers of imported modules.
- **Internal Improvements**: Improved the module bootstrap process to ensure all providers are registered before any controllers are resolved, preventing DI errors in complex module hierarchies.

### Migration

- **No Breaking Changes**: This is a bugfix and internal improvement release. No code changes are required for existing users, but provider injection in nested modules will now work as expected.

## [0.7.0] - 2025-07-09

### Added

- **Event-Driven Architecture**: Complete event system implementation with decorators
- **Event Manager Service**: Centralized event management with automatic registration
- **Event Listener Decorator**: `@EventListener(eventName)` for automatic event handling
- **Event Emitter Decorator**: `@EventEmitter(eventName)` for marking event-emitting methods
- **Automatic Event Registration**: Controllers automatically register their event listeners and emitters
- **Type-Safe Event System**: Full TypeScript support with generic event handlers
- **Async Event Support**: Handles both synchronous and asynchronous event handlers
- **Error Handling**: Graceful error handling for event handlers with logging
- **Manual Event Control**: Support for manual event registration and emission
- **Event Manager Access**: `getEventManager()` method for direct event manager access

### Changed

- **Enhanced AppModule**: Integrated event manager into the module system
- **Controller Processing**: Controllers now automatically register event listeners and emitters
- **Type Definitions**: Added event-related types to the existing type system
- **Decorator System**: Extended decorator system to support event handling

### Examples

```typescript
// Service that emits events
@Controller({ path: '/users' })
export class UserService {
  constructor(@Inject('EventManager') private eventManager: EventManager) {}

  @EventEmitter('user.created')
  async createUser(userData: any) {
    const user = { id: 1, ...userData };
    await this.eventManager.emit('user.created', user);
    return user;
  }
}

// Service that listens to events
@Controller({ path: '/notifications' })
export class NotificationService {
  @EventListener('user.created')
  async onUserCreated(user: any) {
    console.log('User created:', user);
    await this.sendWelcomeEmail(user);
  }
}
```

### Technical Details

- Added `EventHandler<T>`, `EventListenerMetadata`, and `EventEmitterMetadata` types
- Implemented `EventManager` class with event registration, emission, and management
- Extended decorator system to support both legacy and new decorator proposals
- Integrated event manager into `AppModule` constructor and controller processing
- Added event manager access method for manual event control
- Updated exports to include event system components

### Migration

- **No Breaking Changes**: Fully compatible with previous versions
- **Optional Feature**: Event system is optional and can be adopted gradually
- **Existing APIs Preserved**: All existing decorators and functionality remain unchanged

## [0.6.1] - 2025-07-09

### Fixed

- **Controller Processing Order**: Fixed the order of controller processing in the bootstrap method
- **Middleware Registration**: Local controllers (including middleware) are now processed before imported module controllers
- **Route Registration**: Ensures middleware is registered before routes for proper execution order
- **Import Module Processing**: Imported module controllers are processed after local controllers

### Technical Details

- Changed Step 4 and Step 5 in `AppModule.bootstrap()` method
- Local controllers are now processed first: `this.processControllers(controllers, modulePath)`
- Imported module controllers are processed second: `this.processImportedModuleControllers(importedModuleInstances, modulePath)`
- This ensures proper middleware-to-route execution order

## [0.6.0] - 2025-06-27

### Added

- **Automatic Middleware System**: New `@Middleware()` decorator that automatically treats all methods without HTTP decorators as middleware
- **Optional Path Support**: Path parameter in `@Middleware` is now optional (`@Middleware()` or `@Middleware({ path: '/route' })`)
- **Automatic Detection**: System automatically detects middleware classes and processes their methods
- **Simplified Middleware Creation**: No need to decorate each middleware method individually
- **Mixed Middleware and Routes**: Can mix middleware methods and route methods in the same class
- **Global Middleware Support**: Middleware without path executes on all routes
- **Path-Specific Middleware**: Middleware with path executes only on matching routes

### Changed

- **Middleware Registration**: Middleware classes are now registered as controllers in the module
- **Simplified API**: Reduced boilerplate for middleware creation and registration
- **Enhanced Flexibility**: More flexible middleware system with automatic method detection
- **Improved Organization**: Better organization of middleware logic in dedicated classes

### Examples

```typescript
// Global middleware
@Middleware()
export class LogMiddleware {
  async log({ req, next }) {
    console.log(`[LOG] ${req.method} ${req.path}`);
    next();
  }

  // This method has a decorator, so it becomes a route
  @HttpGet('/test')
  async test({ req, res }) {
    console.log(`[TEST] ${req.method} ${req.path}`);
    res.json({ message: 'test' });
  }
}

// Path-specific middleware with routes
@Middleware({ path: '/auth' })
export class AuthMiddleware {
  async validateToken({ req, res, next }) {
    // Middleware logic
    next();
  }

  @HttpPost('/login') // This becomes a route
  async login({ req, res }) {
    return res.json({ message: 'Login successful' });
  }
}
```

### Migration

- **No Breaking Changes**: Fully compatible with previous versions
- **Existing APIs Preserved**: All existing decorators and functionality remain unchanged
- **Optional Upgrade**: New middleware system is optional and can be adopted gradually

## [0.5.0] - 2025-06-27

### Changed

- **Controller Decorator Enhancement**: `@Controller()` decorator now automatically includes `@Injectable()` functionality
- **Simplified API**: Removed the need to use both `@Injectable()` and `@Controller()` decorators together
- **Updated Documentation**: README examples updated to reflect the simplified decorator usage
- **Better Developer Experience**: Reduced boilerplate code for controller definitions

### Migration

- **Breaking Change**: Controllers no longer need the `@Injectable()` decorator when using `@Controller()`
- **Before**: `@Injectable() @Controller({ path: '/users' }) class UserController`
- **After**: `@Controller({ path: '/users' }) class UserController`

## [0.4.0] - 2025-06-27

### Added

- **Middleware Support**: Added `@HttpMiddleware()` decorator for defining middleware methods within controllers
- **Design Patterns Implementation**: Implemented Strategy, Composite, Template Method, and Visitor patterns for clean architecture
- **Enhanced Type Safety**: Added comprehensive type definitions for controller items and route contexts
- **Improved Documentation**: Added detailed JSDoc comments in English for all methods and classes
- **Better Error Handling**: Enhanced error handling with proper TypeScript error types

### Changed

- **AppModule Refactoring**: Completely refactored AppModule class to eliminate code duplication
- **Architecture Improvements**: Applied clean architecture principles with separation of concerns
- **Provider Registration**: Centralized provider registration logic with Strategy pattern
- **Controller Processing**: Unified controller processing logic for both local and imported modules
- **Route Registration**: Separated route and middleware registration into dedicated methods
- **Module Hierarchy**: Improved module inheritance and composition with Composite pattern
- **Decorator Simplification**: Removed order property from decorators for simpler implementation

### Architecture Patterns

- **Strategy Pattern**: For handling different provider types and controller item types
- **Composite Pattern**: For managing module hierarchy and provider inheritance
- **Template Method Pattern**: For consistent controller processing across modules
- **Visitor Pattern**: For processing controllers from imported modules

### Performance

- **Reduced Code Duplication**: Eliminated redundant code in route and middleware registration
- **Optimized Processing**: Improved efficiency in controller and provider processing
- **Better Memory Usage**: More efficient module composition and inheritance

## [0.3.0] - 2025-06-25

### Added

- Added comprehensive HTTP type definitions for better type safety
- Introduced `HttpContext` interface with `req`, `res`, `next`, and optional `err` properties
- Added `HttpRequest` type with detailed request properties including headers, cookies, and metadata
- Added `HttpResponse` type with response methods like `status()`, `json()`, `send()`
- Added `HttpNext` type for middleware continuation function
- Added `HttpError` type for error handling with optional status and message properties
- All types are now exported from the main package for external use
- Enhanced type safety across all controller examples

### Changed

- Updated all controller examples to use the new `HttpContext` interface
- Improved type definitions for better IntelliSense and development experience
- Enhanced error handling with proper TypeScript error types

## [0.2.0] - 2025-06-25

### Added

- Added `getApp()` method to AppModule class for direct access to Express application instance
- This allows developers to access the underlying Express app for custom middleware or advanced configurations

## [0.1.1] - 2025-06-19

### Fixed

- Fixed decorator compatibility issues with TypeScript's new decorator proposal
- Updated HTTP method decorators to handle both legacy and new decorator signatures
- Fixed parameter injection decorators for constructor dependencies
- Improved TypeScript configuration for better decorator support

### Changed

- Updated decorator implementation to be compatible with TypeScript 5.x
- Enhanced error handling in decorator functions

## [0.1.0] - 2025-06-19

### Added

- Initial release of Hivest framework
- AppModule with hierarchical module support
- Controller decorator with path configuration
- HTTP method decorators (HttpGet, HttpPost, HttpPut, HttpPatch, HttpDelete)
- Dependency injection with tsyringe integration
- Provider inheritance between parent and child modules
- Example modules and controllers
- TypeScript support with type definitions
