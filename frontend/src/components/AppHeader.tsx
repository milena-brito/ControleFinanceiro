'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/inicio', label: 'Início' },
  { href: '/transacoes', label: 'Transações' },
  { href: '/categorias', label: 'Categorias' },
] as const;

export function AppHeader({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
      <Link href="/inicio" className="text-lg font-semibold text-zinc-900">
        FinanSimple
      </Link>
      <nav aria-label="Principal" className="flex items-center gap-3 text-sm">
        {links.map((link) => {
          const current = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={current ? 'page' : undefined}
              className={
                current
                  ? 'font-medium text-zinc-900'
                  : 'text-zinc-700 hover:text-zinc-900'
              }
            >
              {link.label}
            </Link>
          );
        })}
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
