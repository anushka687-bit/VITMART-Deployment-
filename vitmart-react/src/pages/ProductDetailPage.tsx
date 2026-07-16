import { useEffect, useState } from 'react'
import {
  ChevronRight, ChevronLeft, ShieldCheck, Eye, MessageCircle, Heart, Share2,
  Phone, Tag, MapPin, Clock, Flag,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Page, Product } from '@/types'
import { apiGet, apiPost } from '@/lib/api'
import type { ApiReviewsResponse } from '@/lib/adapters'
import { ConditionBadge } from '@/components/ConditionBadge'
import { StarRating } from '@/components/StarRating'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import { ReviewSection } from '@/components/ReviewSection'
import { ReportModal } from '@/components/ReportModal'
import { ProductCard } from '@/components/ProductCard'
import type { CurrentUser } from '@/App'

export function ProductDetailPage({
  product, products, setPage, setSelected, onFav, currentUser,
}: {
  product: Product
  products: Product[]
  setPage: (p: Page) => void
  setSelected: (p: Product) => void
  onFav: (id: number) => void
  currentUser: CurrentUser | null
}) {
  const [imgIdx, setImgIdx] = useState(0)
  const [showReport, setShowReport] = useState(false)
  const [starting, setStarting] = useState(false)
  const [sellerRating, setSellerRating] = useState(0)
  const [sellerReviewCount, setSellerReviewCount] = useState(0)
  const related = products.filter((p) => p.id !== product.id && p.category === product.category && !p.sold).slice(0, 4)
  const allImgs = product.images.length > 0 ? product.images : [product.image]
  const sellerListings = products.filter((p) => p.sellerId === product.sellerId)
  const sellerSoldCount = sellerListings.filter((p) => p.sold).length

  useEffect(() => {
    apiGet<ApiReviewsResponse>(`/users/${product.sellerId}/reviews`)
      .then((res) => { setSellerRating(res.average_rating); setSellerReviewCount(res.review_count) })
      .catch(() => { setSellerRating(0); setSellerReviewCount(0) })
  }, [product.sellerId])

  async function startChat() {
    if (!currentUser) { setPage('auth'); return }
    setStarting(true)
    try {
      await apiPost('/conversations', { product_id: product.id, message: 'Hi, is this still available?' })
      setPage('chat')
    } catch {
      setPage('chat')
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => setPage('landing')} className="hover:text-primary transition-colors">Home</button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => setPage('marketplace')} className="hover:text-primary transition-colors">Marketplace</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden">
              <img src={allImgs[imgIdx]} alt={product.title} className="w-full h-full object-cover" />
              {product.sold && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-white text-gray-900 font-bold text-lg px-6 py-2 rounded-full">SOLD</span>
                </div>
              )}
              {allImgs.length > 1 && (
                <>
                  <button onClick={() => setImgIdx((i) => (i - 1 + allImgs.length) % allImgs.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow hover:scale-110 transition-transform"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={() => setImgIdx((i) => (i + 1) % allImgs.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow hover:scale-110 transition-transform"><ChevronRight className="w-5 h-5" /></button>
                </>
              )}
              {product.verified && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-blue-600/90 text-white rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Listing
                </div>
              )}
            </div>
            {allImgs.length > 1 && (
              <div className="flex gap-2">
                {allImgs.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} className={cn('w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors', i === imgIdx ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100')}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-3">Description</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="flex items-center gap-1.5 text-xs bg-muted rounded-full px-3 py-1 text-muted-foreground"><Tag className="w-3 h-3" />{product.category}</span>
                <span className="flex items-center gap-1.5 text-xs bg-muted rounded-full px-3 py-1 text-muted-foreground"><MapPin className="w-3 h-3" />{product.hostel}</span>
                <span className="flex items-center gap-1.5 text-xs bg-muted rounded-full px-3 py-1 text-muted-foreground"><Clock className="w-3 h-3" />{product.posted}</span>
              </div>
            </div>

            <ReviewSection revieweeId={product.sellerId} productId={product.id} currentUser={currentUser} />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <ConditionBadge condition={product.condition} />
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><Eye className="w-3.5 h-3.5" />{product.views} views</div>
              </div>
              <h1 className="text-xl font-bold text-foreground mb-3 leading-snug">{product.title}</h1>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
                {product.negotiable && <span className="text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full">Negotiable</span>}
              </div>
              <div className="flex gap-2 mb-4">
                <button onClick={startChat} disabled={starting} className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                  <MessageCircle className="w-4 h-4" /> Chat with Seller
                </button>
                <button onClick={() => onFav(product.id)} className={cn('w-12 h-12 rounded-xl border flex items-center justify-center transition-all', product.favourited ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'border-border hover:border-primary/40 bg-card')}>
                  <Heart className={cn('w-5 h-5', product.favourited ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />
                </button>
                <button onClick={() => setShowReport(true)} title="Report this listing" className="w-12 h-12 rounded-xl border border-border bg-card flex items-center justify-center hover:border-red-300 hover:text-red-500 transition-colors">
                  <Flag className="w-5 h-5 text-muted-foreground" />
                </button>
                <button className="w-12 h-12 rounded-xl border border-border bg-card flex items-center justify-center hover:border-primary/40 transition-colors">
                  <Share2 className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <button onClick={() => setPage('chat')} className="w-full flex items-center justify-center gap-2 border border-border py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors">
                <Phone className="w-4 h-4" /> Request Phone Number
              </button>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Seller</p>
              <div className="flex items-start gap-3 mb-4">
                <div className="relative shrink-0">
                  <img src={product.sellerAvatar} alt={product.seller} className="w-12 h-12 rounded-full object-cover ring-2 ring-border" />
                  {product.verified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center ring-2 ring-card">
                      <ShieldCheck className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground mb-1">{product.seller}</p>
                  {product.verified && <VerifiedBadge size="sm" />}
                  <p className="text-xs text-muted-foreground mt-1">{product.hostel}</p>
                  {sellerReviewCount > 0 && <div className="mt-1.5"><StarRating rating={sellerRating} reviews={sellerReviewCount} size="sm" /></div>}
                </div>
              </div>
              <div className="grid grid-cols-3 border border-border rounded-xl overflow-hidden mb-4">
                {[
                  { label: 'Listings', val: String(sellerListings.length) },
                  { label: 'Sold', val: String(sellerSoldCount) },
                  { label: 'Rating', val: sellerReviewCount > 0 ? sellerRating.toFixed(1) : '—' },
                ].map((s, i) => (
                  <div key={s.label} className={cn('py-3 text-center', i > 0 ? 'border-l border-border' : '')}>
                    <p className="font-bold text-foreground text-sm">{s.val}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <button onClick={startChat} disabled={starting} className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                <MessageCircle className="w-4 h-4" /> Start Chat
              </button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold font-poppins text-foreground mb-5">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} onView={(prod) => { setSelected(prod); setImgIdx(0) }} onFavourite={onFav} />
              ))}
            </div>
          </div>
        )}
      </div>
      {showReport && <ReportModal productId={product.id} onClose={() => setShowReport(false)} />}
    </div>
  )
}
