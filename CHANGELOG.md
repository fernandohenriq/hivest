# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2024-12-19

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

## [0.3.0] - 2024-12-19

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

## [0.2.0] - 2024-12-19

### Added

- Added `getApp()` method to AppModule class for direct access to Express application instance
- This allows developers to access the underlying Express app for custom middleware or advanced configurations

## [0.1.1] - 2024-06-19

### Fixed

- Fixed decorator compatibility issues with TypeScript's new decorator proposal
- Updated HTTP method decorators to handle both legacy and new decorator signatures
- Fixed parameter injection decorators for constructor dependencies
- Improved TypeScript configuration for better decorator support

### Changed

- Updated decorator implementation to be compatible with TypeScript 5.x
- Enhanced error handling in decorator functions

## [0.1.0] - 2024-06-19

### Added

- Initial release of Hivest framework
- AppModule with hierarchical module support
- Controller decorator with path configuration
- HTTP method decorators (HttpGet, HttpPost, HttpPut, HttpPatch, HttpDelete)
- Dependency injection with tsyringe integration
- Provider inheritance between parent and child modules
- Example modules and controllers
- TypeScript support with type definitions
