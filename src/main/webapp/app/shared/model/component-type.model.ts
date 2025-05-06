export interface IComponentType {
  id?: number;
  type?: string;
}

export class ComponentType implements IComponentType {
  constructor(
    public id?: number,
    public type?: string,
  ) {}
}
