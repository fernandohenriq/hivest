import { HttpGet, Middleware } from '../../lib/decorators';
import { HttpContext } from '../../lib/types';

@Middleware()
export class LogMiddleware {
  async log({ req, next }: HttpContext) {
    console.log(`[LOG] ${req.method} ${req.path}`);
    next();
  }

  @HttpGet('/test')
  async test({ req, res }: { req: any; res: any }) {
    console.log(`[TEST] ${req.method} ${req.path}`);
    res.json({ message: 'test' });
  }
}
