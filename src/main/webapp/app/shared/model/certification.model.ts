export interface ICertification {
  id?: number;
  name?: string;
  description?: string | null;
  createDate?: Date | null;
  updateDate?: Date | null;
  expireDate?: Date | null;
}

export class Certification implements ICertification {
  constructor(
    public id?: number,
    public name?: string,
    public description?: string | null,
    public createDate?: Date | null,
    public updateDate?: Date | null,
    public expireDate?: Date | null,
  ) {}
}
