import type { TransactionItem } from './transactions';

export type ExpenseByCategory = {
  categoryId: string;
  name: string;
  amount: string;
};

export type DailyAllowance = {
  availableBalance: string;
  remainingDays: number;
  dailyAmount: string;
};

export type DashboardSummary = {
  from: string;
  to: string;
  income: string;
  expense: string;
  balance: string;
  expensesByCategory: ExpenseByCategory[];
  recentTransactions: TransactionItem[];
  dailyAllowance: DailyAllowance;
};
