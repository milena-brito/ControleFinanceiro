import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import { AuthService } from './auth.service.js';
import type { PrismaService } from '../database/prisma.service.js';

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  };

  const jwt = new JwtService({ secret: 'segredo-de-teste' });
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(prisma as unknown as PrismaService, jwt);
  });

  describe('register', () => {
    it('cria o usuário com senha hasheada e sem devolver o hash', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(async ({ data }) => ({
        id: 'user-1',
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const result = await service.register({
        name: 'Milena',
        email: '  milena@email.com ',
        password: 'senha1234',
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Milena',
          email: 'milena@email.com',
          passwordHash: expect.not.stringMatching(/^senha1234$/),
        },
      });
      expect(result.user).toEqual({
        id: 'user-1',
        name: 'Milena',
        email: 'milena@email.com',
      });
      expect(result.accessToken).toEqual(expect.any(String));
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('rejeita e-mail já cadastrado', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });

      await expect(
        service.register({
          name: 'Milena',
          email: 'milena@email.com',
          password: 'senha1234',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('autentica com e-mail e senha corretos', async () => {
      const passwordHash = await hash('senha1234', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'Milena',
        email: 'milena@email.com',
        passwordHash,
      });

      const result = await service.login({
        email: 'MILENA@email.com',
        password: 'senha1234',
      });

      expect(result.user.email).toBe('milena@email.com');
      expect(result.accessToken).toEqual(expect.any(String));
    });

    it('rejeita senha inválida com mensagem genérica', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'Milena',
        email: 'milena@email.com',
        passwordHash: await hash('outra-senha', 10),
      });

      await expect(
        service.login({
          email: 'milena@email.com',
          password: 'senha1234',
        }),
      ).rejects.toMatchObject({
        message: 'E-mail ou senha inválidos.',
      });
    });

    it('rejeita e-mail inexistente com a mesma mensagem', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'naoexiste@email.com',
          password: 'senha1234',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      await expect(
        service.login({
          email: 'naoexiste@email.com',
          password: 'senha1234',
        }),
      ).rejects.toMatchObject({
        message: 'E-mail ou senha inválidos.',
      });
    });
  });
});
