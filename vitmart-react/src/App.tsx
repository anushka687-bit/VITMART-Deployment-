import { useEffect, useState } from 'react'
import { Home, Store, Plus, Heart, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Page, Product } from '@/types'
import { apiDelete, apiGet, apiPost, ApiError, getToken, setToken } from '@/lib/api'
import { mapApiProductToProduct, storageUrl, type ApiProduct, type ApiUser } from '@/lib/adapters'
import { Navbar } from '@/components/Navbar'
import { LandingPage } from '@/pages/LandingPage'
import { MarketplacePage } from '@/pages/MarketplacePage'
import { ProductDetailPage } from '@/pages/ProductDetailPage'
import { SellPage } from '@/pages/SellPage'
import { AuthPage } from '@/pages/AuthPage'
import { AdminLoginPage } from '@/pages/AdminLoginPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { FavouritesPage } from '@/pages/FavouritesPage'
import { ChatPage } from '@/pages/ChatPage'

export interface CurrentUser {
  id: number
  name: string
  email: string
  avatar: string
  reviewsCount: number
  avgRating: number
}

function toCurrentUser(u: ApiUser): CurrentUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: storageUrl(u.avatar),
    reviewsCount: u.reviews_received_count ?? 0,
    avgRating: u.reviews_received_avg_rating ?? 0,
  }
}

export default function App() {
  const [page, setPage] = useState<Page>('landing')
  const [isDark, setIsDark] = useState(false)
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [selected, setSelected] = useState<Product | null>(null)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const isLoggedIn = !!user

  async function loadFavouriteIds(): Promise<Set<number>> {
    if (!getToken()) return new Set()
    try {
      const favs = await apiGet<ApiProduct[]>('/favourites')
      return new Set(favs.map((f) => f.id))
    } catch {
      return new Set()
    }
  }

  async function loadProducts() {
    const favIds = await loadFavouriteIds()
    let all: ApiProduct[] = []
    let path: string | null = '/products?per_page=100'
    while (path) {
      const res: { data: ApiProduct[]; next_page_url: string | null } = await apiGet(path)
      all = all.concat(res.data)
      path = res.next_page_url ? res.next_page_url.replace(/^.*\/api/, '') : null
    }
    setProducts(all.map((p) => mapApiProductToProduct(p, favIds)))
  }

  useEffect(() => {
    ;(async () => {
      if (getToken()) {
        try {
          const me = await apiGet<ApiUser>('/auth/user')
          setUser(toCurrentUser(me))
        } catch {
          setToken(null)
        }
      }
      setLoadingProducts(true)
      setLoadError(null)
      try {
        await loadProducts()
      } catch (e) {
        setLoadError(e instanceof ApiError ? e.message : 'Could not load products.')
      } finally {
        setLoadingProducts(false)
      }
    })()
  }, [])

  function addPublishedProduct(product: Product) {
    setProducts((prev) => [product, ...prev])
  }

  async function retryLoad() {
    setLoadingProducts(true)
    setLoadError(null)
    try {
      await loadProducts()
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : 'Could not load products.')
    } finally {
      setLoadingProducts(false)
    }
  }

  async function toggleFav(id: number) {
    if (!isLoggedIn) {
      navigate('auth')
      return
    }
    const product = products.find((p) => p.id === id)
    if (!product) return
    const nowFavourited = !product.favourited
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, favourited: nowFavourited } : p)))
    try {
      if (nowFavourited) await apiPost(`/favourites/${id}`)
      else await apiDelete(`/favourites/${id}`)
    } catch {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, favourited: !nowFavourited } : p)))
    }
  }

  function handleAuthenticated(apiUser: ApiUser) {
    setUser(toCurrentUser(apiUser))
    loadProducts()
  }

  function handleLogout() {
    setToken(null)
    setUser(null)
    setProducts((prev) => prev.map((p) => ({ ...p, favourited: false })))
  }

  function navigate(p: Page) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const selectedProduct = selected ? products.find((p) => p.id === selected.id) || selected : null

  return (
    <div className={isDark ? 'dark' : ''}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        * { font-family: 'Inter', 'Poppins', system-ui, sans-serif; }
        .font-poppins { font-family: 'Poppins', 'Inter', system-ui, sans-serif; }
      `}</style>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Navbar
          page={page}
          setPage={navigate}
          isDark={isDark}
          setIsDark={setIsDark}
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={handleLogout}
        />

        {loadError && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
            <div className="flex items-center justify-between gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 rounded-xl px-4 py-3 text-sm">
              <span>{loadError}</span>
              <button onClick={retryLoad} className="font-semibold hover:underline shrink-0">Retry</button>
            </div>
          </div>
        )}
        {loadingProducts && !loadError && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 text-center text-sm text-muted-foreground">Loading products…</div>
        )}

        {page === 'landing' && <LandingPage products={products} setPage={navigate} setSelected={(p) => { setSelected(p); navigate('product') }} onFav={toggleFav} isLoggedIn={isLoggedIn} />}
        {page === 'marketplace' && <MarketplacePage products={products} setPage={navigate} setSelected={(p) => { setSelected(p); navigate('product') }} onFav={toggleFav} />}
        {page === 'product' && selectedProduct && <ProductDetailPage product={selectedProduct} products={products} setPage={navigate} setSelected={setSelected} onFav={toggleFav} currentUser={user} />}
        {page === 'sell' && <SellPage setPage={navigate} onPublished={addPublishedProduct} />}
        {page === 'auth' && <AuthPage key="login" initialMode="login" setPage={navigate} onAuthenticated={handleAuthenticated} />}
        {page === 'register' && <AuthPage key="register" initialMode="register" setPage={navigate} onAuthenticated={handleAuthenticated} />}
        {page === 'adminLogin' && <AdminLoginPage setPage={navigate} />}
        {page === 'profile' && <ProfilePage products={products} setPage={navigate} setSelected={setSelected} onFav={toggleFav} currentUser={user} />}
        {page === 'favourites' && <FavouritesPage products={products} setPage={navigate} setSelected={(p) => { setSelected(p); navigate('product') }} onFav={toggleFav} />}
        {page === 'chat' && <ChatPage currentUser={user} setPage={navigate} />}

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-border z-40">
          <div className="flex items-center justify-around px-2 py-2">
            {[
              { icon: <Home className="w-5 h-5" />, label: 'Home', p: 'landing' as Page },
              { icon: <Store className="w-5 h-5" />, label: 'Browse', p: 'marketplace' as Page },
              { icon: <Plus className="w-5 h-5" />, label: 'Sell', p: 'sell' as Page, primary: true },
              { icon: <Heart className="w-5 h-5" />, label: 'Saved', p: 'favourites' as Page },
              { icon: <User className="w-5 h-5" />, label: 'Profile', p: (isLoggedIn ? 'profile' : 'auth') as Page },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.p)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors',
                  (item as { primary?: boolean }).primary
                    ? 'bg-primary text-white -mt-4 shadow-lg shadow-primary/30 px-4 py-2'
                    : page === item.p ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
