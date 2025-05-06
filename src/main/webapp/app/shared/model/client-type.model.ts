export interface IClientType {
  id?: number;
  type?: string;
  createDate?: Date | null;
  updateDate?: Date | null;
  notes?: string | null;
}

export class ClientType implements IClientType {
  constructor(
    public id?: number,
    public type?: string,
    public createDate?: Date | null,
    public updateDate?: Date | null,
    public notes?: string | null,
  ) {}
}
