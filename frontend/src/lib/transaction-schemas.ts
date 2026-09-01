import { z } from 'zod';

export const transactionFormSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z
    .string()
    .trim()
    .min(1, 'Informe o valor.')
    .refine(
      (value) => Number(value.replace(',', '.')) > 0,
      'O valor deve ser maior que zero.',
    ),
  description: z
    .string()
    .trim()
    .min(1, 'Informe a descrição.')
    .max(200, 'A descrição pode ter no máximo 200 caracteres.'),
  date: z.string().min(1, 'Informe a data.'),
  categoryId: z.string().min(1, 'Selecione uma categoria.'),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
