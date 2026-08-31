import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16">
      <main className="flex w-full max-w-lg flex-col gap-6 text-center sm:text-left">
        <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
          Controle financeiro pessoal
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
          FinanSimple
        </h1>
        <p className="text-lg leading-relaxed text-zinc-600">
          Em poucos segundos, entenda quanto ganhou, quanto gastou, onde gastou
          e quanto ainda pode gastar.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-zinc-800"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="rounded-lg border border-zinc-300 px-5 py-2.5 text-center text-sm font-medium text-zinc-900 hover:bg-zinc-100"
          >
            Criar conta
          </Link>
        </div>
      </main>
    </div>
  );
}
