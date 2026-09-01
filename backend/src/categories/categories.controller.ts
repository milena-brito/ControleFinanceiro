import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PrismaService } from '../database/prisma.service.js';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.prisma.category.findMany({
      where: {
        OR: [{ userId: null }, { userId: user.id }],
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }
}
