// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from './../../libs/database/prisma';
// import { CreateEventDTO, GetEventDTO, UpdateEventDTO } from './dto';
// import {
//   convertToSaoPauloTime,
//   getTimezoneByCountry,
// } from './utils/timezone.utils';

// @Injectable()
// export class EventsService {
//   constructor(private prisma: PrismaService) {}

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
//         odd: data.odd,
//         event: data.event,
//         market: data.market,
//         marketCategory: data.marketCategory,
//         marketSub: data.marketSub,
//         optionMarket: data.optionMarket,
//         amount: data.amount,
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
//     });

//     if (!event) {
//       throw new NotFoundException('Event not found!');
//     }

//     const updatedEvent = await this.prisma.event.update({
//       where: { id },
//       data,
//     });

//     return updatedEvent;
//   }

//   async deleteEvent(id: number): Promise<GetEventDTO> {
//     const event = await this.prisma.event.findUnique({
//       where: { id },
//     });

//     if (!event) {
//       throw new NotFoundException('Event not found!');
//     }

//     await this.prisma.event.delete({
//       where: { id },
//     });

//     return event;
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
  amount: number;
  odd: number;
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
        odd: data.odd,
        event: data.event,
        market: data.market,
        marketCategory: data.marketCategory,
        marketSub: data.marketSub,
        optionMarket: data.optionMarket,
        amount: data.amount,
        result: data.result ?? undefined,
        userId: data.userId,
        apiEventId: data.apiEventId,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        eventDate: processedEventDate,
        strTimestamp: data.strTimestamp,
        strTime: data.strTime,
        strTimeLocal: data.strTimeLocal,
        timezone: timezone,
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

    // Debita as unidades da banca quando o evento é criado
    const bankroll = await this.prisma.bankroll.findUnique({
      where: { id: data.bankId },
      select: {
        id: true,
        unidValue: true,
      },
    });

    if (bankroll) {
      const monetaryValue = new Decimal(data.amount).mul(bankroll.unidValue);

      await this.updateBankrollService.updateBankrollByEvent({
        bankrollId: data.bankId,
        unitsChange: new Decimal(data.amount).neg().toNumber(),
        monetaryChange: monetaryValue.neg(),
        reason: 'BET_PLACED',
      });
    }

    return event;
  }

  async findAllEvents(): Promise<GetEventDTO[]> {
    return this.prisma.event.findMany();
  }

  async findEventById(id: number): Promise<GetEventDTO> {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found!');
    }

    return event;
  }

  async updateEvent(id: number, data: UpdateEventDTO): Promise<GetEventDTO> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        bankId: true,
        amount: true,
        odd: true,
        result: true,
      },
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
        // ✅ Conversão explícita para number
        const normalizedEvent: EventWithBankId = {
          id: event.id,
          bankId: event.bankId,
          amount:
            event.amount instanceof Decimal
              ? event.amount.toNumber()
              : event.amount,
          odd: event.odd instanceof Decimal ? event.odd.toNumber() : event.odd,
          result: event.result,
        };

        await this.handleEventResult(normalizedEvent, newResult, bankroll);
      }
    }

    return updatedEvent;
  }

  private async handleEventResult(
    event: EventWithBankId,
    result: string,
    bankroll: BankrollData,
  ): Promise<void> {
    const resultLower = result.toLowerCase();

    if (resultLower === 'win') {
      // Calcula o ganho líquido: (odd * amount) - amount
      const totalReturn = new Decimal(event.odd).mul(event.amount);
      const netProfit = totalReturn.sub(event.amount);
      const monetaryValue = netProfit.mul(bankroll.unidValue);

      await this.updateBankrollService.updateBankrollByEvent({
        bankrollId: event.bankId,
        unitsChange: netProfit.toNumber(),
        monetaryChange: monetaryValue,
        reason: 'BET_WON',
      });
    } else if (resultLower === 'lose') {
      // A perda já foi debitada na criação, só registra no histórico
      const monetaryValue = new Decimal(event.amount).mul(bankroll.unidValue);

      await this.updateBankrollService.updateBankrollByEvent({
        bankrollId: event.bankId,
        unitsChange: 0,
        monetaryChange: monetaryValue,
        reason: 'BET_LOST',
      });
    } else if (resultLower === 'returned') {
      // Devolve as unidades
      const monetaryValue = new Decimal(event.amount).mul(bankroll.unidValue);

      await this.updateBankrollService.updateBankrollByEvent({
        bankrollId: event.bankId,
        unitsChange: event.amount,
        monetaryChange: monetaryValue,
        reason: 'BET_VOID',
      });
    }
  }

  async deleteEvent(id: number): Promise<GetEventDTO> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        bankId: true,
        amount: true,
        odd: true,
        result: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found!');
    }

    if (!event.result || event.result.toLowerCase() === 'pending') {
      const bankroll = await this.prisma.bankroll.findUnique({
        where: { id: event.bankId },
        select: {
          id: true,
          unidValue: true,
        },
      });

      if (bankroll) {
        const monetaryValue = new Decimal(event.amount).mul(bankroll.unidValue);

        await this.updateBankrollService.updateBankrollByEvent({
          bankrollId: event.bankId,
          unitsChange:
            event.amount instanceof Decimal
              ? event.amount.toNumber()
              : event.amount,
          monetaryChange: monetaryValue,
          reason: 'BET_VOID',
        });
      }
    }

    const deletedEvent = await this.prisma.event.delete({
      where: { id },
    });

    return deletedEvent;
  }
}
