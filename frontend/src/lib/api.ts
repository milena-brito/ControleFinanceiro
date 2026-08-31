export type PublicUser = {
  id: string;
  name: string;
  email: string;
};

type ApiErrorBody = {
  message?: string | string[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    const message = Array.isArray(body.message)
      ? body.message[0]
      : body.message;
    throw new Error(message ?? 'Não foi possível concluir a operação.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
