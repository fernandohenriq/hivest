import { injectable } from 'tsyringe';

import { HttpMethods, HttpMiddlewareOptions } from './app-interfaces';

export const Inject =
  (token: string) => (target: any, key: string | symbol | undefined, index?: number) => {
    Reflect.defineMetadata('design:inject', token, target, key!);
    injectable()(target);
  };

export const Provider = () => (target: any) => {
  injectable()(target);
};

export const Controller = (path?: string) => (target: any) => {
  Reflect.defineMetadata('controller:path', path || '', target);
  injectable()(target);
};

const createHttpMethodDecorator =
  (method: HttpMethods) =>
  (path?: string) =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const routes = Reflect.getMetadata('controller:routes', target.constructor) || [];
    routes.push({
      method,
      path: path || '',
      handler: descriptor.value,
    });
    Reflect.defineMetadata('controller:routes', routes, target.constructor);
  };

export const HttpPost = createHttpMethodDecorator('post');
export const HttpGet = createHttpMethodDecorator('get');
export const HttpPut = createHttpMethodDecorator('put');
export const HttpPatch = createHttpMethodDecorator('patch');
export const HttpDelete = createHttpMethodDecorator('delete');

export const HttpMiddleware =
  (path?: string, options?: HttpMiddlewareOptions) =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const middlewares = Reflect.getMetadata('controller:middlewares', target.constructor) || [];
    middlewares.push({
      path: path || '*',
      options,
      handler: descriptor.value,
    });
    Reflect.defineMetadata('controller:middlewares', middlewares, target.constructor);
  };
