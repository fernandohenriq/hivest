import { Inject, Injectable } from '../../../lib/decorators';
import { UserRepo } from './user.repo.interface';

export interface IMemoryDb {
  users: any[];
}

@Injectable()
export class UserRepoMemory implements UserRepo {
  constructor(
    @Inject('MemoryDb')
    private db: IMemoryDb,
  ) {
    this.db['users'] = this.db['users'] || [];
  }

  async create(user: any): Promise<any> {
    this.db.users.push(user);
    return user;
  }

  async findById(userId: string): Promise<any> {
    return this.db.users.find((user) => user.id === userId) || null;
  }

  async update(userId: string, user: any): Promise<any> {
    const index = this.db.users.findIndex((user) => user.id === userId);
    if (index !== -1) {
      this.db.users[index] = user;
      return user;
    }
    return null;
  }
}
