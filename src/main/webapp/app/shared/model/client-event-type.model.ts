export interface IClientEventType {
  id?: number;
  type?: string;
  description?: string | null;
  createDate?: Date | null;
  updateDate?: Date | null;
}

export class ClientEventType implements IClientEventType {
  constructor(
    public id?: number,
    public type?: string,
    public description?: string | null,
    public createDate?: Date | null,
    public updateDate?: Date | null,
  ) {}
}
