import { AppModule } from '../../../lib/module';
import { CompanyController } from './company.controller';
import { CompanyRepoMemory } from './company.repo.memory';
import { CompanyService } from './company.service';

export const companyModule = new AppModule({
  path: '/api/companies',
  providers: [
    { key: 'CompanyService', provide: CompanyService },
    { key: 'CompanyRepo', provide: CompanyRepoMemory },
  ],
  controllers: [CompanyController],
});
