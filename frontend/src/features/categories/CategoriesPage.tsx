'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { api } from '@/lib/api';
import type { Category } from '@/lib/categories';
import type { CategoryFormValues } from '@/lib/category-schemas';
import { CategoryForm } from './CategoryForm';

export function CategoriesPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  useEffect(() => {
    let cancelled = false;

    api('/auth/me')
      .then(async () => {
        const cats = await api<Category[]>('/categories');

        if (!cancelled) {
          setItems(cats);
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

  async function handleLogout() {
    await api('/auth/logout', { method: 'POST' });
    router.push('/');
  }

  async function handleSubmit(values: CategoryFormValues) {
    setError(null);
    setSubmitting(true);

    try {
      if (editing) {
        await api(`/categories/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(values),
        });
        setEditing(null);
      } else {
        await api('/categories', {
          method: 'POST',
          body: JSON.stringify(values),
        });
      }

      setItems(await api<Category[]>('/categories'));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar a categoria. Tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);

    try {
      await api(`/categories/${id}`, { method: 'DELETE' });
      if (editing?.id === id) {
        setEditing(null);
      }
      setItems(await api<Category[]>('/categories'));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível excluir a categoria. Tente novamente.',
      );
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
          Categorias
        </h1>
        <p className="mt-1 text-zinc-600">
          Use as categorias padrão ou crie as suas. As padrão não podem ser
          alteradas.
        </p>
      </div>
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-4 text-lg font-medium text-zinc-900">
          {editing ? 'Editar categoria' : 'Nova categoria'}
        </h2>
        <CategoryForm
          key={editing?.id ?? 'new'}
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
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <section>
        {items.length === 0 ? (
          <p className="text-zinc-600">Nenhuma categoria disponível.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-zinc-900">{item.name}</p>
                  {item.isDefault ? (
                    <p className="text-sm text-zinc-500">Categoria padrão</p>
                  ) : (
                    <p className="text-sm text-zinc-500">Sua categoria</p>
                  )}
                </div>
                {item.isDefault ? null : (
                  <div className="flex items-center gap-3">
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
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
