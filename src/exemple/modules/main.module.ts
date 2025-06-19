import { AppModule } from '../../lib/module';
import { companyModule } from './company/company.module';
import { userModule } from './user/user.module';

export const mainModule = new AppModule({
  path: '/api',
  imports: [userModule, companyModule],
});
