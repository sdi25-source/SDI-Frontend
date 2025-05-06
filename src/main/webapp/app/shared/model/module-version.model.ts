import { type IModule } from '@/shared/model/module.model';
import { type IFeature } from '@/shared/model/feature.model';
import { type IDomaine } from '@/shared/model/domaine.model';

export interface IModuleVersion {
  id?: number;
  version?: string;
  createDate?: Date | null;
  updateDate?: Date | null;
  notes?: string | null;
  module?: IModule | null;
  features?: IFeature[] | null;
  domaine?: IDomaine | null;
  root?: IModuleVersion | null;
}

export class ModuleVersion implements IModuleVersion {
  constructor(
    public id?: number,
    public version?: string,
    public createDate?: Date | null,
    public updateDate?: Date | null,
    public notes?: string | null,
    public module?: IModule | null,
    public features?: IFeature[] | null,
    public domaine?: IDomaine | null,
    public root?: IModuleVersion | null,
  ) {}
}
