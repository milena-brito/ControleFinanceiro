import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/features/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Entrar',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16">
      <main
        id="conteudo"
        tabIndex={-1}
        className="flex w-full max-w-md flex-col gap-6 outline-none"
      >
        <div>
          <p className="text-sm font-medium tracking-wide text-zinc-600 uppercase">
            FinanSimple
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            Entrar
          </h1>
        </div>
        <LoginForm />
        <p className="text-sm text-zinc-600">
          Ainda não tem conta?{' '}
          <Link
            className="font-medium text-zinc-900 underline"
            href="/cadastro"
          >
            Criar conta
          </Link>
        </p>
      </main>
    </div>
  );
}
