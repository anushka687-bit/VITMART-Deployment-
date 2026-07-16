import { ArrowRight, Heart } from 'lucide-react'
import type { Page, Product } from '@/types'
import { ProductCard } from '@/components/ProductCard'

export function FavouritesPage({
  products, setPage, setSelected, onFav,
}: {
  products: Product[]
  setPage: (p: Page) => void
  setSelected: (p: Product) => void
  onFav: (id: number) => void
}) {
  const saved = products.filter((p) => p.favourited)
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-poppins text-foreground">Saved Items</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{saved.length} product{saved.length !== 1 ? 's' : ''} saved</p>
          </div>
          <button onClick={() => setPage('marketplace')} className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:gap-2.5 transition-all">
            Browse more <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {saved.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {saved.map((p) => (
              <ProductCard key={p.id} product={p} onView={(prod) => { setSelected(prod); setPage('product') }} onFavourite={onFav} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4"><Heart className="w-10 h-10 text-muted-foreground/40" /></div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No saved items yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">Tap the heart icon on any listing to save it here.</p>
            <button onClick={() => setPage('marketplace')} className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">Start Browsing</button>
          </div>
        )}
      </div>
    </div>
  )
}
