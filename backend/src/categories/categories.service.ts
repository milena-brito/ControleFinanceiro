import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import {
  CATEGORY_IN_USE_MESSAGE,
  CATEGORY_NOT_FOUND_MESSAGE,
  DEFAULT_CATEGORY_FORBIDDEN_MESSAGE,
  DUPLICATE_CATEGORY_MESSAGE,
} from './categories.constants.js';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from './categories.schema.js';

export type CategoryResponse = {
  id: string;
  name: string;
  isDefault: boolean;
};

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<CategoryResponse[]> {
    const rows = await this.prisma.category.findMany({
      where: {
        OR: [{ userId: null }, { userId }],
      },
      orderBy: { name: 'asc' },
    });

    return rows.map((row) => this.toResponse(row));
  }

  async create(
    userId: string,
    input: CreateCategoryInput,
  ): Promise<CategoryResponse> {
    await this.assertUniqueName(userId, input.name);

    const created = await this.prisma.category.create({
      data: { name: input.name, userId },
    });

    return this.toResponse(created);
  }

  async update(
    userId: string,
    id: string,
    input: UpdateCategoryInput,
  ): Promise<CategoryResponse> {
    const category = await this.findAccessible(userId, id);
    this.assertOwned(category);

    await this.assertUniqueName(userId, input.name, id);

    const updated = await this.prisma.category.update({
      where: { id },
      data: { name: input.name },
    });

    return this.toResponse(updated);
  }

  async remove(userId: string, id: string): Promise<void> {
    const category = await this.findAccessible(userId, id);
    this.assertOwned(category);

    const inUse = await this.prisma.transaction.count({
      where: { categoryId: id },
    });

    if (inUse > 0) {
      throw new ConflictException(CATEGORY_IN_USE_MESSAGE);
    }

    await this.prisma.category.delete({ where: { id } });
  }

  private async findAccessible(userId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        OR: [{ userId: null }, { userId }],
      },
    });

    if (!category) {
      throw new NotFoundException(CATEGORY_NOT_FOUND_MESSAGE);
    }

    return category;
  }

  private assertOwned(category: { userId: string | null }): void {
    if (category.userId === null) {
      throw new ForbiddenException(DEFAULT_CATEGORY_FORBIDDEN_MESSAGE);
    }
  }

  private async assertUniqueName(
    userId: string,
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.prisma.category.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        OR: [{ userId: null }, { userId }],
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });

    if (existing) {
      throw new ConflictException(DUPLICATE_CATEGORY_MESSAGE);
    }
  }

  private toResponse(row: {
    id: string;
    name: string;
    userId: string | null;
  }): CategoryResponse {
    return {
      id: row.id,
      name: row.name,
      isDefault: row.userId === null,
    };
  }
}
