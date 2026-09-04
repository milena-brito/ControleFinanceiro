import { z } from 'zod';

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data válida.');

const emptyToUndefined = (value: unknown) =>
  value === '' || value === undefined ? undefined : value;

export const dashboardQuerySchema = z
  .object({
    from: z.preprocess(emptyToUndefined, isoDate.optional()),
    to: z.preprocess(emptyToUndefined, isoDate.optional()),
  })
  .refine((value) => Boolean(value.from) === Boolean(value.to), {
    message: 'Informe o início e o fim do período.',
  })
  .refine((value) => !value.from || !value.to || value.from <= value.to, {
    message: 'A data inicial deve ser anterior à final.',
  });

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
