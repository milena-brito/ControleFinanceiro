import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type TransactionType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service.js';
import type {
  CreateTransactionInput,
  ListTransactionsQuery,
  UpdateTransactionInput,
} from './transactions.schema.js';

const transactionInclude = {
  category: { select: { id: true, name: true } },
} as const;

export type TransactionResponse = {
  id: string;
  type: TransactionType;
  amount: string;
  description: string;
  date: string;
  categoryId: string;
  category: { id: string; name: string };
};

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    input: CreateTransactionInput,
  ): Promise<TransactionResponse> {
    await this.assertCategoryAccess(userId, input.categoryId);

    const created = await this.prisma.transaction.create({
      data: {
        userId,
        type: input.type,
        amount: new Prisma.Decimal(input.amount.toFixed(2)),
        description: input.description,
        date: this.toDate(input.date),
        categoryId: input.categoryId,
      },
      include: transactionInclude,
    });

    return this.toResponse(created);
  }

  async list(
    userId: string,
    query: ListTransactionsQuery,
  ): Promise<{
    items: TransactionResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where = this.buildWhere(userId, query);
    const skip = (query.page - 1) * query.limit;

    const [rows, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: transactionInclude,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: query.limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      items: rows.map((row) => this.toResponse(row)),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async update(
    userId: string,
    id: string,
    input: UpdateTransactionInput,
  ): Promise<TransactionResponse> {
    await this.findOwned(userId, id);

    if (input.categoryId) {
      await this.assertCategoryAccess(userId, input.categoryId);
    }

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: {
        ...(input.type ? { type: input.type } : {}),
        ...(input.amount !== undefined
          ? { amount: new Prisma.Decimal(input.amount.toFixed(2)) }
          : {}),
        ...(input.description ? { description: input.description } : {}),
        ...(input.date ? { date: this.toDate(input.date) } : {}),
        ...(input.categoryId ? { categoryId: input.categoryId } : {}),
      },
      include: transactionInclude,
    });

    return this.toResponse(updated);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOwned(userId, id);
    await this.prisma.transaction.delete({ where: { id } });
  }

  private async findOwned(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada.');
    }

    return transaction;
  }

  private async assertCategoryAccess(
    userId: string,
    categoryId: string,
  ): Promise<void> {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ userId: null }, { userId }],
      },
    });

    if (!category) {
      throw new BadRequestException('Categoria inválida.');
    }
  }

  private buildWhere(
    userId: string,
    query: ListTransactionsQuery,
  ): Prisma.TransactionWhereInput {
    const dateFilter: Prisma.DateTimeFilter = {};

    if (query.from) {
      dateFilter.gte = this.toDate(query.from);
    }

    if (query.to) {
      dateFilter.lte = this.toDate(query.to);
    }

    return {
      userId,
      ...(query.type ? { type: query.type } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.from || query.to ? { date: dateFilter } : {}),
    };
  }

  private toDate(isoDate: string): Date {
    return new Date(`${isoDate}T00:00:00.000Z`);
  }

  private toResponse(row: {
    id: string;
    type: TransactionType;
    amount: Prisma.Decimal;
    description: string;
    date: Date;
    categoryId: string;
    category: { id: string; name: string };
  }): TransactionResponse {
    return {
      id: row.id,
      type: row.type,
      amount: row.amount.toString(),
      description: row.description,
      date: row.date.toISOString().slice(0, 10),
      categoryId: row.categoryId,
      category: row.category,
    };
  }
}
