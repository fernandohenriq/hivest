import { Inject, Injectable } from '../../../lib/decorators';
import { UserRepo } from './user.repo.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepo')
    readonly userRepo: UserRepo,
  ) {}

  async createUser(userData: any) {
    const user = await this.userRepo.create(userData);
    return user;
  }

  async getUser(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) return null;
    return user;
  }

  async updateUser(userId: string, userData: any) {
    const user = await this.userRepo.update(userId, userData);
    if (!user) return null;
    return user;
  }
}
