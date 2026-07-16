import React, { useEffect, useRef, useState } from 'react'
import {
  Check, Camera, Upload, ChevronLeft, ChevronRight, Zap, Image as ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Page, Condition, Product } from '@/types'
import { apiGet, apiPost, ApiError } from '@/lib/api'
import { mapApiProductToProduct, type ApiCategory, type ApiProduct } from '@/lib/adapters'
import { ConditionBadge } from '@/components/ConditionBadge'

const SELLABLE_CONDITIONS: Exclude<Condition, 'Poor'>[] = ['New', 'Like New', 'Good', 'Fair']
const CONDITION_TO_API: Record<Exclude<Condition, 'Poor'>, ApiProduct['condition']> = {
  New: 'new', 'Like New': 'like_new', Good: 'good', Fair: 'fair',
}

export function SellPage({ setPage, onPublished }: { setPage: (p: Page) => void; onPublished: (product: Product) => void }) {
  const [step, setStep] = useState(1)
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [form, setForm] = useState({
    title: '', categoryId: null as number | null, condition: '' as Condition | '',
    price: '', negotiable: false, description: '', images: [] as File[],
  })
  const [published, setPublished] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const steps = ['Category & Title', 'Photos', 'Details & Price', 'Review & Publish']

  useEffect(() => {
    apiGet<ApiCategory[]>('/categories').then(setCategories).catch(() => setCategories([]))
  }, [])

  function upd<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function handleFilesSelected(files: FileList | null) {
    if (!files) return
    const remaining = 6 - form.images.length
    upd('images', [...form.images, ...Array.from(files).slice(0, remaining)])
  }

  const imagePreviews = form.images.map((f) => URL.createObjectURL(f))
  const selectedCategory = categories.find((c) => c.id === form.categoryId)

  function validateStep(s: number): string {
    if (s === 1 && (!form.categoryId || !form.title.trim())) return 'Select a category and enter a title.'
    if (s === 2 && form.images.length === 0) return 'Add at least one photo.'
    if (s === 3 && (!form.condition || !form.price || !form.description.trim())) return 'Fill in condition, price, and description.'
    return ''
  }

  async function handlePublish() {
    setError('')
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('category_id', String(form.categoryId))
      fd.append('title', form.title)
      fd.append('description', form.description)
      fd.append('price', form.price)
      fd.append('condition', CONDITION_TO_API[form.condition as Exclude<Condition, 'Poor'>])
      fd.append('negotiable', form.negotiable ? '1' : '0')
      form.images.forEach((img) => fd.append('images[]', img))

      const created = await apiPost<ApiProduct>('/products', fd)
      onPublished(mapApiProductToProduct(created, new Set()))
      setPublished(true)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to publish listing.')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setPublished(false)
    setStep(1)
    setForm({ title: '', categoryId: null, condition: '', price: '', negotiable: false, description: '', images: [] })
    setError('')
  }

  if (published) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card rounded-3xl border border-border shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-5"><Check className="w-10 h-10 text-green-600" /></div>
          <h2 className="text-2xl font-bold font-poppins text-foreground mb-2">Listing Published!</h2>
          <p className="text-muted-foreground text-sm mb-2">Your item is now live on VITMart.</p>
          <p className="text-xs text-muted-foreground mb-6 bg-muted rounded-lg p-3">Tip: Respond quickly to messages to sell faster!</p>
          <div className="flex gap-3">
            <button onClick={() => setPage('marketplace')} className="flex-1 border border-border py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors">Browse</button>
            <button onClick={reset} className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">List Another</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-poppins text-foreground mb-1">List an Item for Sale</h1>
          <p className="text-muted-foreground text-sm">Complete all steps to publish your listing.</p>
        </div>
        <div className="flex items-center gap-0 mb-8 overflow-x-auto">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors', i + 1 < step ? 'bg-primary text-white' : i + 1 === step ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-muted text-muted-foreground')}>
                  {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn('text-xs font-medium whitespace-nowrap hidden sm:block', i + 1 === step ? 'text-primary' : 'text-muted-foreground')}>{s}</span>
              </div>
              {i < steps.length - 1 && <div className={cn('h-0.5 flex-1 mx-1 transition-colors min-w-4', i + 1 < step ? 'bg-primary' : 'bg-border')} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          {error && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2 mb-4">{error}</div>}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg text-foreground">What are you selling?</h2>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Category <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.map((c) => (
                    <button key={c.id} onClick={() => upd('categoryId', c.id)} className={cn('flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all', form.categoryId === c.id ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:border-primary/40')}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Product Title <span className="text-red-500">*</span></label>
                <input value={form.title} onChange={(e) => upd('title', e.target.value)} placeholder="e.g. Casio FX-991ES Plus Scientific Calculator" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                <p className="text-xs text-muted-foreground mt-1">{form.title.length}/80 characters</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg text-foreground">Upload Photos</h2>
              <p className="text-sm text-muted-foreground">Good photos get 3x more responses. Add up to 6 photos.</p>
              <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFilesSelected(e.target.files)} />
              <div className="grid grid-cols-3 gap-3">
                {imagePreviews.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => upd('images', form.images.filter((_, idx) => idx !== i))} className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ImageIcon className="w-3 h-3 text-white" />
                    </button>
                    {i === 0 && <div className="absolute bottom-1.5 left-1.5 bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium">Cover</div>}
                  </div>
                ))}
                {form.images.length < 6 && (
                  <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Camera className="w-6 h-6" /><span className="text-xs font-medium">Add Photo</span>
                  </button>
                )}
              </div>
              {form.images.length === 0 && (
                <button onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center gap-3 hover:border-primary/50 transition-colors">
                  <Upload className="w-10 h-10 text-muted-foreground/50" />
                  <div className="text-center">
                    <p className="font-semibold text-foreground text-sm">Click to upload photos</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 3MB each</p>
                  </div>
                </button>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg text-foreground">Details & Pricing</h2>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Condition <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {SELLABLE_CONDITIONS.map((c) => (
                    <button key={c} onClick={() => upd('condition', c)} className={cn('p-3 rounded-xl border text-sm font-medium transition-all', form.condition === c ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:border-primary/40')}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Price (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                  <input type="number" value={form.price} onChange={(e) => upd('price', e.target.value)} placeholder="0" className="w-full pl-8 pr-4 py-3 bg-muted border border-border rounded-xl text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                <div><p className="font-semibold text-sm text-foreground">Open to Negotiation?</p><p className="text-xs text-muted-foreground">Buyers can make offers</p></div>
                <button onClick={() => upd('negotiable', !form.negotiable)} className={cn('w-12 h-6 rounded-full transition-colors relative', form.negotiable ? 'bg-primary' : 'bg-muted-foreground/30')}>
                  <div className={cn('w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow', form.negotiable ? 'left-[calc(100%-1.375rem)]' : 'left-0.5')} />
                </button>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Description <span className="text-red-500">*</span></label>
                <textarea value={form.description} onChange={(e) => upd('description', e.target.value)} placeholder="Describe your item — condition details, reason for selling, accessories included..." className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm resize-none h-28 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg text-foreground">Review Your Listing</h2>
              <div className="bg-muted rounded-2xl p-4 flex gap-4">
                {imagePreviews[0] ? (
                  <img src={imagePreviews[0]} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0 bg-border" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-border flex items-center justify-center shrink-0"><ImageIcon className="w-8 h-8 text-muted-foreground/50" /></div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground mb-1 truncate">{form.title || 'Untitled Product'}</h3>
                  <p className="text-2xl font-bold text-primary mb-1">₹{Number(form.price || 0).toLocaleString()}</p>
                  <div className="flex gap-2 flex-wrap">
                    {form.condition && <ConditionBadge condition={form.condition as Condition} />}
                    {form.negotiable && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Negotiable</span>}
                  </div>
                  {selectedCategory && <p className="text-xs text-muted-foreground mt-1">{selectedCategory.name}</p>}
                </div>
              </div>
              {form.description && <div className="bg-muted rounded-xl p-4"><p className="text-sm text-muted-foreground leading-relaxed">{form.description}</p></div>}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold mb-1">Before you publish:</p>
                <ul className="space-y-1 text-xs list-disc list-inside">
                  <li>Make sure your price is accurate</li>
                  <li>Only list items you own and are willing to sell</li>
                  <li>Respond to buyer messages within 24 hours</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-5 border-t border-border">
            {step > 1 && (
              <button onClick={() => setStep((s) => s - 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button
              onClick={() => {
                const v = validateStep(step)
                if (v) { setError(v); return }
                setError('')
                if (step < 4) setStep((s) => s + 1)
                else handlePublish()
              }}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {step === 4 ? <><Zap className="w-4 h-4" /> {submitting ? 'Publishing...' : 'Publish Listing'}</> : <>Continue <ChevronRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
