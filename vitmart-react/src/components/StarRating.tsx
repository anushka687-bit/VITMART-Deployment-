import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StarRating({ rating, reviews, size = 'sm' }: { rating: number; reviews?: number; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3 h-3'
  const tx = size === 'lg' ? 'text-base' : size === 'md' ? 'text-sm' : 'text-xs'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn(sz, 'shrink-0', s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/25')} />
      ))}
      <span className={cn('font-bold text-foreground ml-1', tx)}>{rating.toFixed(1)}</span>
      {reviews !== undefined && <span className={cn('text-muted-foreground ml-0.5', tx)}>({reviews})</span>}
    </div>
  )
}
