import { type IComponentType } from '@/shared/model/component-type.model';

export interface IInfraComponent {
  id?: number;
  name?: string;
  vendor?: string | null;
  notes?: string | null;
  createDate?: Date | null;
  componentType?: IComponentType | null;
}

export class InfraComponent implements IInfraComponent {
  constructor(
    public id?: number,
    public name?: string,
    public vendor?: string | null,
    public notes?: string | null,
    public createDate?: Date | null,
    public componentType?: IComponentType | null,
  ) {}
}
