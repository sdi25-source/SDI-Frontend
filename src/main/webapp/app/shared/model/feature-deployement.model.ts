import { type IFeature } from '@/shared/model/feature.model';
import { type IModuleDeployement } from '@/shared/model/module-deployement.model';

export interface IFeatureDeployement {
  id?: number;
  code?: string;
  createDate?: Date | null;
  updateDate?: Date | null;
  notes?: string | null;
  feature?: IFeature | null;
  moduleDeployement?: IModuleDeployement | null;
}

export class FeatureDeployement implements IFeatureDeployement {
  constructor(
    public id?: number,
    public code?: string,
    public createDate?: Date | null,
    public updateDate?: Date | null,
    public notes?: string | null,
    public feature?: IFeature | null,
    public moduleDeployement?: IModuleDeployement | null,
  ) {}
}
