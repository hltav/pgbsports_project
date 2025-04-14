export class BankrollCreateDTO {
  name: string = '';
  balance!: number;
}

export class BankrollUpdateDTO {
  name?: string;
  balance?: number;
}
export class GetBankrollDTO {
  id!: number;
  name: string = '';
  balance!: number;
}
