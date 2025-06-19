import { AppModule } from '../../../lib/module';
import { UserController } from './user.controller';
import { IMemoryDb, UserRepoMemory } from './user.repo.memory';
import { UserService } from './user.service';

class MemoryDb implements IMemoryDb {
  users: any[] = [];
}

export const userModule = new AppModule({
  path: '/api/users',
  providers: [
    { key: 'UserService', provide: UserService },
    { key: 'UserRepo', provide: UserRepoMemory },
    {
      key: 'MemoryDb',
      provide: {},
    },
  ],
  controllers: [UserController],
});
