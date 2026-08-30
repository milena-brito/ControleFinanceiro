import { DEFAULT_CATEGORIES } from './default-categories.js';

describe('DEFAULT_CATEGORIES', () => {
  it('inclui as categorias do MVP', () => {
    expect(DEFAULT_CATEGORIES).toEqual([
      'Alimentação',
      'Moradia',
      'Transporte',
      'Lazer',
      'Saúde',
      'Educação',
      'Salário',
      'Outros',
    ]);
  });

  it('não possui nomes duplicados', () => {
    expect(new Set(DEFAULT_CATEGORIES).size).toBe(DEFAULT_CATEGORIES.length);
  });
});
