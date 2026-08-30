export const DEFAULT_CATEGORIES = [
  'Alimentação',
  'Moradia',
  'Transporte',
  'Lazer',
  'Saúde',
  'Educação',
  'Salário',
  'Outros',
] as const;

export type DefaultCategoryName = (typeof DEFAULT_CATEGORIES)[number];
