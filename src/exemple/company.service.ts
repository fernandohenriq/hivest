import { Inject, Injectable } from '../lib/decorators';
import { Company, CompanyRepoMemory } from './company.repo.memory';

@Injectable()
export class CompanyService {
  constructor(@Inject('CompanyRepo') private readonly companyRepo: CompanyRepoMemory) {}

  async create(company: Company): Promise<Company> {
    return this.companyRepo.create(company);
  }

  async get(id: string): Promise<Company | null> {
    return this.companyRepo.get(id);
  }

  async update(id: string, data: Partial<Company>): Promise<Company | null> {
    return this.companyRepo.update(id, data);
  }
}
