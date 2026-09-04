import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, type TransactionType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service.js';
import type { DashboardQuery } from './dashboard.schema.js';

const RECENT_LIMIT = 5;

export type DashboardTransaction = {
  id: string;
  type: TransactionType;
  amount: string;
  description: string;
  date: string;
  categoryId: string;
  category: { id: string; name: string };
};

export type DashboardSummary = {
  from: string;
  to: string;
  income: string;
  expense: string;
  balance: string;
  expensesByCategory: {
    categoryId: string;
    name: string;
    amount: string;
  }[];
  recentTransactions: DashboardTransaction[];
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(
    userId: string,
    query: DashboardQuery,
  ): Promise<DashboardSummary> {
    const { from, to } = this.resolvePeriod(query);
    const dateFilter = {
      gte: this.toDate(from),
      lte: this.toDate(to),
    };

    const [totals, expenseGroups, recent] = await Promise.all([
      this.prisma.transaction.groupBy({
        by: ['type'],
        where: { userId, date: dateFilter },
        _sum: { amount: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { userId, type: 'EXPENSE', date: dateFilter },
        _sum: { amount: true },
      }),
      this.prisma.transaction.findMany({
        where: { userId, date: dateFilter },
        include: { category: { select: { id: true, name: true } } },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        take: RECENT_LIMIT,
      }),
    ]);

    const income = this.sumByType(totals, 'INCOME');
    const expense = this.sumByType(totals, 'EXPENSE');
    const balance = new Prisma.Decimal(income).minus(expense).toFixed(2);

    return {
      from,
      to,
      income,
      expense,
      balance,
      expensesByCategory: await this.mapExpenseGroups(expenseGroups),
      recentTransactions: recent.map((row) => this.toTransaction(row)),
    };
  }

  private resolvePeriod(query: DashboardQuery): { from: string; to: string } {
    if (!query.from && !query.to) {
      return this.currentMonthBounds();
    }

    if (!query.from || !query.to) {
      throw new BadRequestException('Informe o início e o fim do período.');
    }

    if (query.from > query.to) {
      throw new BadRequestException(
        'A data inicial deve ser anterior à final.',
      );
    }

    return { from: query.from, to: query.to };
  }

  private currentMonthBounds(now = new Date()): { from: string; to: string } {
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const mm = String(month + 1).padStart(2, '0');

    return {
      from: `${year}-${mm}-01`,
      to: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
    };
  }

  private sumByType(
    totals: {
      type: TransactionType;
      _sum: { amount: { toString(): string } | null };
    }[],
    type: TransactionType,
  ): string {
    const row = totals.find((item) => item.type === type);
    return this.money(row?._sum.amount);
  }

  private async mapExpenseGroups(
    groups: {
      categoryId: string;
      _sum: { amount: { toString(): string } | null };
    }[],
  ): Promise<DashboardSummary['expensesByCategory']> {
    if (groups.length === 0) {
      return [];
    }

    const categories = await this.prisma.category.findMany({
      where: { id: { in: groups.map((group) => group.categoryId) } },
      select: { id: true, name: true },
    });
    const names = new Map(categories.map((item) => [item.id, item.name]));

    return groups
      .map((group) => ({
        categoryId: group.categoryId,
        name: names.get(group.categoryId) ?? 'Categoria',
        amount: this.money(group._sum.amount),
      }))
      .sort((left, right) =>
        new Prisma.Decimal(right.amount).comparedTo(left.amount),
      );
  }

  private money(value: { toString(): string } | null | undefined): string {
    return new Prisma.Decimal(value?.toString() ?? '0').toFixed(2);
  }

  private toDate(isoDate: string): Date {
    return new Date(`${isoDate}T00:00:00.000Z`);
  }

  private toTransaction(row: {
    id: string;
    type: TransactionType;
    amount: { toString(): string };
    description: string;
    date: Date;
    categoryId: string;
    category: { id: string; name: string };
  }): DashboardTransaction {
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
