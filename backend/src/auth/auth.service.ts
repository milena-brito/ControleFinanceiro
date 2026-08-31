import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../database/prisma.service.js';
import {
  DUPLICATE_EMAIL_MESSAGE,
  INVALID_CREDENTIALS_MESSAGE,
} from './auth.constants.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';
import type { AuthResult, PublicUser } from './auth.types.js';

const PASSWORD_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });

    if (existing) {
      throw new ConflictException(DUPLICATE_EMAIL_MESSAGE);
    }

    const passwordHash = await hash(input.password, PASSWORD_ROUNDS);
    const created = await this.prisma.user.create({
      data: {
        name: input.name.trim(),
        email,
        passwordHash,
      },
    });

    return this.issueAuth(created);
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const passwordMatches = await compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    return this.issueAuth(user);
  }

  async getProfile(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    return this.toPublicUser(user);
  }

  private async issueAuth(user: {
    id: string;
    name: string;
    email: string;
  }): Promise<AuthResult> {
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      user: this.toPublicUser(user),
      accessToken,
    };
  }

  private toPublicUser(user: {
    id: string;
    name: string;
    email: string;
  }): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
