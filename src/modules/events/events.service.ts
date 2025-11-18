// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from './../../libs/database/prisma';
// import { CreateEventDTO, GetEventDTO, UpdateEventDTO } from './dto';
// import {
//   convertToSaoPauloTime,
//   getTimezoneByCountry,
// } from './utils/timezone.utils';
// import { UpdateBankrollService } from './../bankroll/services/update-bankroll.service';
// import { Decimal } from '@prisma/client/runtime/library';

// interface EventWithBankId {
//   id: number;
//   bankId: number;
//   amount: Decimal;
//   odd: Decimal;
//   result: string | null;
// }

// interface BankrollData {
//   id: number;
//   unidValue: Decimal;
// }

// @Injectable()
// export class EventsService {
//   constructor(
//     private prisma: PrismaService,
//     private updateBankrollService: UpdateBankrollService,
//   ) {}

//   async createEvent(data: CreateEventDTO): Promise<GetEventDTO> {
//     let processedEventDate: Date | null = null;

//     if (data.strTimestamp) {
//       processedEventDate = convertToSaoPauloTime(data.strTimestamp);
//     } else if (data.eventDate) {
//       processedEventDate = new Date(data.eventDate);
//     }

//     const timezone = data.strCountry
//       ? getTimezoneByCountry(data.strCountry)
//       : null;

//     const event = await this.prisma.event.create({
//       data: {
//         bankId: data.bankId,
//         modality: data.modality,
//         league: data.league,
//         odd: new Decimal(data.odd).toString(),
//         event: data.event,
//         market: data.market,
//         marketCategory: data.marketCategory,
//         marketSub: data.marketSub,
//         optionMarket: data.optionMarket,
//         amount: new Decimal(data.amount).toString(),
//         result: data.result ?? undefined,
//         userId: data.userId,
//         apiEventId: data.apiEventId,
//         homeTeam: data.homeTeam,
//         awayTeam: data.awayTeam,
//         eventDate: processedEventDate,
//         strTimestamp: data.strTimestamp,
//         strTime: data.strTime,
//         strTimeLocal: data.strTimeLocal,
//         timezone: timezone,
//         strBadge: data.strBadge,
//         strSeason: data.strSeason,
//         intRound: data.intRound,
//         strHomeTeamBadge: data.strHomeTeamBadge,
//         strAwayTeamBadge: data.strAwayTeamBadge,
//         strCountry: data.strCountry,
//         strStatus: data.strStatus,
//         strPostponed: data.strPostponed,
//         strThumb: data.strThumb,
//       },
//     });

//     const bankroll = await this.prisma.bankroll.findUnique({
//       where: { id: data.bankId },
//       select: {
//         id: true,
//         unidValue: true,
//       },
//     });

//     if (bankroll) {
//       const unitsChange = new Decimal(data.amount).neg();
//       const monetaryChange = unitsChange.mul(bankroll.unidValue);

//       await this.updateBankrollService.updateBankrollByEvent({
//         bankrollId: data.bankId,
//         unitsChange: unitsChange.toNumber(),
//         monetaryChange: monetaryChange,
//         reason: 'BET_PLACED',
//       });
//     }

//     return event;
//   }

//   async findAllEvents(): Promise<GetEventDTO[]> {
//     return this.prisma.event.findMany();
//   }

//   async findEventById(id: number): Promise<GetEventDTO> {
//     const event = await this.prisma.event.findUnique({
//       where: { id },
//     });

//     if (!event) {
//       throw new NotFoundException('Event not found!');
//     }

//     return event;
//   }

//   async updateEvent(id: number, data: UpdateEventDTO): Promise<GetEventDTO> {
//     const event = await this.prisma.event.findUnique({
//       where: { id },
//       select: {
//         id: true,
//         bankId: true,
//         amount: true,
//         odd: true,
//         result: true,
//       },
//     });

//     if (!event) throw new NotFoundException('Event not found!');

//     const oldResult = event.result;
//     const newResult = data.result;

//     const updatedEvent = await this.prisma.event.update({
//       where: { id },
//       data,
//     });

//     if (newResult && oldResult !== newResult) {
//       const bankroll = await this.prisma.bankroll.findUnique({
//         where: { id: event.bankId },
//         select: { id: true, unidValue: true },
//       });

//       if (bankroll) {
//         const normalizedEvent: EventWithBankId = {
//           id: event.id,
//           bankId: event.bankId,
//           amount: new Decimal(event.amount),
//           odd: new Decimal(event.odd),
//           result: newResult,
//         };

//         await this.handleEventResult(normalizedEvent, bankroll);
//       }
//     }

//     return updatedEvent;
//   }

//   private async handleEventResult(
//     event: EventWithBankId,
//     bankroll: BankrollData,
//   ) {
//     const resultLower = event.result?.toLowerCase();

//     if (resultLower === 'win') {
//       const netProfit = event.amount.mul(event.odd).sub(event.amount);
//       const monetaryValue = netProfit.mul(bankroll.unidValue);

//       await this.updateBankrollService.updateBankrollByEvent({
//         bankrollId: event.bankId,
//         unitsChange: netProfit.toNumber(),
//         monetaryChange: monetaryValue,
//         reason: 'BET_WON',
//       });
//     } else if (resultLower === 'lose') {
//       await this.updateBankrollService.updateBankrollByEvent({
//         bankrollId: event.bankId,
//         unitsChange: 0,
//         monetaryChange: new Decimal(0),
//         reason: 'BET_LOST',
//       });
//     } else if (resultLower === 'returned') {
//       const monetaryValue = event.amount.mul(bankroll.unidValue);

//       await this.updateBankrollService.updateBankrollByEvent({
//         bankrollId: event.bankId,
//         unitsChange: event.amount.toNumber(),
//         monetaryChange: monetaryValue,
//         reason: 'BET_VOID',
//       });
//     }
//   }

//   async deleteEvent(id: number): Promise<GetEventDTO> {
//     const event = await this.prisma.event.findUnique({
//       where: { id },
//       select: {
//         id: true,
//         bankId: true,
//         amount: true,
//         odd: true,
//         result: true,
//       },
//     });

//     if (!event) {
//       throw new NotFoundException('Event not found!');
//     }

//     if (!event.result || event.result.toLowerCase() === 'pending') {
//       const bankroll = await this.prisma.bankroll.findUnique({
//         where: { id: event.bankId },
//         select: {
//           id: true,
//           unidValue: true,
//         },
//       });

//       if (bankroll) {
//         const monetaryValue = new Decimal(event.amount).mul(bankroll.unidValue);

//         await this.updateBankrollService.updateBankrollByEvent({
//           bankrollId: event.bankId,
//           unitsChange:
//             event.amount instanceof Decimal
//               ? event.amount.toNumber()
//               : event.amount,
//           monetaryChange: monetaryValue,
//           reason: 'BET_VOID',
//         });
//       }
//     }

//     const deletedEvent = await this.prisma.event.delete({
//       where: { id },
//     });

//     return deletedEvent;
//   }
// }

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../libs/database/prisma';
import { CreateEventDTO, GetEventDTO, UpdateEventDTO } from './dto';
import {
  convertToSaoPauloTime,
  getTimezoneByCountry,
} from './utils/timezone.utils';
import { UpdateBankrollService } from './../bankroll/services/update-bankroll.service';
import { Decimal } from '@prisma/client/runtime/library';

interface EventWithBankId {
  id: number;
  bankId: number;
  amount: Decimal;
  odd: Decimal;
  result: string | null;
}

interface BankrollData {
  id: number;
  unidValue: Decimal;
}

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private updateBankrollService: UpdateBankrollService,
  ) {}

  async createEvent(data: CreateEventDTO): Promise<GetEventDTO> {
    let processedEventDate: Date | null = null;

    if (data.strTimestamp) {
      processedEventDate = convertToSaoPauloTime(data.strTimestamp);
    } else if (data.eventDate) {
      processedEventDate = new Date(data.eventDate);
    }

    const timezone = data.strCountry
      ? getTimezoneByCountry(data.strCountry)
      : null;

    const event = await this.prisma.event.create({
      data: {
        bankId: data.bankId,
        modality: data.modality,
        league: data.league,
        odd: new Decimal(data.odd).toString(),
        event: data.event,
        market: data.market,
        marketCategory: data.marketCategory,
        marketSub: data.marketSub,
        optionMarket: data.optionMarket,
        amount: new Decimal(data.amount).toString(),
        result: data.result ?? undefined,
        userId: data.userId,
        apiEventId: data.apiEventId,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        eventDate: processedEventDate,
        strTimestamp: data.strTimestamp,
        strTime: data.strTime,
        strTimeLocal: data.strTimeLocal,
        timezone,
        strBadge: data.strBadge,
        strSeason: data.strSeason,
        intRound: data.intRound,
        strHomeTeamBadge: data.strHomeTeamBadge,
        strAwayTeamBadge: data.strAwayTeamBadge,
        strCountry: data.strCountry,
        strStatus: data.strStatus,
        strPostponed: data.strPostponed,
        strThumb: data.strThumb,
      },
    });

    const bankroll = await this.prisma.bankroll.findUnique({
      where: { id: data.bankId },
      select: { id: true, unidValue: true },
    });

    if (bankroll) {
      const stakeDecimal = new Decimal(data.amount);
      const monetaryChange = stakeDecimal.neg().mul(bankroll.unidValue);

      await this.updateBankrollService.updateBankrollByEvent({
        bankrollId: data.bankId,
        type: 'BET_PLACED',
        monetaryChange,
        stake: stakeDecimal,
        odds: new Decimal(data.odd),
        potentialWin: stakeDecimal.mul(new Decimal(data.odd)),
        eventId: undefined,
        eventName: data.event,
        description: data.market,
      });
    }

    return event;
  }

  async findAllEvents(): Promise<GetEventDTO[]> {
    return this.prisma.event.findMany();
  }

  async findEventById(id: number): Promise<GetEventDTO> {
    const event = await this.prisma.event.findUnique({ where: { id } });

    if (!event) throw new NotFoundException('Event not found!');
    return event;
  }

  async updateEvent(id: number, data: UpdateEventDTO): Promise<GetEventDTO> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { id: true, bankId: true, amount: true, odd: true, result: true },
    });

    if (!event) throw new NotFoundException('Event not found!');

    const oldResult = event.result;
    const newResult = data.result;

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data,
    });

    if (newResult && oldResult !== newResult) {
      const bankroll = await this.prisma.bankroll.findUnique({
        where: { id: event.bankId },
        select: { id: true, unidValue: true },
      });

      if (bankroll) {
        const normalizedEvent: EventWithBankId = {
          id: event.id,
          bankId: event.bankId,
          amount: new Decimal(event.amount),
          odd: new Decimal(event.odd),
          result: newResult,
        };

        await this.handleEventResult(normalizedEvent, bankroll);
      }
    }

    return updatedEvent;
  }

  private async handleEventResult(
    event: EventWithBankId,
    bankroll: BankrollData,
  ) {
    const resultLower = event.result?.toLowerCase();

    if (resultLower === 'win') {
      const totalReturnDecimal = event.amount.mul(event.odd);
      const monetaryValue = totalReturnDecimal.mul(bankroll.unidValue);

      await this.updateBankrollService.updateBankrollByEvent({
        bankrollId: event.bankId,
        type: 'BET_WON',
        monetaryChange: monetaryValue,
        stake: totalReturnDecimal,
        actualReturn: monetaryValue,
        eventId: event.id,
        eventName: undefined,
        description: 'Bet won',
      });
    } else if (resultLower === 'lose') {
      await this.updateBankrollService.updateBankrollByEvent({
        bankrollId: event.bankId,
        type: 'BET_LOST',
        monetaryChange: new Decimal(0),
        stake: event.amount.neg(),
        eventId: event.id,
        description: 'Bet lost',
      });
    } else if (resultLower === 'returned') {
      const refund = event.amount;
      const monetaryValue = refund.mul(bankroll.unidValue);

      await this.updateBankrollService.updateBankrollByEvent({
        bankrollId: event.bankId,
        type: 'BET_VOID',
        monetaryChange: monetaryValue,
        stake: refund,
        actualReturn: monetaryValue,
        eventId: event.id,
        description: 'Bet returned',
      });
    }
  }

  async deleteEvent(id: number): Promise<GetEventDTO> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { id: true, bankId: true, amount: true, odd: true, result: true },
    });

    if (!event) throw new NotFoundException('Event not found!');

    if (!event.result || event.result.toLowerCase() === 'pending') {
      const bankroll = await this.prisma.bankroll.findUnique({
        where: { id: event.bankId },
        select: { id: true, unidValue: true },
      });

      if (bankroll) {
        const amountDecimal = new Decimal(event.amount);
        const monetaryValue = amountDecimal.mul(bankroll.unidValue);

        await this.updateBankrollService.updateBankrollByEvent({
          bankrollId: event.bankId,
          type: 'BET_VOID',
          monetaryChange: monetaryValue,
          stake: amountDecimal,
          actualReturn: monetaryValue,
          eventId: event.id,
          description: 'Event deleted - returned stake',
        });
      }
    }

    return this.prisma.event.delete({ where: { id } });
  }
}
