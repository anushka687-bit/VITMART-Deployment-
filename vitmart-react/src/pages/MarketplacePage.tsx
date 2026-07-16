import { useState } from 'react'
import { Search, SlidersHorizontal, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Page, Product } from '@/types'
import { CATEGORIES } from '@/data/products'
import { ProductCard } from '@/components/ProductCard'

export function MarketplacePage({
  products, setPage, setSelected, onFav,
}: {
  products: Product[]
  setPage: (p: Page) => void
  setSelected: (p: Product) => void
  onFav: (id: number) => void
}) {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [condition, setCondition] = useState('All')
  const [sort, setSort] = useState('Newest')
  const [maxPrice, setMaxPrice] = useState(50000)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = products
    .filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
      if (cat !== 'All' && p.category !== cat) return false
      if (condition !== 'All' && p.condition !== condition) return false
      if (p.price > maxPrice) return false
      return true
    })
    .sort((a, b) => {
      if (sort === 'Price: Low to High') return a.price - b.price
      if (sort === 'Price: High to Low') return b.price - a.price
      if (sort === 'Oldest') return a.id - b.id
      return b.id - a.id
    })

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-poppins text-foreground mb-4">Browse Marketplace</h1>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search products, books, electronics..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={cn('flex items-center gap-2 px-4 py-3 border rounded-xl text-sm font-medium transition-colors', showFilters ? 'bg-primary text-white border-primary' : 'bg-card border-border hover:border-primary/40')}>
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-card border border-border rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Category</label>
              <select value={cat} onChange={(e) => setCat(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                <option>All</option>{CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Condition</label>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                {['All', 'New', 'Like New', 'Good', 'Fair', 'Poor'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Sort By</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                {['Newest', 'Oldest', 'Price: Low to High', 'Price: High to Low'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Max Price: ₹{maxPrice.toLocaleString()}</label>
              <input type="range" min={100} max={50000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>₹100</span><span>₹50,000</span></div>
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {['All', ...CATEGORIES.map((c) => c.name)].map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cn('whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors shrink-0', cat === c ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground')}>
              {c}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> results
          {search && <> for "<span className="text-primary">{search}</span>"</>}
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onView={(prod) => { setSelected(prod); setPage('product') }} onFavourite={onFav} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-center">
            <Package className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground text-sm">Try different keywords or filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
