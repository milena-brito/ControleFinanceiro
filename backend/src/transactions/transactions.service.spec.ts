import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionsService } from './transactions.service.js';
import type { PrismaService } from '../database/prisma.service.js';

describe('TransactionsService', () => {
  const prisma = {
    category: { findFirst: vi.fn() },
    transaction: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  const service = new TransactionsService(prisma as unknown as PrismaService);
  const userId = 'user-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cria transação vinculada ao usuário autenticado', async () => {
    prisma.category.findFirst.mockResolvedValue({
      id: 'cat-1',
      userId: null,
    });
    prisma.transaction.create.mockResolvedValue({
      id: 'tx-1',
      type: 'EXPENSE',
      amount: { toString: () => '50.00' },
      description: 'Almoço',
      date: new Date('2026-09-01'),
      categoryId: 'cat-1',
      category: { id: 'cat-1', name: 'Alimentação' },
    });

    const result = await service.create(userId, {
      type: 'EXPENSE',
      amount: 50,
      description: 'Almoço',
      date: '2026-09-01',
      categoryId: 'cat-1',
    });

    expect(prisma.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId,
          categoryId: 'cat-1',
          type: 'EXPENSE',
          description: 'Almoço',
        }),
      }),
    );
    expect(result.amount).toBe('50.00');
    expect(result.category.name).toBe('Alimentação');
  });

  it('não permite categoria de outro usuário', async () => {
    prisma.category.findFirst.mockResolvedValue(null);

    await expect(
      service.create(userId, {
        type: 'INCOME',
        amount: 100,
        description: 'Salário',
        date: '2026-09-01',
        categoryId: 'cat-alheia',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lista apenas transações do usuário', async () => {
    prisma.transaction.findMany.mockResolvedValue([]);
    prisma.transaction.count.mockResolvedValue(0);

    await service.list(userId, { page: 1, limit: 20 });

    expect(prisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId }),
      }),
    );
    expect(prisma.transaction.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId }),
      }),
    );
  });

  it('não atualiza transação de outro usuário', async () => {
    prisma.transaction.findFirst.mockResolvedValue(null);

    await expect(
      service.update(userId, 'tx-outro', { description: 'Hack' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('não exclui transação de outro usuário', async () => {
    prisma.transaction.findFirst.mockResolvedValue(null);

    await expect(service.remove(userId, 'tx-outro')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
