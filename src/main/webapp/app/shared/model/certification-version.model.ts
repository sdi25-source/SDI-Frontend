import { type ICertification } from '@/shared/model/certification.model';

export interface ICertificationVersion {
  id?: number;
  version?: string;
  createDate?: Date | null;
  description?: string | null;
  certification?: ICertification | null;
}

export class CertificationVersion implements ICertificationVersion {
  constructor(
    public id?: number,
    public version?: string,
    public createDate?: Date | null,
    public description?: string | null,
    public certification?: ICertification | null,
  ) {}
}
