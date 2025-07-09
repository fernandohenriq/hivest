import { EventManager } from '../event-manager';
import { Controller, EventEmitter, EventListener, HttpPost, Inject } from '../lib/decorators';

// Example service that emits events
@Controller({ path: '/users' })
export class UserService {
  constructor(@Inject('EventManager') private eventManager: EventManager) {}

  @EventEmitter('user.created')
  async createUser(userData: any) {
    // Business logic to create user
    const user = { id: 1, ...userData };

    // Emit the event
    await this.eventManager.emit('user.created', user);

    return user;
  }

  @EventEmitter('user.updated')
  async updateUser(id: number, userData: any) {
    // Business logic to update user
    const user = { id, ...userData };

    // Emit the event
    await this.eventManager.emit('user.updated', user);

    return user;
  }

  @HttpPost('/')
  async createUserEndpoint(ctx: any) {
    const user = await this.createUser(ctx.req.body);
    ctx.res.json(user);
  }
}

// Example service that listens to events
@Controller({ path: '/notifications' })
export class NotificationService {
  constructor(@Inject('EventManager') private eventManager: EventManager) {}

  @EventListener('user.created')
  async onUserCreated(user: any) {
    console.log('User created:', user);
    // Send welcome email, create profile, etc.
    await this.sendWelcomeEmail(user);
  }

  @EventListener('user.updated')
  async onUserUpdated(user: any) {
    console.log('User updated:', user);
    // Update cache, notify admins, etc.
    await this.updateUserCache(user);
  }

  private async sendWelcomeEmail(user: any) {
    // Implementation for sending welcome email
    console.log(`Sending welcome email to ${user.email}`);
  }

  private async updateUserCache(user: any) {
    // Implementation for updating user cache
    console.log(`Updating cache for user ${user.id}`);
  }

  @HttpPost('/send')
  async sendNotification(ctx: any) {
    // Manual event emission
    await this.eventManager.emit('notification.sent', ctx.req.body);
    ctx.res.json({ message: 'Notification sent' });
  }
}

// Example of manual event handling
export class LoggingService {
  constructor(@Inject('EventManager') private eventManager: EventManager) {
    // Manual event registration
    this.eventManager.on('user.created', this.logUserCreated.bind(this));
    this.eventManager.on('user.updated', this.logUserUpdated.bind(this));
    this.eventManager.on('notification.sent', this.logNotification.bind(this));
  }

  private logUserCreated(user: any) {
    console.log(`[LOG] User created at ${new Date().toISOString()}:`, user);
  }

  private logUserUpdated(user: any) {
    console.log(`[LOG] User updated at ${new Date().toISOString()}:`, user);
  }

  private logNotification(notification: any) {
    console.log(`[LOG] Notification sent at ${new Date().toISOString()}:`, notification);
  }
}
