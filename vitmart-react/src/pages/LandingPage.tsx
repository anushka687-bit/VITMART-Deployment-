import { useEffect, useState } from 'react'
import {
  Search, ArrowRight, ShieldCheck, Plus, MapPin, Star, Store,
} from 'lucide-react'
import type { Page, Product } from '@/types'
import { CATEGORIES } from '@/data/products'
import { apiGet } from '@/lib/api'
import { ProductCard } from '@/components/ProductCard'

interface PublicStats {
  active_students: number
  total_listings: number
  successful_trades: number
}

export function LandingPage({
  products, setPage, setSelected, onFav, isLoggedIn,
}: {
  products: Product[]
  setPage: (p: Page) => void
  setSelected: (p: Product) => void
  onFav: (id: number) => void
  isLoggedIn: boolean
}) {
  const trending = products.filter((p) => !p.sold).slice(0, 4)
  const [stats, setStats] = useState<PublicStats | null>(null)

  useEffect(() => {
    let active = true
    apiGet<PublicStats>('/stats')
      .then((s) => { if (active) setStats(s) })
      .catch(() => { /* stats are non-critical; keep placeholders */ })
    return () => { active = false }
  }, [])

  const fmt = (n: number | undefined) =>
    typeof n === 'number' ? n.toLocaleString('en-IN') : '—'

  return (
    <div className="bg-background">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" />
              Exclusively for VIT students
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-poppins leading-tight mb-5">
              Buy and Sell<br /><span className="text-yellow-300">Within Your Campus</span>
            </h1>
            <p className="text-blue-100 text-lg md:text-xl mb-8 leading-relaxed">
              The safest marketplace for VIT students. Trade books, electronics, cycles, and hostel essentials — all verified by your campus community.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setPage('marketplace')} className="flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-6 py-3.5 rounded-xl text-base hover:bg-blue-50 transition-colors shadow-lg">
                <Search className="w-5 h-5" /> Browse Products
              </button>
              {!isLoggedIn ? (
                <button onClick={() => setPage('auth')} className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold px-6 py-3.5 rounded-xl text-base hover:bg-white/20 transition-colors">
                  <ShieldCheck className="w-5 h-5" /> Join VITMart Free
                </button>
              ) : (
                <button onClick={() => setPage('sell')} className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold px-6 py-3.5 rounded-xl text-base hover:bg-white/20 transition-colors">
                  <Plus className="w-5 h-5" /> List an Item
                </button>
              )}
            </div>
          </div>
        </div>

      </section>

      <section className="max-w-3xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-2 flex gap-2">
          <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-muted rounded-xl">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input type="text" placeholder="Search for books, electronics, cycles..." className="flex-1 bg-transparent text-sm focus:outline-none text-foreground placeholder:text-muted-foreground" onClick={() => setPage('marketplace')} readOnly />
          </div>
          <button onClick={() => setPage('marketplace')} className="bg-primary text-white px-6 py-2 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors whitespace-nowrap">Search</button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div><h2 className="text-2xl font-bold text-foreground font-poppins">Browse Categories</h2><p className="text-muted-foreground text-sm mt-1">Find exactly what you need</p></div>
          <button onClick={() => setPage('marketplace')} className="text-sm text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">View all <ArrowRight className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => (
            <button key={cat.name} onClick={() => setPage('marketplace')} className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md transition-all">
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-xs font-semibold text-foreground text-center leading-tight">{cat.name}</span>
              {cat.count > 0 && <span className="text-xs text-muted-foreground">{cat.count}</span>}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div><h2 className="text-2xl font-bold text-foreground font-poppins">Trending Now</h2><p className="text-muted-foreground text-sm mt-1">Most viewed listings this week</p></div>
          <button onClick={() => setPage('marketplace')} className="text-sm text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">See all <ArrowRight className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {trending.map((p) => (
            <ProductCard key={p.id} product={p} onView={(prod) => { setSelected(prod); setPage('product') }} onFavourite={onFav} />
          ))}
        </div>
      </section>

      <section className="bg-muted/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <ShieldCheck className="w-6 h-6 text-blue-600" />, title: 'Verified VIT Students Only', desc: 'Every account verified with @vit.ac.in email. No outsiders, no strangers.' },
              { icon: <MapPin className="w-6 h-6 text-blue-600" />, title: 'On-Campus Pickup', desc: 'Meet safely inside campus hostels or the main gate — always within your community.' },
              { icon: <Star className="w-6 h-6 text-blue-600" />, title: 'Trusted Seller Ratings', desc: 'Rate your experience after every trade and build a trustworthy community.' },
            ].map((t) => (
              <div key={t.title} className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center shrink-0">{t.icon}</div>
                <div><h3 className="font-semibold text-foreground mb-1">{t.title}</h3><p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 text-white">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-poppins mb-2">VITMart by the Numbers</h2>
            <p className="text-blue-200">Growing every day with your campus community</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { value: fmt(stats?.active_students), label: 'Active Students' },
              { value: fmt(stats?.total_listings), label: 'Total Listings' },
              { value: fmt(stats?.successful_trades), label: 'Successful Trades' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold font-poppins text-yellow-300">{s.value}</p>
                <p className="text-blue-200 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center"><Store className="w-4 h-4 text-white" /></div>
             <span className="font-bold text-white">VIT<span className="text-blue-600">Mart</span></span>
            </div>
            <p className="text-sm text-center">Built for VIT students, by VIT students. © 2026 VITMart.</p>
            <div className="flex gap-4 text-sm">
              {['Privacy', 'Terms', 'Help'].map((l) => <button key={l} className="hover:text-white transition-colors">{l}</button>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
