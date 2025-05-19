import { GetUserDTO } from '../../../libs/common/dto/user';
import { Prisma } from '@prisma/client';

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    clientData: {
      include: {
        address: true;
      };
    };
  };
}>;

export function toGetUserDTO(user: UserWithRelations): GetUserDTO {
  return {
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    nickname: user.nickname,
    email: user.email,
    clientData: user.clientData
      ? {
          image: user.clientData.image,
          cpf: user.clientData.cpf,
          gender: user.clientData.gender,
          phone: user.clientData.phone,
          address: user.clientData.address
            ? {
                neighborhood: user.clientData.address.neighborhood,
                city: user.clientData.address.city,
                state: user.clientData.address.state,
                country: user.clientData.address.country,
              }
            : null,
        }
      : null,
  };
}
