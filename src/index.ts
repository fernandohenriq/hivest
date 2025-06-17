import 'reflect-metadata';

import { CompanyController } from './exemple/company.controller';
import { CompanyRepoMemory } from './exemple/company.repo.memory';
import { CompanyService } from './exemple/company.service';
import { UserController } from './exemple/user.controller';
import { Db, UserRepoMemory } from './exemple/user.repo.memory';
import { UserService } from './exemple/user.service';
import { AppModule } from './lib/module';

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
    { key: 'CompanyService', provide: CompanyService },
    {
      key: 'CompanyRepo',
      provide: CompanyRepoMemory,
    },
  ],
  controllers: [UserController, CompanyController],
});

async function fetchJson(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

(async () => {
  await mainModule.listen(3000);
  console.log('Server is running on port 3000');

  try {
    // Test company endpoints
    const companyCreated = await fetchJson('http://localhost:3000/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: '1', name: 'Acme Corp', domain: 'acme.com' }),
    });
    console.log('CREATE COMPANY', companyCreated);

    const companyFound = await fetchJson('http://localhost:3000/companies/1');
    console.log('GET COMPANY', companyFound);

    // Test user endpoints
    const userCreated = await fetchJson('http://localhost:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: '1', name: 'John Doe' }),
    });
    console.log('CREATE USER', userCreated);

    const userFound = await fetchJson('http://localhost:3000/users/1');
    console.log('GET USER', userFound);
  } catch (error) {
    console.error('Error during tests:', error);
  }
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
