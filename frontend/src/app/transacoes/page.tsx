import type { Metadata } from 'next';
import { TransactionsPage } from '@/features/transactions/TransactionsPage';

export const metadata: Metadata = {
  title: 'Transações',
};

export default function TransacoesRoute() {
  return <TransactionsPage />;
}
