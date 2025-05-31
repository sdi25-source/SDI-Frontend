export interface ICertification {
  id?: number;
  name?: string;
  createDate?: Date | null;
  description?: string | null;
}

export class Certification implements ICertification {
  constructor(
    public id?: number,
    public name?: string,
    public createDate?: Date | null,
    public description?: string | null,
  ) {}
}
