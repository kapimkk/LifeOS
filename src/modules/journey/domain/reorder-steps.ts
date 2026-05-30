/** Após exclusão, renumera `order` de 1..N sem buracos. */
export function compactStepOrders<T extends { id: string; order: number }>(
  steps: T[],
): Array<{ id: string; order: number }> {
  return [...steps]
    .sort((a, b) => a.order - b.order)
    .map((step, index) => ({ id: step.id, order: index + 1 }));
}
