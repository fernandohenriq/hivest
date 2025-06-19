import { Injectable } from '../../../lib/decorators';

export interface Company {
  id: string;
  domain: string;
  name: string;
}

@Injectable()
export class CompanyRepoMemory {
  private companies: Company[] = [];

  async create(company: Company): Promise<Company> {
    this.companies.push(company);
    return company;
  }

  async get(id: string): Promise<Company | null> {
    return this.companies.find((company) => company.id === id) || null;
  }

  async update(id: string, data: Partial<Company>): Promise<Company | null> {
    const index = this.companies.findIndex((company) => company.id === id);
    if (index === -1) return null;

    this.companies[index] = { ...this.companies[index], ...data };
    return this.companies[index];
  }
}
