/**
 * Regras puras de parcelamento no cartão (sem I/O).
 */

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Adiciona meses ao calendário, mantendo o dia quando possível (ex.: 31 → 28 em fevereiro). */
export function addCalendarMonths(source: Date, months: number): Date {
  const y = source.getFullYear();
  const m = source.getMonth();
  const d = source.getDate();
  const targetMonth = m + months;
  const ty = y + Math.floor(targetMonth / 12);
  let tm = targetMonth % 12;
  if (tm < 0) tm += 12;
  const dim = daysInMonth(ty, tm);
  return new Date(ty, tm, Math.min(d, dim), 12, 0, 0, 0);
}

/**
 * Compra no cartão: 1ª cobrança no mês seguinte à data âncora da compra (regra de fatura).
 */
export function firstCreditCardInstallmentDate(purchaseAnchorDate: Date): Date {
  return addCalendarMonths(purchaseAnchorDate, 1);
}

/** Datas da parcela i = 0..n-1 cobram em first + i meses. */
export function buildCreditCardInstallmentDates(
  purchaseAnchorDate: Date,
  installmentCount: number,
): Date[] {
  const first = firstCreditCardInstallmentDate(purchaseAnchorDate);
  return Array.from({ length: installmentCount }, (_, i) => addCalendarMonths(first, i));
}

/** Divide valor total em centavos e distribui uniformemente; centavos extras nas primeiras parcelas. */
export function splitInstallmentAmounts(total: number, installmentCount: number): number[] {
  if (installmentCount < 1) return [];
  const cents = Math.round(total * 100);
  const base = Math.floor(cents / installmentCount);
  const remainder = cents % installmentCount;
  return Array.from({ length: installmentCount }, (_, i) => (base + (i < remainder ? 1 : 0)) / 100);
}

export function formatNextChargeMonthLabel(referenceDate: Date, locale = 'pt-BR'): string {
  const d = firstCreditCardInstallmentDate(referenceDate);
  return d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}
