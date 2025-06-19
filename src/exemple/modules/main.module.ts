import { container } from 'tsyringe';

import { AppModule } from '../../lib/module';
import { companyModule } from './company/company.module';
import { userModule } from './user/user.module';

// Create a custom module that properly handles the paths
class MainModule extends AppModule {
  async bootstrap() {
    if ((this as any).bootstrapped) return this;

    const { path: modulePath = '/api' } = this.options;

    // Register providers from both modules
    const allProviders = [
      ...(userModule.options.providers || []),
      ...(companyModule.options.providers || []),
    ];

    // Register providers
    for (const provider of allProviders) {
      if (provider instanceof Function) {
        container.registerSingleton(provider.name, provider);
      } else if ('useValue' in provider) {
        container.registerInstance(provider.key, provider.useValue);
      } else {
        const provide = provider.provide;
        if (provide instanceof Function) {
          container.registerSingleton(provider.key, provide);
        } else {
          container.registerInstance(provider.key, provide);
        }
      }
    }

    // Register controllers with their respective paths
    const userControllers = userModule.options.controllers || [];
    const companyControllers = companyModule.options.controllers || [];

    // Register user controllers
    for (const controller of userControllers) {
      const controllerInstance = container.resolve(controller);
      const routes = Reflect.getMetadata('controller:routes', controller) || [];

      for (const route of routes) {
        const routePath = `${modulePath}/users${route.path}`.replace('//', '/');
        console.log(`Registering route: ${route.method.toUpperCase()} ${routePath}`);

        (this as any).app[route.method](routePath, async (req: any, res: any, next: Function) => {
          try {
            await controllerInstance[route.propertyKey]({ req, res });
          } catch (error) {
            next(error);
          }
        });
      }
    }

    // Register company controllers
    for (const controller of companyControllers) {
      const controllerInstance = container.resolve(controller);
      const routes = Reflect.getMetadata('controller:routes', controller) || [];

      for (const route of routes) {
        const routePath = `${modulePath}/companies${route.path}`.replace('//', '/');
        console.log(`Registering route: ${route.method.toUpperCase()} ${routePath}`);

        (this as any).app[route.method](routePath, async (req: any, res: any, next: Function) => {
          try {
            await controllerInstance[route.propertyKey]({ req, res });
          } catch (error) {
            next(error);
          }
        });
      }
    }

    (this as any).bootstrapped = true;
    return this;
  }
}

export const mainModule = new MainModule({
  path: '/api',
});
