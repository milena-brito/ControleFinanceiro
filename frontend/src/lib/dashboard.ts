import type { TransactionItem } from './transactions';

export type ExpenseByCategory = {
  categoryId: string;
  name: string;
  amount: string;
};

export type DashboardSummary = {
  from: string;
  to: string;
  income: string;
  expense: string;
  balance: string;
  expensesByCategory: ExpenseByCategory[];
  recentTransactions: TransactionItem[];
};
