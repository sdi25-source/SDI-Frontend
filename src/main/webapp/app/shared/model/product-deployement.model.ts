import { type IClient } from '@/shared/model/client.model';

export interface IProductDeployement {
  id?: number;
  refContract?: string;
  createDate?: Date | null;
  updateDate?: Date | null;
  notes?: string | null;
  client?: IClient | null;
}

export class ProductDeployement implements IProductDeployement {
  constructor(
    public id?: number,
    public refContract?: string,
    public createDate?: Date | null,
    public updateDate?: Date | null,
    public notes?: string | null,
    public client?: IClient | null,
  ) {}
}
