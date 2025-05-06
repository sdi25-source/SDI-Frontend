export interface ICustomisationLevel {
  id?: number;
  level?: string;
  createDate?: Date | null;
  updateDate?: Date | null;
  notes?: string | null;
}

export class CustomisationLevel implements ICustomisationLevel {
  constructor(
    public id?: number,
    public level?: string,
    public createDate?: Date | null,
    public updateDate?: Date | null,
    public notes?: string | null,
  ) {}
}
