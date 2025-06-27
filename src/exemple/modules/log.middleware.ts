import { Middleware } from '../../lib/decorators';
import { HttpContext } from '../../lib/types';

@Middleware()
export class LogMiddleware {
  async log({ req, next }: HttpContext) {
    console.log(`[LOG] ${req.method} ${req.path}`);
    next();
  }
}
