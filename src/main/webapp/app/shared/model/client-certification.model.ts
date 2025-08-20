import { type IClient } from '@/shared/model/client.model';
import { type ICertificationVersion } from '@/shared/model/certification-version.model';
import { type IProduct } from '@/shared/model/product.model';
import { type IProductDeployement } from '@/shared/model/product-deployement.model';

export interface IClientCertification {
  id?: number;
  certification?: string;
  certificationDate?: Date | null;
  createDate?: Date | null;
  expireDate?: Date | null;
  notes?: string | null;
  client?: IClient | null;
  certificationVersion?: ICertificationVersion | null;
  product?: IProduct | null;
  productDeployements?: IProductDeployement[] | null;
}

export class ClientCertification implements IClientCertification {
  constructor(
    public id?: number,
    public certification?: string,
    public certificationDate?: Date | null,
    public createDate?: Date | null,
    public expireDate?: Date | null,
    public notes?: string | null,
    public client?: IClient | null,
    public certificationVersion?: ICertificationVersion | null,
    public product?: IProduct | null,
    public productDeployements?: IProductDeployement[] | null,
  ) {}
}
