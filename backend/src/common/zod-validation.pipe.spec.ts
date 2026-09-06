import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe.js';
import { createTransactionSchema } from '../transactions/transactions.schema.js';
import { createCategorySchema } from '../categories/categories.schema.js';

describe('ZodValidationPipe', () => {
  it('devolve a primeira mensagem de erro amigável', () => {
    const pipe = new ZodValidationPipe(
      z.object({
        name: z.string().min(2, 'Informe pelo menos 2 caracteres.'),
      }),
    );

    expect(() => pipe.transform({ name: 'A' })).toThrow(BadRequestException);
    try {
      pipe.transform({ name: 'A' });
    } catch (error) {
      expect(error).toMatchObject({
        message: 'Informe pelo menos 2 caracteres.',
      });
    }
  });

  it('devolve os dados validados quando estão corretos', () => {
    const pipe = new ZodValidationPipe(
      z.object({
        name: z.string().trim().min(2),
      }),
    );

    expect(pipe.transform({ name: '  Pets  ' })).toEqual({ name: 'Pets' });
  });

  it('rejeita transação com valor zero', () => {
    const pipe = new ZodValidationPipe(createTransactionSchema);

    expect(() =>
      pipe.transform({
        type: 'EXPENSE',
        amount: 0,
        description: 'Almoço',
        date: '2026-09-01',
        categoryId: '11111111-1111-4111-8111-111111111111',
      }),
    ).toThrow(BadRequestException);
  });

  it('rejeita categoria com nome curto', () => {
    const pipe = new ZodValidationPipe(createCategorySchema);

    expect(() => pipe.transform({ name: 'A' })).toThrow(BadRequestException);
  });
});
