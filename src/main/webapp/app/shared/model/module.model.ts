import { type IProduct } from '@/shared/model/product.model';

export interface IModule {
  id?: number;
  name?: string;
  description?: string | null;
  createDate?: Date | null;
  updateDate?: Date | null;
  product?:IProduct | null;
}

export class Module implements IModule {
  constructor(
    public id?: number,
    public name?: string,
    public description?: string | null,
    public createDate?: Date | null,
    public updateDate?: Date | null,
    public product?:IProduct | null,
  ) {}
}
