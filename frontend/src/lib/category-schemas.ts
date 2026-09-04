import { z } from 'zod';

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Informe pelo menos 2 caracteres.')
    .max(40, 'O nome pode ter no máximo 40 caracteres.'),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
