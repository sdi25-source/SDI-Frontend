import { type IClientSize } from '@/shared/model/client-size.model';
import { type IClientType } from '@/shared/model/client-type.model';
import { type ICountry } from '@/shared/model/country.model';

export interface IClient {
  id?: number;
  clientLogo?: string | null;
  name?: string;
  code?: string | null;
  mainContactName?: string | null;
  mainContactEmail?: string | null;
  currentCardHolderNumber?: number | null;
  currentBruncheNumber?: number | null;
  currentCustomersNumber?: number | null;
  mainContactPhoneNumber?: string | null;
  url?: string | null;
  address?: string | null;
  createDate?: Date | null;
  updateDate?: Date | null;
  notes?: string | null;
  countryName?: string | null;
  region?: string | null;
  size?: IClientSize | null;
  clientType?: IClientType | null;
  country?: ICountry | null;
}

export class Client implements IClient {
  constructor(
    public id?: number,
    public clientLogo?: string | null,
    public name?: string,
    public code?: string | null,
    public mainContactName?: string | null,
    public mainContactEmail?: string | null,
    public currentCardHolderNumber?: number | null,
    public currentBruncheNumber?: number | null,
    public currentCustomersNumber?: number | null,
    public mainContactPhoneNumber?: string | null,
    public url?: string | null,
    public address?: string | null,
    public createDate?: Date | null,
    public updateDate?: Date | null,
    public notes?: string | null,
    public countryName?: string | null,
    public region?: string | null,
    public size?: IClientSize | null,
    public clientType?: IClientType | null,
    public country?: ICountry | null,
  ) {}
}
