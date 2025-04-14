export class CreateEventDTO {
  bankId!: number;
  eventType: string = '';
  event: string = '';
  market: string = '';
  amount!: number;
  result?: string;
}

export class UpdateEventDTO {
  bankId?: number;
  eventType?: string;
  event?: string;
  market?: string;
  amount?: number;
  result?: string;
}

export class GetEventDTO {
  id!: number;
  bankId!: number;
  eventType: string = '';
  event: string = '';
  market: string = '';
  amount!: number;
  result: string = '';
}
