import { Prisma } from '@prisma/client';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type DailyAllowanceInput = {
  availableBalance: string;
  today: string;
  periodFrom: string;
  periodTo: string;
};

export type DailyAllowance = {
  availableBalance: string;
  remainingDays: number;
  dailyAmount: string;
};

export function calculateDailyAllowance(
  input: DailyAllowanceInput,
): DailyAllowance {
  const availableBalance = new Prisma.Decimal(input.availableBalance).toFixed(
    2,
  );
  const remainingDays = countRemainingDays(
    input.today,
    input.periodFrom,
    input.periodTo,
  );

  if (remainingDays === 0) {
    return {
      availableBalance,
      remainingDays: 0,
      dailyAmount: '0.00',
    };
  }

  return {
    availableBalance,
    remainingDays,
    dailyAmount: new Prisma.Decimal(availableBalance)
      .div(remainingDays)
      .toFixed(2),
  };
}

function countRemainingDays(
  today: string,
  periodFrom: string,
  periodTo: string,
): number {
  if (today > periodTo) {
    return 0;
  }

  const start = today < periodFrom ? periodFrom : today;
  return daysInclusive(start, periodTo);
}

function daysInclusive(from: string, to: string): number {
  const start = Date.parse(`${from}T00:00:00.000Z`);
  const end = Date.parse(`${to}T00:00:00.000Z`);
  return Math.floor((end - start) / MS_PER_DAY) + 1;
}
