import { type IClient } from '@/shared/model/client.model';
import { type IClientEventType } from '@/shared/model/client-event-type.model';

export interface IClientEvent {
  id?: number;
  event?: string;
  description?: string | null;
  eventDate?: Date | null;
  notes?: string | null;
  client?: IClient | null;
  clientEventType?: IClientEventType | null;
}

export class ClientEvent implements IClientEvent {
  constructor(
    public id?: number,
    public event?: string,
    public description?: string | null,
    public eventDate?: Date | null,
    public notes?: string | null,
    public client?: IClient | null,
    public clientEventType?: IClientEventType | null,
  ) {}
}
