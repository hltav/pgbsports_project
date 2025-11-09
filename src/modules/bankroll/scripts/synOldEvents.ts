import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from './../../../libs/database/prisma/prisma.service';
import { UpdateBankrollService } from '../services/update-bankroll.service';

interface EventWithBankId {
  id: number;
  bankId: number;
  amount: number;
  odd: number;
  result: string;
}

async function main() {
  const prismaService = new PrismaService();
  await prismaService.onModuleInit();
  const updateBankrollService = new UpdateBankrollService(prismaService);

  const eventsRaw = await prismaService.event.findMany({
    where: {
      result: {
        in: ['win', 'lose', 'returned', 'void'],
      },
    },
    select: {
      id: true,
      bankId: true,
      amount: true,
      odd: true,
      result: true,
    },
  });

  const events: EventWithBankId[] = eventsRaw.map((e) => ({
    ...e,
    amount: e.amount.toNumber(),
    odd: e.odd.toNumber(),
  }));

  for (const event of events) {
    const bankroll = await prismaService.bankroll.findUnique({
      where: { id: event.bankId },
      select: { id: true, unidValue: true },
    });

    if (!bankroll) continue;

    const resultLower = event.result.toLowerCase();

    if (resultLower === 'win') {
      const totalReturn = new Decimal(event.odd).mul(event.amount);
      const netProfit = totalReturn.sub(event.amount);
      const monetaryValue = netProfit.mul(bankroll.unidValue);

      await updateBankrollService.updateBankrollByEvent({
        bankrollId: event.bankId,
        unitsChange: netProfit.toNumber(),
        monetaryChange: monetaryValue,
        reason: 'BET_WON',
      });
    } else if (resultLower === 'lose') {
      const monetaryValue = new Decimal(event.amount)
        .mul(bankroll.unidValue)
        .neg();

      await updateBankrollService.updateBankrollByEvent({
        bankrollId: event.bankId,
        unitsChange: 0,
        monetaryChange: monetaryValue,
        reason: 'BET_LOST',
      });
    } else if (resultLower === 'returned') {
      const monetaryValue = new Decimal(event.amount).mul(bankroll.unidValue);

      await updateBankrollService.updateBankrollByEvent({
        bankrollId: event.bankId,
        unitsChange: event.amount,
        monetaryChange: monetaryValue,
        reason: 'BET_VOID',
      });
    }
  }

  await prismaService.$disconnect();
  console.log('Sincronização concluída!');
}

// Executa o script
main().catch(console.error);
