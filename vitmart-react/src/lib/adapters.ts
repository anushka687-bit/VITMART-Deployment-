import type { ChatMsg, Condition, Convo, Product } from '@/types'
import { APP_ORIGIN } from '@/lib/api'

export interface ApiUser {
  id: number
  name: string
  email: string
  phone: string | null
  block: string | null
  avatar: string | null
  show_phone: boolean
  role: 'user' | 'admin'
  email_verified_at: string | null
  reviews_received_count?: number
  reviews_received_avg_rating?: number | null
}

export interface ApiCategory {
  id: number
  name: string
  slug: string
}

export interface ApiReview {
  id: number
  user_id: number
  reviewed_user_id: number
  product_id: number | null
  rating: number
  review: string | null
  created_at: string
  updated_at: string
  reviewer: ApiUser
}

export interface ApiReviewsResponse {
  average_rating: number
  review_count: number
  reviews: ApiReview[]
}

export interface ApiProductImage {
  id: number
  product_id: number
  image_path: string
}

export interface ApiProduct {
  id: number
  user_id: number
  category_id: number
  title: string
  brand_name: string | null
  description: string
  price: number
  condition: 'new' | 'like_new' | 'good' | 'fair'
  negotiable: boolean
  status: 'available' | 'sold'
  views: number
  created_at: string
  updated_at: string
  user: ApiUser
  category: ApiCategory
  images: ApiProductImage[]
}

export interface ApiMessage {
  id: number
  conversation_id: number
  sender_id: number
  body: string
  is_read: boolean
  created_at: string
  sender?: ApiUser
}

export interface ApiConversation {
  id: number
  product_id: number
  buyer_id: number
  seller_id: number
  updated_at: string
  product: ApiProduct
  buyer: ApiUser
  seller: ApiUser
  messages: ApiMessage[]
}

const CONDITION_TO_UI: Record<ApiProduct['condition'], Condition> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
}

const CONDITION_TO_API: Record<Exclude<Condition, 'Poor'>, ApiProduct['condition']> = {
  New: 'new',
  'Like New': 'like_new',
  Good: 'good',
  Fair: 'fair',
}

export function conditionToApi(c: Exclude<Condition, 'Poor'>): ApiProduct['condition'] {
  return CONDITION_TO_API[c]
}

const PLACEHOLDER_AVATAR = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop'

export function storageUrl(path: string | null | undefined): string {
  if (!path) return PLACEHOLDER_AVATAR
  return `${APP_ORIGIN}/storage/${path}`
}

export function formatRelativeTime(dateStr: string): string {
  const then = new Date(dateStr).getTime()
  const diffMs = Date.now() - then
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  const months = Math.floor(days / 30)
  return `${months} month${months === 1 ? '' : 's'} ago`
}

export function mapApiProductToProduct(p: ApiProduct, favouriteIds: Set<number>): Product {
  const images = p.images.length > 0 ? p.images.map((i) => storageUrl(i.image_path)) : [PLACEHOLDER_AVATAR]
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    condition: CONDITION_TO_UI[p.condition] ?? 'Good',
    category: p.category?.name ?? 'Others',
    image: images[0],
    images,
    seller: p.user?.name ?? 'Unknown',
    sellerId: p.user_id,
    sellerAvatar: storageUrl(p.user?.avatar),
    views: p.views,
    negotiable: p.negotiable,
    description: p.description,
    hostel: p.user?.block ?? 'Not specified',
    posted: formatRelativeTime(p.created_at),
    sold: p.status === 'sold',
    verified: !!p.user?.email_verified_at,
    favourited: favouriteIds.has(p.id),
  }
}

export function mapApiMessageToChatMsg(m: ApiMessage, currentUserId: number): ChatMsg {
  return {
    id: m.id,
    text: m.body,
    sent: m.sender_id === currentUserId,
    time: formatRelativeTime(m.created_at),
    read: m.is_read,
  }
}

export function mapApiConversationToConvo(c: ApiConversation, currentUserId: number): Convo {
  const other = c.buyer_id === currentUserId ? c.seller : c.buyer
  const last = c.messages[c.messages.length - 1]
  const productImage = c.product?.images?.[0]
  return {
    id: c.id,
    user: other?.name ?? 'Unknown',
    avatar: storageUrl(other?.avatar),
    verified: !!other?.email_verified_at,
    productTitle: c.product?.title ?? '',
    productImage: storageUrl(productImage?.image_path),
    productPrice: c.product?.price ?? 0,
    lastMessage: last?.body ?? '',
    time: last ? formatRelativeTime(last.created_at) : '',
    unread: c.messages.filter((m) => !m.is_read && m.sender_id !== currentUserId).length,
    messages: c.messages.map((m) => mapApiMessageToChatMsg(m, currentUserId)),
  }
}
