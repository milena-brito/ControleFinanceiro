'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, type PublicUser } from '@/lib/api';

export function SessionHome() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<PublicUser>('/auth/me')
      .then(setUser)
      .catch(() => {
        router.replace('/login');
      });
  }, [router]);

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

  if (!user) {
    return (
      <p className="text-sm text-zinc-500" aria-live="polite">
        Carregando...
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-zinc-500">Olá,</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          {user.name}
        </h1>
        <p className="mt-1 text-zinc-600">{user.email}</p>
      </div>
      <p className="text-zinc-600">
        Você está autenticada. As transações entram na próxima etapa.
      </p>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => {
          void handleLogout();
        }}
        className="w-fit rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
      >
        Sair
      </button>
    </div>
  );
}
