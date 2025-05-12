import { type IProductLine } from '@/shared/model/product-line.model';
import { type IModule } from '@/shared/model/module.model';
import { type IInfraComponentVersion } from '@/shared/model/infra-component-version.model';

export interface IProduct {
  id?: number;
  name?: string;
  logo?: string | null;
  description?: string | null;
  createDate?: Date | null;
  updateDate?: Date | null;
  productLines?: IProductLine[] | null;
  modules?: IModule[] | null;
  infraComponentVersions?: IInfraComponentVersion[] | null;
}

export class Product implements IProduct {
  constructor(
    public id?: number,
    public name?: string,
    public logo?: string | null,
    public description?: string | null,
    public createDate?: Date | null,
    public updateDate?: Date | null,
    public productLines?: IProductLine[] | null,
    public modules?: IModule[] | null,
    public infraComponentVersions?: IInfraComponentVersion[] | null,
  ) {}
}
