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

const createHttpMethodDecorator =
  (method: 'post' | 'get' | 'put' | 'patch' | 'delete') =>
  (path?: string) =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const routes = Reflect.getMetadata('controller:routes', target.constructor) || [];
    routes.push({
      method,
      path: path || '',
      handler: descriptor.value,
      propertyKey,
    });
    Reflect.defineMetadata('controller:routes', routes, target.constructor);
    return descriptor;
  };

export const HttpPost = createHttpMethodDecorator('post');
export const HttpGet = createHttpMethodDecorator('get');
export const HttpPut = createHttpMethodDecorator('put');
export const HttpPatch = createHttpMethodDecorator('patch');
export const HttpDelete = createHttpMethodDecorator('delete');
