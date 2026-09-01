import Link from 'next/link';

export function AppHeader({ onLogout }: { onLogout: () => void }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
      <Link href="/inicio" className="text-lg font-semibold text-zinc-900">
        FinanSimple
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        <Link className="text-zinc-700 hover:text-zinc-900" href="/inicio">
          Início
        </Link>
        <Link className="text-zinc-700 hover:text-zinc-900" href="/transacoes">
          Transações
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 font-medium text-zinc-900 hover:bg-zinc-100"
        >
          Sair
        </button>
      </nav>
    </header>
  );
}
