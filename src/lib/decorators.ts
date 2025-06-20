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
    // Store the controller path in metadata
    Reflect.defineMetadata('controller:path', options.path || '', target);
    return target;
  };
}

const createHttpMethodDecorator =
  (method: 'post' | 'get' | 'put' | 'patch' | 'delete') =>
  (path?: string) =>
  (target: any, context?: any, ...args: any[]): any => {
    // Handle new decorator proposal (stage 3)
    if (context && typeof context === 'object' && 'name' in context) {
      const routes = Reflect.getMetadata('controller:routes', target.constructor) || [];
      routes.push({
        method,
        path: path || '',
        handler: target[context.name],
        propertyKey: context.name,
      });
      Reflect.defineMetadata('controller:routes', routes, target.constructor);
      return target[context.name];
    }

    // Handle legacy decorator proposal
    const propertyKey = context;
    const descriptor = args[0];
    const routes = Reflect.getMetadata('controller:routes', target.constructor) || [];
    routes.push({
      method,
      path: path || '',
      handler: descriptor?.value || target[propertyKey as string],
      propertyKey: String(propertyKey),
    });
    Reflect.defineMetadata('controller:routes', routes, target.constructor);
    return descriptor?.value || target[propertyKey as string];
  };

export const HttpPost = createHttpMethodDecorator('post');
export const HttpGet = createHttpMethodDecorator('get');
export const HttpPut = createHttpMethodDecorator('put');
export const HttpPatch = createHttpMethodDecorator('patch');
export const HttpDelete = createHttpMethodDecorator('delete');
