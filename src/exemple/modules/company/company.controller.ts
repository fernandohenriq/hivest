import { HttpGet, HttpPost, HttpPut, Inject, Injectable } from '../../../lib/decorators';
import { Company, CompanyRepoMemory } from './company.repo.memory';
import { CompanyService } from './company.service';

@Injectable()
export class CompanyController {
  constructor(@Inject('CompanyService') private readonly companyService: CompanyService) {}

  @HttpPost('/')
  async create(ctx: { req: any; res: any }): Promise<void> {
    const company = await this.companyService.create(ctx.req.body);
    ctx.res.json(company);
  }

  @HttpGet('/:id')
  async get(ctx: { req: any; res: any }): Promise<void> {
    const company = await this.companyService.get(ctx.req.params.id);
    ctx.res.json(company);
  }

  @HttpPut('/:id')
  async update(ctx: { req: any; res: any }): Promise<void> {
    const company = await this.companyService.update(ctx.req.params.id, ctx.req.body);
    ctx.res.json(company);
  }
}
