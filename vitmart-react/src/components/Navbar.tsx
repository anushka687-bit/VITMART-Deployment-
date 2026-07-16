import { useState } from 'react'
import {
  Search, Bell, Menu, X, Plus, Store, User, Heart, MessageSquare,
  LogOut, Moon, Sun, ChevronDown, Home, ShieldCheck, Package, Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Page } from '@/types'
import type { CurrentUser } from '@/App'
import { VerifiedBadge } from './VerifiedBadge'

export function Navbar({
  page, setPage, isDark, setIsDark, isLoggedIn, user, onLogout,
}: {
  page: Page
  setPage: (p: Page) => void
  isDark: boolean
  setIsDark: (v: boolean) => void
  isLoggedIn: boolean
  user: CurrentUser | null
  onLogout: () => void
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdown, setDropdown] = useState(false)

  const navLinks = [
    { label: 'Home', p: 'landing' as Page },
    { label: 'Browse', p: 'marketplace' as Page },
    ...(isLoggedIn ? [{ label: 'Saved', p: 'favourites' as Page }, { label: 'Messages', p: 'chat' as Page }] : []),
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <button onClick={() => setPage('landing')} className="flex items-center gap-2 shrink-0 select-none">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground font-poppins">
             VIT<span className="text-blue-600">Mart</span>
            </span>
          </button>

          <div className="hidden md:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2 bg-muted rounded-xl text-sm border border-transparent focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                onClick={() => setPage('marketplace')}
                readOnly
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((l) => (
              <button
                key={l.label}
                onClick={() => setPage(l.p)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  page === l.p ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            {isLoggedIn && (
              <button onClick={() => setPage('sell')} className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> Sell Item
              </button>
            )}
            <button onClick={() => setIsDark(!isDark)} className="w-9 h-9 rounded-xl bg-muted hover:bg-accent flex items-center justify-center transition-colors">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {!isLoggedIn && (
              <button onClick={() => { window.location.href = `${import.meta.env.VITE_ADMIN_URL}/login` }} title="Admin" className="w-9 h-9 rounded-xl bg-muted hover:bg-accent flex items-center justify-center transition-colors">
                <Lock className="w-4 h-4" />
              </button>
            )}

            {isLoggedIn ? (
              <>
                <button className="relative w-9 h-9 rounded-xl bg-muted hover:bg-accent flex items-center justify-center transition-colors">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
                </button>

                <div className="relative">
                  <button onClick={() => setDropdown(!dropdown)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-muted transition-colors">
                    <img src={user?.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20" />
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-semibold text-foreground leading-none">{user?.name}</p>
                      <p className="text-xs text-muted-foreground leading-none mt-0.5">Student</p>
                    </div>
                    <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform duration-200', dropdown ? 'rotate-180' : '')} />
                  </button>

                  {dropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdown(false)} />
                      <div className="absolute right-0 top-full mt-2 w-60 bg-card rounded-2xl border border-border shadow-2xl z-50 overflow-hidden">
                        <div className="px-4 py-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-b border-border">
                          <div className="flex items-center gap-3">
                            <img src={user?.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-foreground">{user?.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-col gap-1">
                            <VerifiedBadge size="sm" />
                          </div>
                        </div>
                        <div className="py-1.5">
                          {[
                            { icon: <User className="w-4 h-4" />, label: 'My Profile', p: 'profile' as Page },
                            { icon: <Heart className="w-4 h-4" />, label: 'Saved Items', p: 'favourites' as Page },
                            { icon: <MessageSquare className="w-4 h-4" />, label: 'Messages', p: 'chat' as Page },
                            { icon: <Package className="w-4 h-4" />, label: 'My Listings', p: 'profile' as Page },
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={() => { setPage(item.p); setDropdown(false) }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left"
                            >
                              <span className="text-muted-foreground">{item.icon}</span>
                              {item.label}
                            </button>
                          ))}
                        </div>
                        <div className="border-t border-border py-1.5">
                          <button
                            onClick={() => { onLogout(); setDropdown(false) }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setPage('auth')} className="px-4 py-2 text-sm font-semibold text-foreground border border-border rounded-xl hover:bg-muted transition-colors">
                  Log In
                </button>
                <button onClick={() => setPage('register')} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" /> Register
                </button>
              </div>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white dark:bg-gray-900 px-4 py-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2.5 bg-muted rounded-xl text-sm focus:outline-none" onClick={() => { setPage('marketplace'); setMobileOpen(false) }} readOnly />
          </div>
          <div className={cn('grid gap-1', isLoggedIn ? 'grid-cols-4' : 'grid-cols-2')}>
            {navLinks.map((l) => (
              <button key={l.label} onClick={() => { setPage(l.p); setMobileOpen(false) }} className={cn('flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-semibold transition-colors', page === l.p ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted')}>
                {l.label === 'Home' && <Home className="w-4 h-4" />}
                {l.label === 'Browse' && <Store className="w-4 h-4" />}
                {l.label === 'Saved' && <Heart className="w-4 h-4" />}
                {l.label === 'Messages' && <MessageSquare className="w-4 h-4" />}
                {l.label}
              </button>
            ))}
          </div>
          {isLoggedIn ? (
            <div className="flex gap-2">
              <button onClick={() => { setPage('sell'); setMobileOpen(false) }} className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold">
                <Plus className="w-4 h-4" /> Sell Item
              </button>
              <button onClick={() => { setPage('profile'); setMobileOpen(false) }} className="flex items-center justify-center w-11 bg-muted rounded-xl">
                <img src={user?.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => { setPage('auth'); setMobileOpen(false) }} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">Log In</button>
              <button onClick={() => { setPage('register'); setMobileOpen(false) }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Register
              </button>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-border pt-3 text-sm text-muted-foreground">
            <button onClick={() => setIsDark(!isDark)} className="flex items-center gap-1.5">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {isDark ? 'Light' : 'Dark'} Mode
            </button>
            {!isLoggedIn && (
              <button onClick={() => { window.location.href = `${import.meta.env.VITE_ADMIN_URL}/login` }} className="flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> Admin
              </button>
            )}
            {isLoggedIn && (
              <button onClick={() => { onLogout(); setMobileOpen(false) }} className="flex items-center gap-1.5 text-red-500">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
