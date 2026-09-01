import { z } from 'zod';

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data válida.');

export const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE'], {
    message: 'Informe se é receita ou despesa.',
  }),
  amount: z.coerce
    .number()
    .positive('O valor deve ser maior que zero.')
    .max(9999999999.99, 'Valor acima do permitido.'),
  description: z
    .string()
    .trim()
    .min(1, 'Informe a descrição.')
    .max(200, 'A descrição pode ter no máximo 200 caracteres.'),
  date: isoDate,
  categoryId: z.uuid('Selecione uma categoria.'),
});

export const updateTransactionSchema = createTransactionSchema.partial();

const emptyToUndefined = (value: unknown) =>
  value === '' || value === undefined ? undefined : value;

export const listTransactionsQuerySchema = z.object({
  type: z.preprocess(
    emptyToUndefined,
    z.enum(['INCOME', 'EXPENSE']).optional(),
  ),
  categoryId: z.preprocess(emptyToUndefined, z.uuid().optional()),
  from: z.preprocess(emptyToUndefined, isoDate.optional()),
  to: z.preprocess(emptyToUndefined, isoDate.optional()),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
