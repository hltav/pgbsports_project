export type SimplifiedUser = {
  id: number;
  firstname: string;
  lastname: string;
  nickname: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'TEST_USER';
  clientData: {
    gender?: string;
    cpf?: string;
    image?: string;
    phone?: string;
    address?: {
      neighborhood?: string;
      city?: string;
      state?: string;
      country?: string;
    } | null;
  } | null;
};
