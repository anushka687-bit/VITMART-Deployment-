import { BookOpen, Cpu, Home, Bike, FlaskConical, Sofa, Dumbbell, Boxes } from 'lucide-react'

// Static emoji/icon lookup for the real categories seeded by Laravel's
// DatabaseSeeder — the backend only stores `name`/`slug`, no emoji/icon/count.
export const CATEGORY_DISPLAY: Record<string, { emoji: string; icon: typeof BookOpen }> = {
  Books: { emoji: '📚', icon: BookOpen },
  Cycles: { emoji: '🚲', icon: Bike },
  Electronics: { emoji: '💻', icon: Cpu },
  'Lab Equipment': { emoji: '🧪', icon: FlaskConical },
  'Hostel Essentials': { emoji: '🏠', icon: Home },
  Furniture: { emoji: '🪑', icon: Sofa },
  Sports: { emoji: '⚽', icon: Dumbbell },
  Others: { emoji: '📦', icon: Boxes },
}

// Fallback list used only until GET /api/categories has loaded.
export const CATEGORIES = Object.keys(CATEGORY_DISPLAY).map((name) => ({
  name,
  emoji: CATEGORY_DISPLAY[name].emoji,
  icon: CATEGORY_DISPLAY[name].icon,
  count: 0,
}))

