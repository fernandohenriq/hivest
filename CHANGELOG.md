# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
