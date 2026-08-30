import { PrismaClient } from '@prisma/client';
import { DEFAULT_CATEGORIES } from '../src/database/default-categories.js';

const prisma = new PrismaClient();

async function seed(): Promise<void> {
  for (const name of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { name, userId: null },
    });

    if (!existing) {
      await prisma.category.create({ data: { name } });
    }
  }
}

try {
  await seed();
} finally {
  await prisma.$disconnect();
}
