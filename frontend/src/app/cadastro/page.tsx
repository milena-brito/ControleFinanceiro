import Link from 'next/link';
import { RegisterForm } from '@/features/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16">
      <main className="flex w-full max-w-md flex-col gap-6">
        <div>
          <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
            FinanSimple
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            Criar conta
          </h1>
        </div>
        <RegisterForm />
        <p className="text-sm text-zinc-600">
          Já tem conta?{' '}
          <Link className="font-medium text-zinc-900 underline" href="/login">
            Entrar
          </Link>
        </p>
      </main>
    </div>
  );
}
