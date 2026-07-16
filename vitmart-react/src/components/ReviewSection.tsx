import { useEffect, useState } from 'react'
import { Star, Check, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiDelete, apiGet, apiPost, apiPut, ApiError } from '@/lib/api'
import { formatRelativeTime, storageUrl, type ApiReview, type ApiReviewsResponse } from '@/lib/adapters'
import { StarRating } from './StarRating'
import type { CurrentUser } from '@/App'

export function ReviewSection({
  revieweeId, productId, currentUser,
}: {
  revieweeId: number
  productId?: number
  currentUser: CurrentUser | null
}) {
  const [reviews, setReviews] = useState<ApiReview[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [hovered, setHovered] = useState(0)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [flash, setFlash] = useState(false)

  const myReview = currentUser ? reviews.find((r) => r.user_id === currentUser.id) : undefined
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }))

  async function load() {
    setLoading(true)
    setLoadError('')
    try {
      const res = await apiGet<ApiReviewsResponse>(`/users/${revieweeId}/reviews`)
      setReviews(res.reviews)
      setAverageRating(res.average_rating)
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : 'Could not load reviews.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revieweeId])

  function startEdit(r: ApiReview) {
    setEditingId(r.id)
    setRating(r.rating)
    setComment(r.review ?? '')
    setFormError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setRating(0)
    setComment('')
    setFormError('')
  }

  async function submit() {
    if (!rating) return
    setSubmitting(true)
    setFormError('')
    try {
      if (editingId) {
        await apiPut(`/reviews/${editingId}`, { rating, review: comment || null })
      } else {
        await apiPost('/reviews', { reviewed_user_id: revieweeId, product_id: productId ?? null, rating, review: comment || null })
      }
      await load()
      cancelEdit()
      setFlash(true)
      setTimeout(() => setFlash(false), 2500)
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Failed to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  async function remove(id: number) {
    setSubmitting(true)
    try {
      await apiDelete(`/reviews/${id}`)
      await load()
      cancelEdit()
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Failed to delete review.')
    } finally {
      setSubmitting(false)
    }
  }

  const canReview = currentUser && currentUser.id !== revieweeId

  return (
    <div className="bg-card rounded-2xl border border-border p-5 mt-0">
      <div className="flex items-start justify-between mb-5">
        <h3 className="font-bold text-foreground">Seller Reviews</h3>
        <StarRating rating={averageRating} reviews={reviews.length} size="sm" />
      </div>

      <div className="flex items-center gap-6 mb-5 pb-5 border-b border-border">
        <div className="text-center shrink-0">
          <p className="text-4xl font-bold text-foreground">{averageRating.toFixed(1)}</p>
          <StarRating rating={averageRating} size="sm" />
          <p className="text-xs text-muted-foreground mt-1">{reviews.length} review{reviews.length === 1 ? '' : 's'}</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {dist.map((d) => (
            <div key={d.n} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-3 shrink-0">{d.n}</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: reviews.length ? `${(d.count / reviews.length) * 100}%` : '0%' }} />
              </div>
              <span className="text-xs text-muted-foreground w-3 shrink-0">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {loadError && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2 mb-5">{loadError}</div>}

      {canReview && myReview && editingId === null && (
        <div className="bg-muted rounded-xl p-4 mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">You reviewed this seller already.</p>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => startEdit(myReview)} className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"><Pencil className="w-3.5 h-3.5" /> Edit</button>
            <button onClick={() => remove(myReview.id)} disabled={submitting} className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
          </div>
        </div>
      )}

      {canReview && (editingId !== null || !myReview) && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40 p-4 mb-5">
          <p className="text-sm font-semibold text-foreground mb-3">{editingId ? 'Edit Your Review' : 'Leave a Review'}</p>
          {formError && <p className="text-sm text-red-600 mb-3">{formError}</p>}
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(s)} className="transition-transform hover:scale-110">
                <Star className={cn('w-7 h-7 transition-colors', s <= (hovered || rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')} />
              </button>
            ))}
            {(hovered || rating) > 0 && (
              <span className="text-sm text-muted-foreground ml-2">{['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][hovered || rating]}</span>
            )}
          </div>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience with this seller..." className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm resize-none h-20 focus:outline-none focus:border-primary/50 mb-3" />
          <div className="flex gap-2">
            <button onClick={submit} disabled={!rating || submitting} className={cn('flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40', flash ? 'bg-green-600 text-white' : 'bg-primary text-white hover:bg-primary/90')}>
              {submitting ? 'Submitting...' : flash ? <><Check className="w-4 h-4" /> Saved!</> : editingId ? 'Save Changes' : 'Submit Review'}
            </button>
            {editingId && <button onClick={cancelEdit} className="px-5 py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors">Cancel</button>}
          </div>
        </div>
      )}

      {!currentUser && (
        <div className="bg-muted rounded-xl p-4 mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Sign in to leave a review after a completed transaction.</p>
        </div>
      )}

      <div className="space-y-4">
        {loading && <p className="text-sm text-muted-foreground text-center py-4">Loading reviews...</p>}
        {!loading && reviews.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
            <img src={storageUrl(r.reviewer.avatar)} alt={r.reviewer.name} className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-border" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-foreground">{r.reviewer.name}</span>
                <span className="text-xs text-muted-foreground">{formatRelativeTime(r.created_at)}</span>
              </div>
              <StarRating rating={r.rating} size="sm" />
              {r.review && <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{r.review}</p>}
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" /> Verified transaction
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
