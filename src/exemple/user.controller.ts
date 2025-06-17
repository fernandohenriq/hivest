import { inject, injectable } from 'tsyringe';

import { HttpGet, HttpPost, HttpPut } from '../lib/decorators';
import { UserService } from './user.service';

@injectable()
export class UserController {
  constructor(
    @inject('UserService')
    readonly userService: UserService,
  ) {}

  @HttpPost('/users')
  async create({ req, res }: { req: any; res: any }) {
    const user = await this.userService.createUser(req.body);
    return res.status(201).json(user);
  }

  @HttpGet('/users/:id')
  async get({ req, res }: { req: any; res: any }) {
    const user = await this.userService.getUser(req.params.id);
    return res.status(200).json(user);
  }
}
