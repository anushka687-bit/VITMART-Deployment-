import { useState } from 'react'
import { Flag, X, Check } from 'lucide-react'
import { apiPost, ApiError } from '@/lib/api'

export function ReportModal({ productId, onClose }: { productId: number; onClose: () => void }) {
  const [reason, setReason] = useState('')
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const reasons = ['Stolen or suspicious item', 'Counterfeit / fake product', 'Misleading description', 'Spam or duplicate listing', 'Prohibited item', 'Other']

  async function submit() {
    if (!reason) return
    setSubmitting(true)
    setError('')
    try {
      await apiPost(`/products/${productId}/report`, { reason, description: comment || null })
      setSubmitted(true)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to submit report.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        {!submitted ? (
          <>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center"><Flag className="w-4 h-4 text-red-600" /></div>
                <h2 className="font-bold text-foreground">Report Listing</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Help keep VITMart safe. Select a reason for reporting.</p>
            <div className="space-y-2 mb-4">
              {reasons.map((r) => (
                <label key={r} className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors hover:border-primary/40 hover:bg-primary/5">
                  <input type="radio" name="reason" value={r} onChange={() => setReason(r)} className="accent-primary" />
                  <span className="text-sm text-foreground">{r}</span>
                </label>
              ))}
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Additional comments (optional)..." className="w-full bg-muted border border-border rounded-xl p-3 text-sm resize-none h-20 focus:outline-none focus:border-primary/50 mb-4" />
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
              <button onClick={submit} disabled={!reason || submitting} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{submitting ? 'Submitting...' : 'Submit Report'}</button>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-green-600" /></div>
            <h3 className="font-bold text-foreground text-lg mb-2">Report Submitted</h3>
            <p className="text-muted-foreground text-sm mb-5">Our team will review this listing within 24 hours.</p>
            <button onClick={onClose} className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">Done</button>
          </div>
        )}
      </div>
    </div>
  )
}
