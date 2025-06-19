import { inject, injectable } from 'tsyringe';

import { Controller, HttpGet, HttpPost } from '../../../lib/decorators';
import { UserService } from './user.service';

@injectable()
@Controller({ path: '/auth' })
export class AuthController {
  constructor(
    @inject('UserService')
    readonly userService: UserService,
  ) {}

  @HttpPost('/login')
  async login({ req, res }: { req: any; res: any }) {
    // Simulate login logic
    const { username, password } = req.body;
    const user = await this.userService.getUser('1'); // Mock user
    return res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, name: user.name },
      token: 'mock-jwt-token',
    });
  }

  @HttpPost('/register')
  async register({ req, res }: { req: any; res: any }) {
    // Simulate registration logic
    const user = await this.userService.createUser(req.body);
    return res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, name: user.name },
    });
  }

  @HttpGet('/profile')
  async getProfile({ req, res }: { req: any; res: any }) {
    // Simulate getting user profile
    const user = await this.userService.getUser('1'); // Mock user
    return res.status(200).json({
      message: 'Profile retrieved',
      user: { id: user.id, name: user.name },
    });
  }

  @HttpPost('/logout')
  async logout({ req, res }: { req: any; res: any }) {
    // Simulate logout logic
    return res.status(200).json({ message: 'Logout successful' });
  }
}
