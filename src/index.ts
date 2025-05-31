import express from 'express';
import 'reflect-metadata';
import { container } from 'tsyringe';

import { UserController } from './exemple/user.controller';
import { Db, UserRepoMemory } from './exemple/user.repo.memory';
import { UserService } from './exemple/user.service';

container.registerSingleton('UserService', UserService);
container.registerSingleton('UserRepo', UserRepoMemory);

export type Provider = { key: string; provide: any } | (new (...args: any[]) => any);
export type Controller = new (...args: any[]) => { [key: string]: any };

export class AppModule {
  private app: express.Application = express();
  private initialized: boolean = false;
  private bootstrapped: boolean = false;

  constructor(
    readonly options: {
      path?: string;
      providers: Provider[];
      controllers: Controller[];
    },
  ) {
    this.app.use(express.json());
  }

  async bootstrap() {
    if (this.bootstrapped) return this;

    const { path: modulePath = '/', providers, controllers } = this.options;

    // register providers
    for (const provider of providers) {
      const key = provider instanceof Function ? provider.name : provider.key;
      const provide = provider instanceof Function ? provider : provider.provide;
      container.registerSingleton(key, provide);
    }

    // resolve controllers
    for (const controller of controllers) {
      const controllerInstance = container.resolve(controller);
      const routes: {
        method: 'get' | 'post' | 'put' | 'patch' | 'delete';
        path: string;
        handler: (ctx: { req: any; res: any; next: Function }) => Promise<any>;
        propertyKey: string;
      }[] = Reflect.getMetadata('controller:routes', controller) || [];
      for (const route of routes) {
        const fullPath = `${modulePath}${route.path}`.replace('//', '/');
        this.app[route.method](fullPath, (req: any, res: any, next: Function) => {
          const ctx = { req, res, next };
          try {
            return controllerInstance[route.propertyKey](ctx);
          } catch (error) {
            next(error);
          }
        });
      }
    }
    this.bootstrapped = true;
    return this;
  }

  async listen(port: number) {
    if (this.initialized) return this;
    if (!this.bootstrapped) await this.bootstrap();
    this.app.listen(port, () => {
      console.info(`Server is running on port ${port}`);
    });
    this.initialized = true;
    return this;
  }
}

const mainModule = new AppModule({
  path: '/',
  providers: [
    { key: 'UserService', provide: UserService },
    {
      key: 'UserRepo',
      provide: UserRepoMemory,
    },
    {
      key: 'Db',
      provide: Db,
    },
  ],
  controllers: [UserController],
});

(async () => {
  await mainModule.listen(3000);

  const userCreated = await fetch('http://localhost:3000/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: '1', name: 'John Doe' }),
  }).then((res) => res.json());
  console.log('CREATE', userCreated);

  const userFound = await fetch('http://localhost:3000/1').then((res) => res.json());
  console.log('GET', userFound);
})();

// import 'reflect-metadata';
// import { container } from 'tsyringe';

// import { UserController } from './exemple/user.controller';
// import { UserRepoMemory } from './exemple/user.repo.memory';
// import { UserService } from './exemple/user.service';

// container.registerSingleton('UserService', UserService);
// container.registerSingleton('UserRepo', UserRepoMemory);

// (async () => {
//   const userController = container.resolve(UserController);
//   const userCreated = await userController.create({ id: '1', name: 'John Doe' });
//   console.log('CREATE', userCreated);

//   const userFound = await userController.get('1');
//   console.log('GET', userFound);

//   const updatedUser = await userController.update('1', { name: 'Jane Doe' });
//   console.log('UPDATE', updatedUser);
// })();
