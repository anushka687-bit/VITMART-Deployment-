import { cn } from '@/lib/utils'
import type { Condition } from '@/types'

export function ConditionBadge({ condition }: { condition: Condition }) {
  const map: Record<Condition, string> = {
    New: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    'Like New': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    Good: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    Fair: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
    Poor: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  }
  return <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', map[condition])}>{condition}</span>
}
