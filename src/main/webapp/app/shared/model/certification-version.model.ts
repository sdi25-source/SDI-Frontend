import { type IProduct } from '@/shared/model/product.model';
import { type ICertification } from '@/shared/model/certification.model';

export interface ICertificationVersion {
  id?: number;
  version?: string;
  createDate?: Date | null;
  expireDate?: Date | null;
  description?: string | null;
  certification?: ICertification | null;
}

export class CertificationVersion implements ICertificationVersion {
  constructor(
    public id?: number,
    public version?: string,
    public createDate?: Date | null,
    public expireDate?: Date | null,
    public description?: string | null,
    public products?: IProduct[] | null,
    public certifications?: ICertification[] | null,
  ) {}
}
