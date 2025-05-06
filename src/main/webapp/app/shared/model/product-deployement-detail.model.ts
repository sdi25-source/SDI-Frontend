import { type IProductDeployement } from '@/shared/model/product-deployement.model';
import { type IInfraComponentVersion } from '@/shared/model/infra-component-version.model';
import { type IModuleVersion } from '@/shared/model/module-version.model';
import { type IProductVersion } from '@/shared/model/product-version.model';
import { type IDeployementType } from '@/shared/model/deployement-type.model';

export interface IProductDeployementDetail {
  id?: number;
  startDeployementDate?: Date | null;
  endDeployementDate?: Date | null;
  notes?: string | null;
  productDeployement?: IProductDeployement | null;
  infraComponentVersions?: IInfraComponentVersion[] | null;
  allowedModuleVersions?: IModuleVersion[] | null;
  productVersion?: IProductVersion | null;
  deployementType?: IDeployementType | null;
}

export class ProductDeployementDetail implements IProductDeployementDetail {
  constructor(
    public id?: number,
    public startDeployementDate?: Date | null,
    public endDeployementDate?: Date | null,
    public notes?: string | null,
    public productDeployement?: IProductDeployement | null,
    public infraComponentVersions?: IInfraComponentVersion[] | null,
    public allowedModuleVersions?: IModuleVersion[] | null,
    public productVersion?: IProductVersion | null,
    public deployementType?: IDeployementType | null,
  ) {}
}
