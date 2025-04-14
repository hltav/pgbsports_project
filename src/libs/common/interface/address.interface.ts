import { ClientData } from './client-data.interface';

export interface Address {
  id: number;
  direction: string | null;
  houseNumber: number | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  clientDataId?: number;
  clientData?: ClientData;
  createdAt: Date;
  updatedAt: Date;
}
