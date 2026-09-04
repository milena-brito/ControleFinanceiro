import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import type { PrismaService } from '../database/prisma.service.js';

describe('CategoriesService', () => {
  const prisma = {
    category: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    transaction: {
      count: vi.fn(),
    },
  };

  const service = new CategoriesService(prisma as unknown as PrismaService);
  const userId = 'user-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista categorias padrão e as do usuário autenticado', async () => {
    prisma.category.findMany.mockResolvedValue([
      { id: 'cat-1', name: 'Alimentação', userId: null },
      { id: 'cat-2', name: 'Pets', userId },
    ]);

    const result = await service.list(userId);

    expect(prisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [{ userId: null }, { userId }],
        },
      }),
    );
    expect(result).toEqual([
      { id: 'cat-1', name: 'Alimentação', isDefault: true },
      { id: 'cat-2', name: 'Pets', isDefault: false },
    ]);
  });

  it('cria categoria vinculada ao usuário autenticado', async () => {
    prisma.category.findFirst.mockResolvedValue(null);
    prisma.category.create.mockResolvedValue({
      id: 'cat-nova',
      name: 'Pets',
      userId,
    });

    const result = await service.create(userId, { name: 'Pets' });

    expect(prisma.category.create).toHaveBeenCalledWith({
      data: { name: 'Pets', userId },
    });
    expect(result).toEqual({
      id: 'cat-nova',
      name: 'Pets',
      isDefault: false,
    });
  });

  it('não permite nome duplicado entre as categorias visíveis', async () => {
    prisma.category.findFirst.mockResolvedValue({
      id: 'cat-1',
      name: 'Alimentação',
      userId: null,
    });

    await expect(
      service.create(userId, { name: 'alimentação' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.category.create).not.toHaveBeenCalled();
  });

  it('não atualiza categoria padrão', async () => {
    prisma.category.findFirst.mockResolvedValue({
      id: 'cat-1',
      name: 'Alimentação',
      userId: null,
    });

    await expect(
      service.update(userId, 'cat-1', { name: 'Comida' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('não atualiza categoria de outro usuário', async () => {
    prisma.category.findFirst.mockResolvedValue(null);

    await expect(
      service.update(userId, 'cat-alheia', { name: 'Hack' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('atualiza categoria própria', async () => {
    prisma.category.findFirst
      .mockResolvedValueOnce({ id: 'cat-2', name: 'Pets', userId })
      .mockResolvedValueOnce(null);
    prisma.category.update.mockResolvedValue({
      id: 'cat-2',
      name: 'Animais',
      userId,
    });

    const result = await service.update(userId, 'cat-2', { name: 'Animais' });

    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: 'cat-2' },
      data: { name: 'Animais' },
    });
    expect(result.name).toBe('Animais');
    expect(result.isDefault).toBe(false);
  });

  it('não exclui categoria padrão', async () => {
    prisma.category.findFirst.mockResolvedValue({
      id: 'cat-1',
      name: 'Alimentação',
      userId: null,
    });

    await expect(service.remove(userId, 'cat-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.category.delete).not.toHaveBeenCalled();
  });

  it('não exclui categoria de outro usuário', async () => {
    prisma.category.findFirst.mockResolvedValue(null);

    await expect(service.remove(userId, 'cat-alheia')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('não exclui categoria com transações', async () => {
    prisma.category.findFirst.mockResolvedValue({
      id: 'cat-2',
      name: 'Pets',
      userId,
    });
    prisma.transaction.count.mockResolvedValue(3);

    await expect(service.remove(userId, 'cat-2')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prisma.category.delete).not.toHaveBeenCalled();
  });

  it('exclui categoria própria sem transações', async () => {
    prisma.category.findFirst.mockResolvedValue({
      id: 'cat-2',
      name: 'Pets',
      userId,
    });
    prisma.transaction.count.mockResolvedValue(0);
    prisma.category.delete.mockResolvedValue({ id: 'cat-2' });

    await service.remove(userId, 'cat-2');

    expect(prisma.category.delete).toHaveBeenCalledWith({
      where: { id: 'cat-2' },
    });
  });
});
