import type { FixedExpenseGroup } from '@/lib/validators/fixed-expense';

export const FIXED_EXPENSE_GROUPS: Array<{
  group: FixedExpenseGroup;
  href: string;
  label: string;
  exact: boolean;
  empty: string;
}> = [
  {
    group: 'PLANOS',
    href: '/financas/gastos-fixos/planos',
    label: 'Planos',
    exact: false,
    empty: 'Nenhum plano cadastrado. Adicione assinaturas, academias e outros planos mensais.',
  },
  {
    group: 'INVESTIMENTOS',
    href: '/financas/gastos-fixos/investimentos',
    label: 'Investimentos',
    exact: false,
    empty: 'Nenhum gasto de investimento. Adicione aportes e custos que se repetem todo mês.',
  },
  {
    group: 'GERAL',
    href: '/financas/gastos-fixos',
    label: 'Geral',
    exact: true,
    empty: 'Nenhum gasto geral. Adicione aluguel, contas e outras despesas mensais.',
  },
];

export function fixedExpenseGroupMeta(group: FixedExpenseGroup) {
  const meta = FIXED_EXPENSE_GROUPS.find((item) => item.group === group);
  if (!meta) throw new Error('Grupo de gasto fixo inválido');
  return meta;
}
