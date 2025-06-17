import 'reflect-metadata';

import { CompanyController } from './exemple/company.controller';
import { CompanyRepoMemory } from './exemple/company.repo.memory';
import { CompanyService } from './exemple/company.service';
import { UserController } from './exemple/user.controller';
import { Db, UserRepoMemory } from './exemple/user.repo.memory';
import { UserService } from './exemple/user.service';
import { AppModule } from './lib/module';

const mainModule = new AppModule({
  path: '/api',
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
    { key: 'CompanyService', provide: CompanyService },
    {
      key: 'CompanyRepo',
      provide: CompanyRepoMemory,
    },
  ],
  controllers: [UserController, CompanyController],
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
