export const AUTH_RATE_LIMIT_MESSAGE =
  'Muitas tentativas. Aguarde um minuto e tente novamente.';

const DEFAULT_LIMIT = 10;
const DEFAULT_WINDOW_MS = 60_000;

export class AuthRateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit = DEFAULT_LIMIT,
    private readonly windowMs = DEFAULT_WINDOW_MS,
    private readonly now: () => number = Date.now,
  ) {}

  consume(key: string): boolean {
    const current = this.now();
    const windowStart = current - this.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((at) => at > windowStart);

    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return false;
    }

    recent.push(current);
    this.hits.set(key, recent);
    return true;
  }
}
