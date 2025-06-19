import { AppModule } from '../../../lib/module';
import { UserController } from './user.controller';
import { Db, UserRepoMemory } from './user.repo.memory';
import { UserService } from './user.service';

export const userModule = new AppModule({
  path: '/api/users',
  providers: [
    { key: 'UserService', provide: UserService },
    { key: 'UserRepo', provide: UserRepoMemory },
    { key: 'Db', provide: Db },
  ],
  controllers: [UserController],
});
