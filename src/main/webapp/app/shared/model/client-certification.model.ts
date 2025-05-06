import { type IClient } from '@/shared/model/client.model';
import { type ICertification } from '@/shared/model/certification.model';

export interface IClientCertification {
  id?: number;
  certification?: string;
  certificationDate?: Date | null;
  createDate?: Date | null;
  updateDate?: Date | null;
  notes?: string | null;
  client?: IClient | null;
  certif?: ICertification | null;
}

export class ClientCertification implements IClientCertification {
  constructor(
    public id?: number,
    public certification?: string,
    public certificationDate?: Date | null,
    public createDate?: Date | null,
    public updateDate?: Date | null,
    public notes?: string | null,
    public client?: IClient | null,
    public certif?: ICertification | null,
  ) {}
}
