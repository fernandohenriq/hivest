import 'reflect-metadata';

export * from './app-decorators';
export * from './app-interfaces';
export * from './app-module';

if (process.env.NODE_ENV === 'development') {
  require('./example');
}
