import { inject, injectable } from 'tsyringe';

import { Controller, HttpGet, HttpPut } from '../../../lib/decorators';
import { UserService } from './user.service';

@injectable()
@Controller({ path: '/settings' })
export class SettingsController {
  constructor(
    @inject('UserService')
    readonly userService: UserService,
  ) {}

  @HttpGet('/')
  async getSettings({ req, res }: { req: any; res: any }) {
    // Simulate getting user settings
    const user = await this.userService.getUser('1'); // Mock user
    return res.status(200).json({
      message: 'Settings retrieved',
      settings: {
        theme: 'dark',
        language: 'en',
        notifications: true,
        userId: user.id,
      },
    });
  }

  @HttpPut('/theme')
  async updateTheme({ req, res }: { req: any; res: any }) {
    // Simulate updating theme
    const { theme } = req.body;
    return res.status(200).json({
      message: 'Theme updated successfully',
      theme: theme || 'dark',
    });
  }

  @HttpPut('/notifications')
  async updateNotifications({ req, res }: { req: any; res: any }) {
    // Simulate updating notifications
    const { enabled } = req.body;
    return res.status(200).json({
      message: 'Notifications updated successfully',
      notifications: enabled !== false,
    });
  }
}
