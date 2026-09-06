import { calculateDailyAllowance } from './daily-allowance.js';

describe('calculateDailyAllowance', () => {
  it('divide o saldo disponível pelos dias restantes incluindo o dia atual', () => {
    const result = calculateDailyAllowance({
      availableBalance: '1400.00',
      today: '2026-09-17',
      periodFrom: '2026-09-01',
      periodTo: '2026-09-30',
    });

    expect(result).toEqual({
      availableBalance: '1400.00',
      remainingDays: 14,
      dailyAmount: '100.00',
    });
  });

  it('no último dia do período o gasto diário é o saldo inteiro', () => {
    const result = calculateDailyAllowance({
      availableBalance: '80.50',
      today: '2026-09-30',
      periodFrom: '2026-09-01',
      periodTo: '2026-09-30',
    });

    expect(result.remainingDays).toBe(1);
    expect(result.dailyAmount).toBe('80.50');
  });

  it('quando o período ainda não começou conta todos os dias do intervalo', () => {
    const result = calculateDailyAllowance({
      availableBalance: '310.00',
      today: '2026-09-04',
      periodFrom: '2026-10-01',
      periodTo: '2026-10-31',
    });

    expect(result.remainingDays).toBe(31);
    expect(result.dailyAmount).toBe('10.00');
  });

  it('quando o período já encerrou não sugere gasto diário', () => {
    const result = calculateDailyAllowance({
      availableBalance: '200.00',
      today: '2026-10-01',
      periodFrom: '2026-09-01',
      periodTo: '2026-09-30',
    });

    expect(result.remainingDays).toBe(0);
    expect(result.dailyAmount).toBe('0.00');
  });

  it('mantém valor negativo quando as despesas superam as receitas', () => {
    const result = calculateDailyAllowance({
      availableBalance: '-50.00',
      today: '2026-09-17',
      periodFrom: '2026-09-01',
      periodTo: '2026-09-30',
    });

    expect(result.remainingDays).toBe(14);
    expect(result.dailyAmount).toBe('-3.57');
  });

  it('com saldo zero o gasto diário é zero', () => {
    const result = calculateDailyAllowance({
      availableBalance: '0.00',
      today: '2026-09-04',
      periodFrom: '2026-09-01',
      periodTo: '2026-09-30',
    });

    expect(result.dailyAmount).toBe('0.00');
    expect(result.remainingDays).toBe(27);
  });
});
