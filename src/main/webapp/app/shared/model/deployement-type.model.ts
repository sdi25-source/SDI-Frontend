export interface IDeployementType {
  id?: number;
  type?: string | null;
  createDate?: Date | null;
  updateDate?: Date | null;
  notes?: string | null;
}

export class DeployementType implements IDeployementType {
  constructor(
    public id?: number,
    public type?: string | null,
    public createDate?: Date | null,
    public updateDate?: Date | null,
    public notes?: string | null,
  ) {}
}
