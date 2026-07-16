export type Page =
  | 'landing' | 'marketplace' | 'product' | 'sell'
  | 'auth' |'register' | 'profile' | 'favourites' | 'chat'
  | 'adminLogin'

export type AuthMode = 'login' | 'register' | 'otp' | 'forgot'

export type Condition = 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor'

export interface Product {
  id: number
  title: string
  price: number
  condition: Condition
  category: string
  image: string
  images: string[]
  seller: string
  sellerId: number
  sellerAvatar: string
  views: number
  negotiable: boolean
  description: string
  hostel: string
  posted: string
  sold: boolean
  verified: boolean
  favourited: boolean
}

export interface ChatMsg {
  id: number
  text: string
  sent: boolean
  time: string
  read: boolean
}

export interface Convo {
  id: number
  user: string
  avatar: string
  verified: boolean
  productTitle: string
  productImage: string
  productPrice: number
  lastMessage: string
  time: string
  unread: number
  messages: ChatMsg[]
}
