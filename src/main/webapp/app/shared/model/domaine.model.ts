export interface IDomaine {
  id?: number;
  name?: string;
  createDate?: Date | null;
  updateDate?: Date | null;
  notes?: string | null;
}

export class Domaine implements IDomaine {
  constructor(
    public id?: number,
    public name?: string,
    public createDate?: Date | null,
    public updateDate?: Date | null,
    public notes?: string | null,
  ) {}
}
