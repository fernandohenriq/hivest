import 'reflect-metadata';
import { container, inject, injectable } from 'tsyringe';

export function Injectable() {
  return injectable();
}

export function Register(token: string) {
  return (target: new (...args: any[]) => any) => {
    container.registerSingleton(token, target);
    return target;
  };
}

export function Inject(token: string): any {
  return (target: any, propertyKey: string | symbol, parameterIndex: number) => {
    return inject(token)(target, propertyKey, parameterIndex);
  };
}

// Controller decorator to define base path for the controller
export function Controller(options: { path?: string }) {
  return (target: new (...args: any[]) => any) => {
    // Apply Injectable decorator first
    injectable()(target);

    // Store the controller path in metadata
    Reflect.defineMetadata('controller:path', options.path || '', target);
    return target;
  };
}

// Middleware decorator to define middleware class where all methods are treated as middleware
export function Middleware(options?: { path?: string }) {
  return (target: new (...args: any[]) => any) => {
    // Apply Injectable decorator first
    injectable()(target);

    // Store the middleware path in metadata (optional)
    Reflect.defineMetadata('controller:path', options?.path || '', target);

    // Mark this class as a middleware class
    Reflect.defineMetadata('controller:isMiddleware', true, target);

    // Get all method names from the prototype
    const methodNames = Object.getOwnPropertyNames(target.prototype).filter(
      (name) => name !== 'constructor' && typeof target.prototype[name] === 'function',
    );

    // Create middleware items for all methods that don't already have decorators
    const existingItems = Reflect.getMetadata('controller:items', target) || [];
    const existingMethodNames = existingItems.map((item: any) => item.propertyKey);

    const newItems = methodNames
      .filter((methodName) => !existingMethodNames.includes(methodName))
      .map((methodName) => ({
        type: 'middleware',
        handler: target.prototype[methodName],
        propertyKey: methodName,
      }));

    // Combine existing items with new middleware items
    Reflect.defineMetadata('controller:items', [...existingItems, ...newItems], target);

    return target;
  };
}

// Middleware decorator to define middleware methods within a controller
export function HttpMiddleware() {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const items = Reflect.getMetadata('controller:items', target.constructor) || [];
    items.push({
      type: 'middleware',
      handler: descriptor.value,
      propertyKey: String(propertyKey),
    });
    Reflect.defineMetadata('controller:items', items, target.constructor);
    return descriptor;
  };
}

const createHttpMethodDecorator =
  (method: 'post' | 'get' | 'put' | 'patch' | 'delete') =>
  (path?: string) =>
  (target: any, context?: any, ...args: any[]): any => {
    // Handle new decorator proposal (stage 3)
    if (context && typeof context === 'object' && 'name' in context) {
      const items = Reflect.getMetadata('controller:items', target.constructor) || [];
      items.push({
        type: 'route',
        method,
        path: path || '',
        handler: target[context.name],
        propertyKey: context.name,
      });
      Reflect.defineMetadata('controller:items', items, target.constructor);
      return target[context.name];
    }

    // Handle legacy decorator proposal
    const propertyKey = context;
    const descriptor = args[0];
    const items = Reflect.getMetadata('controller:items', target.constructor) || [];
    items.push({
      type: 'route',
      method,
      path: path || '',
      handler: descriptor?.value || target[propertyKey as string],
      propertyKey: String(propertyKey),
    });
    Reflect.defineMetadata('controller:items', items, target.constructor);
    return descriptor?.value || target[propertyKey as string];
  };

export const HttpPost = createHttpMethodDecorator('post');
export const HttpGet = createHttpMethodDecorator('get');
export const HttpPut = createHttpMethodDecorator('put');
export const HttpPatch = createHttpMethodDecorator('patch');
export const HttpDelete = createHttpMethodDecorator('delete');

// Event system decorators
export function EventListener(eventName: string) {
  return (target: any, context?: any, ...args: any[]): any => {
    // Handle new decorator proposal (stage 3)
    if (context && typeof context === 'object' && 'name' in context) {
      const listeners = Reflect.getMetadata('event:listeners', target.constructor) || [];
      listeners.push({
        eventName,
        handler: target[context.name],
        propertyKey: context.name,
      });
      Reflect.defineMetadata('event:listeners', listeners, target.constructor);
      return target[context.name];
    }

    // Handle legacy decorator proposal
    const propertyKey = context;
    const descriptor = args[0];
    const listeners = Reflect.getMetadata('event:listeners', target.constructor) || [];
    listeners.push({
      eventName,
      handler: descriptor?.value || target[propertyKey as string],
      propertyKey: String(propertyKey),
    });
    Reflect.defineMetadata('event:listeners', listeners, target.constructor);
    return descriptor?.value || target[propertyKey as string];
  };
}

export function EventEmitter(eventName: string) {
  return (target: any, context?: any, ...args: any[]): any => {
    // Handle new decorator proposal (stage 3)
    if (context && typeof context === 'object' && 'name' in context) {
      const emitters = Reflect.getMetadata('event:emitters', target.constructor) || [];
      emitters.push({
        eventName,
        propertyKey: context.name,
      });
      Reflect.defineMetadata('event:emitters', emitters, target.constructor);
      return target[context.name];
    }

    // Handle legacy decorator proposal
    const propertyKey = context;
    const descriptor = args[0];
    const emitters = Reflect.getMetadata('event:emitters', target.constructor) || [];
    emitters.push({
      eventName,
      propertyKey: String(propertyKey),
    });
    Reflect.defineMetadata('event:emitters', emitters, target.constructor);
    return descriptor?.value || target[propertyKey as string];
  };
}

/**
 * Decorator para marcar uma classe como middleware de error handler
 * O AppModule detecta automaticamente e registra como error handler
 */
export function ErrorHandlerMiddleware() {
  return (target: new (...args: any[]) => any) => {
    // Apply Injectable decorator first
    injectable()(target);

    // Mark this class as an error handler middleware
    Reflect.defineMetadata('controller:isErrorHandler', true, target);

    // Get all method names from the prototype
    const methodNames = Object.getOwnPropertyNames(target.prototype).filter(
      (name) => name !== 'constructor' && typeof target.prototype[name] === 'function',
    );

    // Create error handler items for all methods
    const errorHandlerItems = methodNames.map((methodName) => ({
      type: 'errorHandler',
      handler: target.prototype[methodName],
      propertyKey: methodName,
    }));

    // Store error handler items in metadata
    Reflect.defineMetadata('controller:errorHandlers', errorHandlerItems, target);

    return target;
  };
}
