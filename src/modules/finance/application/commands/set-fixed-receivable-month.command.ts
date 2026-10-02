import { fixedReceivableRepository } from '../../infrastructure/fixed-receivable.repository';

export async function setFixedReceivableMonthCommand(
  userId: string,
  id: string,
  year: number,
  month: number,
  paid: boolean,
) {
  const item = await fixedReceivableRepository.setMonthPaid(userId, id, year, month, paid);
  return { item };
}
