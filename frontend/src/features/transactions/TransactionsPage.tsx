'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { api } from '@/lib/api';
import type { TransactionFormValues } from '@/lib/transaction-schemas';
import type {
  CategoryOption,
  TransactionItem,
  TransactionListResponse,
  TransactionType,
} from '@/lib/transactions';
import { TransactionForm } from './TransactionForm';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

type Filters = {
  type: '' | TransactionType;
  categoryId: string;
  from: string;
  to: string;
};

const emptyFilters: Filters = {
  type: '',
  categoryId: '',
  from: '',
  to: '',
};

export function TransactionsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<TransactionItem | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  useEffect(() => {
    let cancelled = false;

    api('/auth/me')
      .then(async () => {
        const [cats, data] = await Promise.all([
          api<CategoryOption[]>('/categories'),
          fetchTransactions(emptyFilters),
        ]);

        if (!cancelled) {
          setCategories(cats);
          setItems(data.items);
          setReady(true);
        }
      })
      .catch(() => {
        router.replace('/login');
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function applyFilters(next: Filters) {
    setFilters(next);
    setError(null);

    try {
      const data = await fetchTransactions(next);
      setItems(data.items);
    } catch {
      setError('Não foi possível carregar as transações.');
    }
  }

  async function handleLogout() {
    await api('/auth/logout', { method: 'POST' });
    router.push('/');
  }

  async function handleSubmit(values: TransactionFormValues) {
    setError(null);
    setSubmitting(true);

    const payload = {
      ...values,
      amount: Number(values.amount.replace(',', '.')),
    };

    try {
      if (editing) {
        await api(`/transactions/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setEditing(null);
      } else {
        await api('/transactions', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      const data = await fetchTransactions(filters);
      setItems(data.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar a transação. Tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);

    try {
      await api(`/transactions/${id}`, { method: 'DELETE' });
      if (editing?.id === id) {
        setEditing(null);
      }
      const data = await fetchTransactions(filters);
      setItems(data.items);
    } catch {
      setError('Não foi possível excluir a transação. Tente novamente.');
    }
  }

  if (!ready) {
    return (
      <p className="text-sm text-zinc-500" aria-live="polite">
        Carregando...
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <AppHeader
        onLogout={() => {
          void handleLogout();
        }}
      />
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Transações
        </h1>
        <p className="mt-1 text-zinc-600">
          Lance receitas e despesas e filtre pelo que precisa ver.
        </p>
      </div>
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-4 text-lg font-medium text-zinc-900">
          {editing ? 'Editar transação' : 'Nova transação'}
        </h2>
        <TransactionForm
          key={editing?.id ?? 'new'}
          categories={categories}
          initial={editing ?? undefined}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={
            editing
              ? () => {
                  setEditing(null);
                }
              : undefined
          }
        />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-zinc-900">Filtros</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <select
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
            value={filters.type}
            onChange={(event) =>
              void applyFilters({
                ...filters,
                type: event.target.value as '' | TransactionType,
              })
            }
          >
            <option value="">Todos os tipos</option>
            <option value="INCOME">Receitas</option>
            <option value="EXPENSE">Despesas</option>
          </select>
          <select
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
            value={filters.categoryId}
            onChange={(event) =>
              void applyFilters({
                ...filters,
                categoryId: event.target.value,
              })
            }
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
            value={filters.from}
            onChange={(event) =>
              void applyFilters({ ...filters, from: event.target.value })
            }
          />
          <input
            type="date"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
            value={filters.to}
            onChange={(event) =>
              void applyFilters({ ...filters, to: event.target.value })
            }
          />
        </div>
      </section>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <section>
        {items.length === 0 ? (
          <p className="text-zinc-600">Nenhuma transação neste filtro.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-zinc-900">
                    {item.description}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {item.category.name} · {formatDate(item.date)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p
                    className={
                      item.type === 'INCOME'
                        ? 'font-medium text-emerald-700'
                        : 'font-medium text-red-700'
                    }
                  >
                    {item.type === 'INCOME' ? '+' : '-'}
                    {currency.format(Number(item.amount))}
                  </p>
                  <button
                    type="button"
                    className="text-sm text-zinc-700 underline"
                    onClick={() => setEditing(item)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="text-sm text-red-700 underline"
                    onClick={() => {
                      void handleDelete(item.id);
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

async function fetchTransactions(
  next: Filters,
): Promise<TransactionListResponse> {
  const params = new URLSearchParams();
  if (next.type) params.set('type', next.type);
  if (next.categoryId) params.set('categoryId', next.categoryId);
  if (next.from) params.set('from', next.from);
  if (next.to) params.set('to', next.to);
  const query = params.toString();
  return api<TransactionListResponse>(
    `/transactions${query ? `?${query}` : ''}`,
  );
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}
