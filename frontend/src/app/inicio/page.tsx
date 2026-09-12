import type { Metadata } from 'next';
import { DashboardPage } from '@/features/dashboard/DashboardPage';

export const metadata: Metadata = {
  title: 'Início',
};

export default function InicioPage() {
  return <DashboardPage />;
}
