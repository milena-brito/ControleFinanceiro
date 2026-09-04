'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { api, type PublicUser } from '@/lib/api';
import type { DashboardSummary } from '@/lib/dashboard';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [month, setMonth] = useState(currentYearMonth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    api<PublicUser>('/auth/me')
      .then(async (profile) => {
        const data = await fetchDashboard(currentYearMonth());

        if (!cancelled) {
          setUser(profile);
          setSummary(data);
        }
      })
      .catch(() => {
        router.replace('/login');
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function applyMonth(next: string) {
    setMonth(next);
    setError(null);

    try {
      setSummary(await fetchDashboard(next));
    } catch {
      setError('Não foi possível carregar o resumo.');
    }
  }

  async function handleLogout() {
    setError(null);

    try {
      await api('/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch {
      setError('Não foi possível sair. Tente novamente.');
    }
  }

  if (!user || !summary) {
    return (
      <p className="text-sm text-zinc-500" aria-live="polite">
        Carregando...
      </p>
    );
  }

  const income = Number(summary.income);
  const expense = Number(summary.expense);
  const total = income + expense;
  const incomeShare = total === 0 ? 0 : (income / total) * 100;
  const expenseShare = total === 0 ? 0 : (expense / total) * 100;

  return (
    <div className="flex flex-col gap-8">
      <AppHeader
        onLogout={() => {
          void handleLogout();
        }}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500">Olá,</p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            {user.name}
          </h1>
          <p className="mt-1 text-zinc-600">
            Quanto ganhou, quanto gastou e onde o dinheiro foi.
          </p>
        </div>
        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Período
          <input
            type="month"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
            value={month}
            onChange={(event) => {
              void applyMonth(event.target.value);
            }}
          />
        </label>
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Receitas"
          value={currency.format(income)}
          tone="income"
        />
        <SummaryCard
          label="Despesas"
          value={currency.format(expense)}
          tone="expense"
        />
        <SummaryCard
          label="Saldo"
          value={currency.format(Number(summary.balance))}
          tone={Number(summary.balance) < 0 ? 'expense' : 'balance'}
        />
      </section>
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-medium text-zinc-900">
          Receitas x despesas
        </h2>
        {total === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">
            Nenhuma transação neste período.
          </p>
        ) : (
          <div className="mt-4">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="bg-emerald-600"
                style={{ width: `${incomeShare}%` }}
              />
              <div
                className="bg-red-600"
                style={{ width: `${expenseShare}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-sm text-zinc-600">
              <span>Receitas {Math.round(incomeShare)}%</span>
              <span>Despesas {Math.round(expenseShare)}%</span>
            </div>
          </div>
        )}
      </section>
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-medium text-zinc-900">
          Despesas por categoria
        </h2>
        {summary.expensesByCategory.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">
            Sem despesas neste período.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {summary.expensesByCategory.map((item) => {
              const share =
                expense === 0 ? 0 : (Number(item.amount) / expense) * 100;

              return (
                <li key={item.categoryId}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-zinc-800">{item.name}</span>
                    <span className="font-medium text-zinc-900">
                      {currency.format(Number(item.amount))}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-zinc-900"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium text-zinc-900">
            Transações recentes
          </h2>
          <Link href="/transacoes" className="text-sm text-zinc-700 underline">
            Ver todas
          </Link>
        </div>
        {summary.recentTransactions.length === 0 ? (
          <p className="text-zinc-600">Nenhuma transação neste período.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
            {summary.recentTransactions.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-zinc-900">
                    {item.description}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {item.category.name} · {formatDate(item.date)}
                  </p>
                </div>
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
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/transacoes"
          className="w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Lançar transação
        </Link>
        <Link
          href="/categorias"
          className="w-fit rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
        >
          Categorias
        </Link>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'income' | 'expense' | 'balance';
}) {
  const valueClass =
    tone === 'income'
      ? 'text-emerald-700'
      : tone === 'expense'
        ? 'text-red-700'
        : 'text-zinc-900';

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight ${valueClass}`}>
        {value}
      </p>
    </article>
  );
}

async function fetchDashboard(yearMonth: string): Promise<DashboardSummary> {
  const { from, to } = monthRange(yearMonth);
  const params = new URLSearchParams({ from, to });
  return api<DashboardSummary>(`/dashboard?${params.toString()}`);
}

function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function monthRange(yearMonth: string): { from: string; to: string } {
  const [year, month] = yearMonth.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const mm = String(month).padStart(2, '0');

  return {
    from: `${year}-${mm}-01`,
    to: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
  };
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}
