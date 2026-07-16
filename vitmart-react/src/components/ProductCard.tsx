import { Heart, ShieldCheck, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product } from '@/types'
import { ConditionBadge } from './ConditionBadge'

export function ProductCard({
  product, onView, onFavourite,
}: {
  product: Product
  onView: (p: Product) => void
  onFavourite: (id: number) => void
}) {
  return (
    <div
      className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
      onClick={() => onView(product)}
    >
      <div className="relative overflow-hidden bg-muted">
        <img src={product.image} alt={product.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
        {product.sold && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-white text-gray-900 font-bold text-sm px-4 py-1 rounded-full tracking-wide">SOLD</span>
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onFavourite(product.id) }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:scale-110 transition-transform"
        >
          <Heart className={cn('w-4 h-4 transition-colors', product.favourited ? 'fill-red-500 text-red-500' : 'text-gray-400')} />
        </button>
        {product.verified && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-blue-600/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs text-white font-medium">
            <ShieldCheck className="w-3 h-3" /> Verified
          </div>
        )}
      </div>
      <div className="p-3.5">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-2 leading-snug">{product.title}</h3>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</span>
          <ConditionBadge condition={product.condition} />
        </div>
        {product.negotiable && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1.5">✓ Negotiable</p>}
        <div className="flex items-center justify-between pt-2.5 border-t border-border">
          <div className="flex items-center gap-1.5 min-w-0">
            <img src={product.sellerAvatar} alt={product.seller} className="w-5 h-5 rounded-full object-cover ring-1 ring-border shrink-0" />
            <span className="text-xs text-muted-foreground truncate max-w-[80px]">{product.seller}</span>
            {product.verified && <ShieldCheck className="w-3 h-3 text-blue-500 shrink-0" />}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Eye className="w-3 h-3" />{product.views}
          </div>
        </div>
      </div>
    </div>
  )
}
