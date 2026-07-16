import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function StatCard({ label, value, icon, color }: { label: string; value: string; icon: ReactNode; color: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', color)}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  )
}
