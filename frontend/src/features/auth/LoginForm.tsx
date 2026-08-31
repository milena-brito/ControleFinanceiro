'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api, type PublicUser } from '@/lib/api';
import { loginSchema, type LoginFormValues } from '@/lib/auth-schemas';

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);

    try {
      await api<{ user: PublicUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      router.push('/inicio');
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Não foi possível entrar. Tente novamente.',
      );
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <label className="flex flex-col gap-1 text-left text-sm text-zinc-700">
        E-mail
        <input
          type="email"
          autoComplete="email"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900"
          {...register('email')}
        />
        {errors.email ? (
          <span className="text-sm text-red-600">{errors.email.message}</span>
        ) : null}
      </label>
      <label className="flex flex-col gap-1 text-left text-sm text-zinc-700">
        Senha
        <input
          type="password"
          autoComplete="current-password"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900"
          {...register('password')}
        />
        {errors.password ? (
          <span className="text-sm text-red-600">
            {errors.password.message}
          </span>
        ) : null}
      </label>
      {formError ? (
        <p className="text-sm text-red-600" role="alert">
          {formError}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
