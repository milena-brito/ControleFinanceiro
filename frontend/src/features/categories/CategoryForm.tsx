'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { Category } from '@/lib/categories';
import {
  categoryFormSchema,
  type CategoryFormValues,
} from '@/lib/category-schemas';

export function CategoryForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: {
  initial?: Category;
  submitting: boolean;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initial?.name ?? '',
    },
  });

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={handleSubmit((values) => onSubmit(values))}
    >
      <label className="flex flex-1 flex-col gap-1 text-sm text-zinc-700">
        Nome
        <input
          type="text"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
          {...register('name')}
        />
        {errors.name ? (
          <span className="text-sm text-red-600">{errors.name.message}</span>
        ) : null}
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {initial ? 'Salvar' : 'Adicionar'}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
