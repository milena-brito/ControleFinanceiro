import { AuthRateLimiter } from './auth-rate-limiter.js';

describe('AuthRateLimiter', () => {
  it('permite até o limite na janela e depois bloqueia', () => {
    let now = 1_000;
    const limiter = new AuthRateLimiter(2, 60_000, () => now);

    expect(limiter.consume('127.0.0.1')).toBe(true);
    expect(limiter.consume('127.0.0.1')).toBe(true);
    expect(limiter.consume('127.0.0.1')).toBe(false);
  });

  it('isola tentativas por endereço', () => {
    const limiter = new AuthRateLimiter(1, 60_000, () => 1_000);

    expect(limiter.consume('10.0.0.1')).toBe(true);
    expect(limiter.consume('10.0.0.2')).toBe(true);
    expect(limiter.consume('10.0.0.1')).toBe(false);
  });

  it('libera de novo depois da janela', () => {
    let now = 1_000;
    const limiter = new AuthRateLimiter(1, 60_000, () => now);

    expect(limiter.consume('127.0.0.1')).toBe(true);
    expect(limiter.consume('127.0.0.1')).toBe(false);

    now = 61_001;
    expect(limiter.consume('127.0.0.1')).toBe(true);
  });
});
