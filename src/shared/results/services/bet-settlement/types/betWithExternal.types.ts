import {
  Prisma,
  Bets,
  ExternalMatch,
  ExternalMatchDetails,
} from '@prisma/client';

export type BetWithExternalMatch = Bets & {
  externalMatch?: ExternalMatch | null;
  externalMatchDetails?: ExternalMatchDetails | null;
};

export type BetWithExternalMatchDetails = Prisma.BetsGetPayload<{
  include: {
    externalMatch: {
      include: {
        externalMatchDetails: true;
      };
    };
  };
}>;
