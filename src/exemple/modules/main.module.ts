import { AppModule } from '../../lib/module';
import { companyModule } from './company/company.module';
import { userModule } from './user/user.module';

export const mainModule = new AppModule({
  path: '/api',
  providers: [...userModule.options.providers, ...companyModule.options.providers],
  controllers: [...userModule.options.controllers, ...companyModule.options.controllers],
});
