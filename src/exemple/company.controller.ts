import { HttpGet, HttpPost, HttpPut, Inject, Injectable } from '../lib/decorators';
import { Company, CompanyRepoMemory } from './company.repo.memory';
import { CompanyService } from './company.service';

@Injectable()
export class CompanyController {
  constructor(@Inject('CompanyService') private readonly companyService: CompanyService) {}

  @HttpPost('/')
  async create(company: Company): Promise<Company> {
    return this.companyService.create(company);
  }

  @HttpGet('/:id')
  async get(id: string): Promise<Company | null> {
    return this.companyService.get(id);
  }

  @HttpPut('/:id')
  async update(id: string, data: Partial<Company>): Promise<Company | null> {
    return this.companyService.update(id, data);
  }
}
