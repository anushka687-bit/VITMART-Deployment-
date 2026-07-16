import { useEffect, useState } from 'react'
import {
  Camera, Edit, Plus, Clock, ShieldCheck, Bookmark,
  Package, ShoppingBag, DollarSign, Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Page, Product } from '@/types'
import { apiGet } from '@/lib/api'
import { mapApiConversationToConvo, type ApiConversation } from '@/lib/adapters'
import { StatCard } from '@/components/StatCard'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import { StarRating } from '@/components/StarRating'
import { ProductCard } from '@/components/ProductCard'
import { ReviewSection } from '@/components/ReviewSection'
import type { CurrentUser } from '@/App'

export function ProfilePage({
  products, setPage, setSelected, onFav, currentUser,
}: {
  products: Product[]
  setPage: (p: Page) => void
  setSelected: (p: Product) => void
  onFav: (id: number) => void
  currentUser: CurrentUser | null
}) {
  const [tab, setTab] = useState<'listings' | 'sold' | 'saved' | 'messages' | 'reviews'>('listings')
  const [conversations, setConversations] = useState<ReturnType<typeof mapApiConversationToConvo>[]>([])

  const myListings = products.filter((p) => p.sellerId === currentUser?.id)
  const soldItems = myListings.filter((p) => p.sold)
  const savedItems = products.filter((p) => p.favourited)

  useEffect(() => {
    if (!currentUser) return
    apiGet<ApiConversation[]>('/conversations')
      .then((raw) => setConversations(raw.map((c) => mapApiConversationToConvo(c, currentUser.id))))
      .catch(() => setConversations([]))
  }, [currentUser])

  const tabs = [
    { key: 'listings' as const, label: 'My Listings', count: myListings.length },
    { key: 'sold' as const, label: 'Sold', count: soldItems.length },
    { key: 'saved' as const, label: 'Saved', count: savedItems.length },
    { key: 'messages' as const, label: 'Messages', count: conversations.length },
    { key: 'reviews' as const, label: 'Reviews', count: currentUser?.reviewsCount ?? 0 },
  ]

  const displayProducts = tab === 'listings' ? myListings : tab === 'sold' ? soldItems : tab === 'saved' ? savedItems : []

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Sign in to view your profile.</p>
          <button onClick={() => setPage('auth')} className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold">Sign In</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden mb-6">
          <div className="h-28 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="relative">
                <img src={currentUser.avatar} alt="Profile" className="w-20 h-20 rounded-2xl object-cover border-4 border-card shadow-lg" />
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow">
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              <div className="flex gap-2 pt-12">
                <button className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                  <Edit className="w-3.5 h-3.5" /> Edit Profile
                </button>
                <button onClick={() => setPage('sell')} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> New Listing
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-xl font-bold text-foreground">{currentUser.name}</h1>
                  <VerifiedBadge size="md" />
                </div>
                <p className="text-muted-foreground text-sm">{currentUser.email}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />VITMart member</span>
                </div>
                {currentUser.reviewsCount > 0 && (
                  <div className="mt-2">
                    <StarRating rating={currentUser.avgRating} reviews={currentUser.reviewsCount} size="md" />
                  </div>
                )}
              </div>
              <div className="flex gap-6 text-center">
                {[
                  { v: String(myListings.length), l: 'Listings' },
                  { v: String(soldItems.length), l: 'Sold' },
                ].map((s) => (
                  <div key={s.l}>
                    <p className="text-2xl font-bold text-foreground">{s.v}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total Listings" value={String(myListings.length)} icon={<Package className="w-4 h-4 text-blue-600" />} color="bg-blue-100 dark:bg-blue-900/40" />
          <StatCard label="Items Sold" value={String(soldItems.length)} icon={<ShoppingBag className="w-4 h-4 text-green-600" />} color="bg-green-100 dark:bg-green-900/40" />
          <StatCard label="Total Earnings" value={`₹${soldItems.reduce((sum, p) => sum + p.price, 0).toLocaleString()}`} icon={<DollarSign className="w-4 h-4 text-amber-600" />} color="bg-amber-100 dark:bg-amber-900/40" />
          <StatCard label="Seller Rating" value={currentUser.reviewsCount > 0 ? `★ ${currentUser.avgRating.toFixed(1)}` : '—'} icon={<Star className="w-4 h-4 text-purple-600" />} color="bg-purple-100 dark:bg-purple-900/40" />
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex border-b border-border overflow-x-auto no-scrollbar">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={cn('flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px', tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
                {t.label}
                {t.count > 0 && <span className={cn('text-xs rounded-full px-2 py-0.5 font-bold', tab === t.key ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>{t.count}</span>}
              </button>
            ))}
          </div>
          <div className="p-5">
            {tab === 'messages' ? (
              <div className="space-y-3">
                {conversations.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No conversations yet.</p>}
                {conversations.map((c) => (
                  <button key={c.id} onClick={() => setPage('chat')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left">
                    <img src={c.avatar} alt={c.user} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-semibold text-sm text-foreground">{c.user}</span>
                        {c.verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                        <span className="text-xs text-muted-foreground ml-auto">{c.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
                    </div>
                    {c.unread > 0 && <span className="w-5 h-5 bg-primary rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0">{c.unread}</span>}
                  </button>
                ))}
              </div>
            ) : tab === 'reviews' ? (
              <ReviewSection revieweeId={currentUser.id} currentUser={currentUser} />
            ) : displayProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {displayProducts.map((p) => (
                  <ProductCard key={p.id} product={p} onView={(prod) => { setSelected(prod); setPage('product') }} onFavourite={onFav} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bookmark className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Nothing here yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
