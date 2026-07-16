import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function VerifiedBadge({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 rounded-full font-semibold whitespace-nowrap',
      size === 'md' ? 'text-xs px-2.5 py-1 gap-1.5' : 'text-xs px-2 py-0.5'
    )}>
      <ShieldCheck className={size === 'md' ? 'w-3.5 h-3.5 shrink-0' : 'w-3 h-3 shrink-0'} />
      Verified VIT Student
    </span>
  )
}
