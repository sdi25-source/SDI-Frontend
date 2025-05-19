import { type IInfraComponent } from '@/shared/model/infra-component.model';
import type { IComponentType } from '@/shared/model/component-type.model.ts';

export interface IInfraComponentVersion {
  id?: number;
  version?: string;
  description?: string | null;
  createDate?: Date | null;
  updateDate?: Date | null;
  infraComponent?: IInfraComponent | null;
}

export class InfraComponentVersion implements IInfraComponentVersion {
  constructor(
    public id?: number,
    public version?: string,
    public description?: string | null,
    public createDate?: Date | null,
    public updateDate?: Date | null,
    public infraComponent?: IInfraComponent | null,
  ) {}
}
