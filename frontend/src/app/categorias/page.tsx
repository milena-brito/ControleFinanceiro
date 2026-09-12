import type { Metadata } from 'next';
import { CategoriesPage } from '@/features/categories/CategoriesPage';

export const metadata: Metadata = {
  title: 'Categorias',
};

export default function CategoriasRoute() {
  return <CategoriesPage />;
}
