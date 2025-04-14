export class CreateAddressDto {
  direction?: string;
  houseNumber?: number;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
}

export class UpdateAddressDto {
  direction?: string;
  houseNumber?: number;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
