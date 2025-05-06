import { type IRegion } from '@/shared/model/region.model';

export interface ICountry {
  id?: number;
  countryname?: string;
  countryCode?: string | null;
  countryFlag?: string | null;
  notes?: string | null;
  createDate?: Date | null;
  updateDate?: Date | null;
  region?: IRegion | null;
}

export class Country implements ICountry {
  constructor(
    public id?: number,
    public countryname?: string,
    public countryCode?: string | null,
    public countryFlag?: string | null,
    public notes?: string | null,
    public createDate?: Date | null,
    public updateDate?: Date | null,
    public region?: IRegion | null,
  ) {}
}
