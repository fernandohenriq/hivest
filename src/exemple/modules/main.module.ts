import { AppModule } from '../../lib/module';
import { companyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { IMemoryDb, UserRepoMemory } from './user/user.repo.memory';
import { UserService } from './user/user.service';

class MemoryDb implements IMemoryDb {
  users: any[] = [];
}

export const mainModule = new AppModule({
  path: '/api',
  providers: [
    { key: 'UserService', provide: UserService },
    { key: 'UserRepo', provide: UserRepoMemory },
    {
      key: 'MemoryDb',
      provide: MemoryDb,
    },
  ],
  imports: [UserModule, companyModule],
});
