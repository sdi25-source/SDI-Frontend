import { type IProduct } from '@/shared/model/product.model';
import { type IModuleVersion } from '@/shared/model/module-version.model';
import { type IInfraComponentVersion } from '@/shared/model/infra-component-version.model';

export interface IProductVersion {
  id?: number;
  version?: string;
  createDate?: Date | null;
  updateDate?: Date | null;
  notes?: string | null;
  product?: IProduct | null;
  moduleVersions?: IModuleVersion[] | null;
  infraComponentVersions?: IInfraComponentVersion[] | null;
  root?: IProductVersion | null;
}

export class ProductVersion implements IProductVersion {
  constructor(
    public id?: number,
    public version?: string,
    public createDate?: Date | null,
    public updateDate?: Date | null,
    public notes?: string | null,
    public product?: IProduct | null,
    public moduleVersions?: IModuleVersion[] | null,
    public infraComponentVersions?: IInfraComponentVersion[] | null,
    public root?: IProductVersion | null,
  ) {}
}
