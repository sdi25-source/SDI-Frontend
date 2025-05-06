export interface IFeature {
  id?: number;
  name?: string;
  apiVersion?: string | null;
  description?: string | null;
  createDate?: Date | null;
  updateDate?: Date | null;
}

export class Feature implements IFeature {
  constructor(
    public id?: number,
    public name?: string,
    public apiVersion?: string | null,
    public description?: string | null,
    public createDate?: Date | null,
    public updateDate?: Date | null,
  ) {}
}
