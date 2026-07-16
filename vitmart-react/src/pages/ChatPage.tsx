import { useEffect, useRef, useState } from 'react'
import {
  Search, ChevronLeft, ShieldCheck, MoreVertical, CheckCheck, Send,
  Image as ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiGet, apiPost, ApiError } from '@/lib/api'
import { mapApiConversationToConvo, mapApiMessageToChatMsg, type ApiConversation, type ApiMessage } from '@/lib/adapters'
import type { Convo } from '@/types'
import type { Page } from '@/types'
import type { CurrentUser } from '@/App'

export function ChatPage({ currentUser, setPage }: { currentUser: CurrentUser | null; setPage: (p: Page) => void }) {
  const [convos, setConvos] = useState<Convo[]>([])
  const [active, setActive] = useState(0)
  const [msg, setMsg] = useState('')
  const [showSidebar, setShowSidebar] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [sendError, setSendError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const convo = convos[active]

  useEffect(() => {
    if (!currentUser) return
    apiGet<ApiConversation[]>('/conversations')
      .then((raw) => setConvos(raw.map((c) => mapApiConversationToConvo(c, currentUser.id))))
      .catch((e) => setLoadError(e instanceof ApiError ? e.message : 'Could not load conversations.'))
      .finally(() => setLoading(false))
  }, [currentUser])

  useEffect(() => {
    if (!currentUser || !convo) return
    apiGet<ApiMessage[]>(`/conversations/${convo.id}/messages`).then((messages) => {
      setConvos((prev) => prev.map((c, i) => (i === active ? { ...c, messages: messages.map((m) => mapApiMessageToChatMsg(m, currentUser.id)) } : c)))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, currentUser])

  function sendMsg() {
    if (!msg.trim() || !convo || !currentUser) return
    const text = msg
    setMsg('')
    setSendError('')
    apiPost<ApiMessage>(`/conversations/${convo.id}/messages`, { body: text })
      .then((created) => {
        setConvos((prev) => prev.map((c, i) =>
          i === active
            ? { ...c, messages: [...c.messages, mapApiMessageToChatMsg(created, currentUser.id)], lastMessage: text, time: 'Now' }
            : c
        ))
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      })
      .catch((e) => {
        setMsg(text)
        setSendError(e instanceof ApiError ? e.message : 'Failed to send message.')
      })
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Sign in to view your messages.</p>
          <button onClick={() => setPage('auth')} className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold">Sign In</button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading conversations...</div>
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{loadError}</p>
          <button onClick={() => window.location.reload()} className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold">Retry</button>
        </div>
      </div>
    )
  }

  if (convos.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No conversations yet. Start one from a product page.</p>
          <button onClick={() => setPage('marketplace')} className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold">Browse Marketplace</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-bold font-poppins text-foreground mb-4">Messages</h1>
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex" style={{ height: 'calc(100vh - 130px)', minHeight: 600 }}>

          <div className={cn('w-full sm:w-72 border-r border-border flex-shrink-0 flex flex-col', showSidebar ? 'block' : 'hidden sm:flex sm:flex-col')}>
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input type="text" placeholder="Search conversations..." className="w-full pl-8 pr-3 py-2 bg-muted rounded-lg text-xs focus:outline-none border border-transparent focus:border-primary/30" />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {convos.map((c, i) => (
                <button key={c.id} onClick={() => { setActive(i); setShowSidebar(false) }} className={cn('w-full flex items-center gap-3 p-3.5 hover:bg-muted transition-colors text-left border-b border-border/50 last:border-0', i === active ? 'bg-blue-50 dark:bg-blue-950/30 border-l-2 border-l-blue-600' : '')}>
                  <div className="relative shrink-0">
                    <img src={c.avatar} alt={c.user} className="w-10 h-10 rounded-full object-cover" />
                    {c.verified && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center ring-2 ring-card">
                        <ShieldCheck className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    {c.unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center font-bold">{c.unread}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn('text-sm font-semibold truncate', i === active ? 'text-primary' : 'text-foreground')}>{c.user}</span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-1">{c.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className={cn('flex-1 flex flex-col min-w-0', !showSidebar ? 'flex' : 'hidden sm:flex')}>
            <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
              <button onClick={() => setShowSidebar(true)} className="sm:hidden w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="relative shrink-0">
                <img src={convo.avatar} alt={convo.user} className="w-9 h-9 rounded-full object-cover" />
                {convo.verified && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center ring-2 ring-card">
                    <ShieldCheck className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-bold text-sm text-foreground">{convo.user}</p>
                </div>
              </div>
              <MoreVertical className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>

            <div className="px-4 pt-3">
              <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
                <img src={convo.productImage} alt={convo.productTitle} className="w-12 h-10 rounded-lg object-cover shrink-0 bg-border" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{convo.productTitle}</p>
                  <p className="text-primary text-sm font-bold">₹{convo.productPrice.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
             {convo.messages.map((m) => (
                <div key={m.id} className={cn('flex', m.sent ? 'justify-end' : 'justify-start')}>
                  {!m.sent && <img src={convo.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 mr-2 mt-auto mb-0.5" />}
                  <div className={cn('max-w-[70%] rounded-2xl px-4 py-2.5 text-sm', m.sent ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm')}>
                    {m.text}
                    <div className={cn('flex items-center gap-1 mt-1 justify-end', m.sent ? 'text-white/70' : 'text-muted-foreground')}>
                      <span className="text-xs">{m.time}</span>
                      {m.sent && <CheckCheck className={cn('w-3 h-3', m.read ? 'text-blue-300' : 'text-white/60')} />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {sendError && <div className="px-4 pt-2 text-xs text-red-600">{sendError}</div>}
            <div className="p-3 border-t border-border flex items-center gap-2">
              <button className="w-9 h-9 rounded-xl bg-muted hover:bg-accent flex items-center justify-center transition-colors shrink-0">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
              </button>
              <input type="text" value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMsg()} placeholder="Type a message..." className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/30" />
              <button onClick={sendMsg} disabled={!msg.trim()} className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center disabled:opacity-40 hover:bg-blue-700 transition-colors shrink-0">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
