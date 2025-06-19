import { AppModule } from '../../../lib/module';
import { UserController } from './user.controller';
import { IMemoryDb, UserRepoMemory } from './user.repo.memory';
import { UserService } from './user.service';

export class UserModule extends AppModule {
  constructor() {
    super({
      path: '/users',
      controllers: [UserController],
    });
  }
}
