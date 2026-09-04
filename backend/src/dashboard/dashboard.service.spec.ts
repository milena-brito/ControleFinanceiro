import { BadRequestException } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import type { PrismaService } from '../database/prisma.service.js';

describe('DashboardService', () => {
  const prisma = {
    transaction: {
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
  };

  const service = new DashboardService(prisma as unknown as PrismaService);
  const userId = 'user-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('soma receitas, despesas e saldo só do usuário no período', async () => {
    prisma.transaction.groupBy
      .mockResolvedValueOnce([
        { type: 'INCOME', _sum: { amount: { toString: () => '5000.00' } } },
        { type: 'EXPENSE', _sum: { amount: { toString: () => '3200.00' } } },
      ])
      .mockResolvedValueOnce([
        {
          categoryId: 'cat-1',
          _sum: { amount: { toString: () => '2000.00' } },
        },
        {
          categoryId: 'cat-2',
          _sum: { amount: { toString: () => '1200.00' } },
        },
      ]);
    prisma.category.findMany.mockResolvedValue([
      { id: 'cat-1', name: 'Moradia' },
      { id: 'cat-2', name: 'Alimentação' },
    ]);
    prisma.transaction.findMany.mockResolvedValue([
      {
        id: 'tx-1',
        type: 'EXPENSE',
        amount: { toString: () => '1200.00' },
        description: 'Mercado',
        date: new Date('2026-09-10'),
        categoryId: 'cat-2',
        category: { id: 'cat-2', name: 'Alimentação' },
      },
    ]);

    const result = await service.getSummary(userId, {
      from: '2026-09-01',
      to: '2026-09-30',
    });

    expect(prisma.transaction.groupBy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        by: ['type'],
        where: expect.objectContaining({ userId }),
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        from: '2026-09-01',
        to: '2026-09-30',
        income: '5000.00',
        expense: '3200.00',
        balance: '1800.00',
      }),
    );
    expect(result.expensesByCategory).toEqual([
      { categoryId: 'cat-1', name: 'Moradia', amount: '2000.00' },
      { categoryId: 'cat-2', name: 'Alimentação', amount: '1200.00' },
    ]);
    expect(result.recentTransactions).toHaveLength(1);
    expect(result.recentTransactions[0]?.description).toBe('Mercado');
  });

  it('devolve zeros quando não há transações no período', async () => {
    prisma.transaction.groupBy.mockResolvedValue([]);
    prisma.transaction.findMany.mockResolvedValue([]);

    const result = await service.getSummary(userId, {
      from: '2026-09-01',
      to: '2026-09-30',
    });

    expect(result.income).toBe('0.00');
    expect(result.expense).toBe('0.00');
    expect(result.balance).toBe('0.00');
    expect(result.expensesByCategory).toEqual([]);
    expect(result.recentTransactions).toEqual([]);
    expect(prisma.category.findMany).not.toHaveBeenCalled();
  });

  it('permite saldo negativo', async () => {
    prisma.transaction.groupBy
      .mockResolvedValueOnce([
        { type: 'INCOME', _sum: { amount: { toString: () => '100.00' } } },
        { type: 'EXPENSE', _sum: { amount: { toString: () => '150.00' } } },
      ])
      .mockResolvedValueOnce([]);
    prisma.transaction.findMany.mockResolvedValue([]);

    const result = await service.getSummary(userId, {
      from: '2026-09-01',
      to: '2026-09-30',
    });

    expect(result.balance).toBe('-50.00');
  });

  it('rejeita período com data inicial depois da final', async () => {
    await expect(
      service.getSummary(userId, { from: '2026-09-30', to: '2026-09-01' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.transaction.groupBy).not.toHaveBeenCalled();
  });

  it('inclui o gasto diário calculado a partir do saldo e dos dias restantes', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-17T12:00:00.000Z'));
    prisma.transaction.groupBy
      .mockResolvedValueOnce([
        { type: 'INCOME', _sum: { amount: { toString: () => '1400.00' } } },
      ])
      .mockResolvedValueOnce([]);
    prisma.transaction.findMany.mockResolvedValue([]);

    try {
      const result = await service.getSummary(userId, {
        from: '2026-09-01',
        to: '2026-09-30',
      });

      expect(result.dailyAllowance).toEqual({
        availableBalance: '1400.00',
        remainingDays: 14,
        dailyAmount: '100.00',
      });
    } finally {
      vi.useRealTimers();
    }
  });
});
