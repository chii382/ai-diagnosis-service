/** フリープラン */
export const PLAN_FREE = 0;
/** プロプラン */
export const PLAN_PRO = 1;

export function normalizePlan(value: unknown): number {
  if (value === PLAN_PRO || value === 1) return PLAN_PRO;
  return PLAN_FREE;
}

export function escapeRegexChars(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
