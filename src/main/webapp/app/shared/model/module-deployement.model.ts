import { type IModuleVersion } from '@/shared/model/module-version.model';
import { type IProductDeployementDetail } from '@/shared/model/product-deployement-detail.model';

export interface IModuleDeployement {
  id?: number;
  code?: string;
  notes?: string | null;
  createDate?: Date | null;
  updateDate?: Date | null;
  moduleVersion?: IModuleVersion | null;
  productDeployementDetail?: IProductDeployementDetail | null;
}

export class ModuleDeployement implements IModuleDeployement {
  constructor(
    public id?: number,
    public code?: string,
    public notes?: string | null,
    public createDate?: Date | null,
    public updateDate?: Date | null,
    public moduleVersion?: IModuleVersion | null,
    public productDeployementDetail?: IProductDeployementDetail | null,
  ) {}
}
