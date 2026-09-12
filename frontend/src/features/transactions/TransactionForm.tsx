'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FieldError } from '@/components/FieldError';
import type { CategoryOption, TransactionItem } from '@/lib/transactions';
import {
  transactionFormSchema,
  type TransactionFormValues,
} from '@/lib/transaction-schemas';

export function TransactionForm({
  categories,
  initial,
  submitting,
  onSubmit,
  onCancel,
}: {
  categories: CategoryOption[];
  initial?: TransactionItem;
  submitting: boolean;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: initial
      ? {
          type: initial.type,
          amount: initial.amount,
          description: initial.description,
          date: initial.date,
          categoryId: initial.categoryId,
        }
      : {
          type: 'EXPENSE',
          amount: '',
          date: new Date().toISOString().slice(0, 10),
        },
  });

  useEffect(() => {
    if (initial) {
      reset({
        type: initial.type,
        amount: initial.amount,
        description: initial.description,
        date: initial.date,
        categoryId: initial.categoryId,
      });
    }
  }, [initial, reset]);

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={handleSubmit((values) => onSubmit(values))}
    >
      <label className="flex flex-col gap-1 text-sm text-zinc-700">
        Tipo
        <select
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
          {...register('type')}
        >
          <option value="EXPENSE">Despesa</option>
          <option value="INCOME">Receita</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-700">
        Valor
        <input
          type="number"
          step="0.01"
          min="0.01"
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={errors.amount ? 'transacao-valor-erro' : undefined}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
          {...register('amount')}
        />
        <FieldError
          id="transacao-valor-erro"
          message={errors.amount?.message}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-700 sm:col-span-2">
        Descrição
        <input
          type="text"
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? 'transacao-descricao-erro' : undefined
          }
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
          {...register('description')}
        />
        <FieldError
          id="transacao-descricao-erro"
          message={errors.description?.message}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-700">
        Data
        <input
          type="date"
          aria-invalid={Boolean(errors.date)}
          aria-describedby={errors.date ? 'transacao-data-erro' : undefined}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
          {...register('date')}
        />
        <FieldError id="transacao-data-erro" message={errors.date?.message} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-700">
        Categoria
        <select
          aria-invalid={Boolean(errors.categoryId)}
          aria-describedby={
            errors.categoryId ? 'transacao-categoria-erro' : undefined
          }
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
          {...register('categoryId')}
        >
          <option value="">Selecione</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <FieldError
          id="transacao-categoria-erro"
          message={errors.categoryId?.message}
        />
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
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
