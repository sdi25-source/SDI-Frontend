import { type IProductVersion } from '@/shared/model/product-version.model';
import { type IClient } from '@/shared/model/client.model';
import { type IModuleVersion } from '@/shared/model/module-version.model';
import { type ICustomisationLevel } from '@/shared/model/customisation-level.model';

import { type RequestStatus } from '@/shared/model/enumerations/request-status.model';
export interface IRequestOfChange {
  id?: number;
  title?: string;
  keywords?: string | null;
  status?: keyof typeof RequestStatus;
  description?: string | null;
  createDate?: Date | null;
  updateDate?: Date | null;
  productVersion?: IProductVersion | null;
  client?: IClient | null;
  moduleVersions?: IModuleVersion[] | null;
  customisationLevel?: ICustomisationLevel | null;
  done?: boolean | false;
}

export class RequestOfChange implements IRequestOfChange {
  constructor(
    public id?: number,
    public title?: string,
    public keywords?: string | null,
    public status?: keyof typeof RequestStatus,
    public description?: string | null,
    public createDate?: Date | null,
    public updateDate?: Date | null,
    public productVersion?: IProductVersion | null,
    public client?: IClient | null,
    public moduleVersions?: IModuleVersion[] | null,
    public customisationLevel?: ICustomisationLevel | null,
    public done?: boolean | false,
  ) {}
}
