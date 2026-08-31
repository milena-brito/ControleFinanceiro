import { SessionHome } from '@/features/auth/SessionHome';

export default function InicioPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16">
      <main className="w-full max-w-lg">
        <SessionHome />
      </main>
    </div>
  );
}
