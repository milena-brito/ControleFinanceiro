'use client';

import { AppHeader } from '@/components/AppHeader';

export function AppPage({
  onLogout,
  children,
}: {
  onLogout: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <AppHeader onLogout={onLogout} />
      <main
        id="conteudo"
        tabIndex={-1}
        className="flex flex-col gap-8 outline-none"
      >
        {children}
      </main>
    </div>
  );
}
