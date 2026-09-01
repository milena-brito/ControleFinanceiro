export type TransactionType = 'INCOME' | 'EXPENSE';

export type CategoryOption = {
  id: string;
  name: string;
};

export type TransactionItem = {
  id: string;
  type: TransactionType;
  amount: string;
  description: string;
  date: string;
  categoryId: string;
  category: CategoryOption;
};

export type TransactionListResponse = {
  items: TransactionItem[];
  total: number;
  page: number;
  limit: number;
};
