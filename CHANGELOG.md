# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
