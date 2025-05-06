export interface IHA {
  id?: number;
  name?: string;
  createDate?: Date | null;
  updateDate?: Date | null;
  notes?: string | null;
}

export class HA implements IHA {
  constructor(
    public id?: number,
    public name?: string,
    public createDate?: Date | null,
    public updateDate?: Date | null,
    public notes?: string | null,
  ) {}
}
