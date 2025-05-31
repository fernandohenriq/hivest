import { inject, injectable } from 'tsyringe';

import { HttpGet, HttpPost, HttpPut } from '../lib/decorators';
import { UserService } from './user.service';

@injectable()
export class UserController {
  constructor(
    @inject('UserService')
    readonly userService: UserService,
  ) {}

  @HttpPost('/')
  async create({ req, res, next }: any) {
    const user = await this.userService.createUser(req.body);
    return res.status(201).json(user);
  }

  @HttpGet('/:userId')
  async get({ req, res, next }: any) {
    const user = await this.userService.getUser(req.params.userId);
    return res.status(200).json(user);
  }
}
