import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import type { AuthenticatedRequest } from './jwt-auth.guard.js';
import { ACCESS_TOKEN_COOKIE } from './auth.constants.js';

describe('JwtAuthGuard', () => {
  const jwt = new JwtService({ secret: 'segredo-de-teste' });
  const guard = new JwtAuthGuard(jwt);

  function contextWith(request: Partial<AuthenticatedRequest>) {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    };
  }

  it('rejeita requisição sem cookie e sem bearer', async () => {
    await expect(
      guard.canActivate(contextWith({ cookies: {}, headers: {} }) as never),
    ).rejects.toMatchObject({
      message: 'Faça login para continuar.',
    });
  });

  it('rejeita token inválido', async () => {
    await expect(
      guard.canActivate(
        contextWith({
          cookies: { [ACCESS_TOKEN_COOKIE]: 'token-invalido' },
          headers: {},
        }) as never,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('autentica com cookie válido e preenche o usuário', async () => {
    const token = await jwt.signAsync({
      sub: 'user-1',
      email: 'milena@email.com',
    });
    const request: Partial<AuthenticatedRequest> = {
      cookies: { [ACCESS_TOKEN_COOKIE]: token },
      headers: {},
    };

    await expect(
      guard.canActivate(contextWith(request) as never),
    ).resolves.toBe(true);
    expect(request.user).toEqual({
      id: 'user-1',
      email: 'milena@email.com',
    });
  });

  it('autentica com Authorization Bearer', async () => {
    const token = await jwt.signAsync({
      sub: 'user-1',
      email: 'milena@email.com',
    });
    const request: Partial<AuthenticatedRequest> = {
      cookies: {},
      headers: { authorization: `Bearer ${token}` },
    };

    await expect(
      guard.canActivate(contextWith(request) as never),
    ).resolves.toBe(true);
    expect(request.user?.id).toBe('user-1');
  });
});
