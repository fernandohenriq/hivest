import { AppModule } from '../../../lib/module';
import { AuthController } from './auth.controller';
import { SettingsController } from './settings.controller';
import { UserController } from './user.controller';
import { IMemoryDb, UserRepoMemory } from './user.repo.memory';
import { UserService } from './user.service';

export class UserModule extends AppModule {
  constructor() {
    super({
      path: '/users',
      controllers: [UserController, AuthController, SettingsController],
    });
  }
}
