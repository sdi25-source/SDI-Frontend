export interface IClientSize {
  id?: number;
  sizeName?: string;
  sizeCode?: string | null;
  sizeDescription?: string | null;
  createDate?: Date | null;
  updateDate?: Date | null;
  notes?: string | null;
}

export class ClientSize implements IClientSize {
  constructor(
    public id?: number,
    public sizeName?: string,
    public sizeCode?: string | null,
    public sizeDescription?: string | null,
    public createDate?: Date | null,
    public updateDate?: Date | null,
    public notes?: string | null,
  ) {}
}
