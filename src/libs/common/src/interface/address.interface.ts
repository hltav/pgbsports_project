import { ClientData } from './client-data.interface';

export interface Address {
  id: number;
  direction: string;
  houseNumber: number;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  clientDataId?: number;
  clientData?: ClientData;
}
