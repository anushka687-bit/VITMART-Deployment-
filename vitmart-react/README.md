# VITMart — Campus Buy & Sell Marketplace

A campus marketplace UI for VIT students (buy, sell, chat, reviews, admin dashboard).
Built with **React 18 + Vite 6 + TypeScript + Tailwind CSS v4**.

> **Note:** This is the **frontend only**. It runs entirely on mock data (`src/data/products.ts`).
> No backend/API is wired up yet — that layer (Laravel + MySQL) will be added separately.

## Getting started

```bash
npm install
npm run dev      # start dev server (http://localhost:5173)
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

Requires Node.js 18+.

## How navigation works

There is **no router**. The app uses a single `page` state in `src/App.tsx` and
conditionally renders the active page. `navigate(page)` switches the view and scrolls to top.
Auth, dark mode, products, and the selected product are all React state in `App.tsx`.

## Project structure

```
src/
├── main.tsx              App entry (ReactDOM render)
├── App.tsx               Root: state + page switching + nav shells
├── index.css            Tailwind v4 + shadcn theme tokens + fonts
├── types.ts             Shared TypeScript types (Product, Review, Convo, ...)
├── lib/
│   └── utils.ts         cn() class-name helper
├── data/
│   └── products.ts      All mock/seed data (products, sellers, reviews, chats, admin)
├── components/          Reusable UI
│   ├── Navbar.tsx
│   ├── ProductCard.tsx
│   ├── ConditionBadge.tsx
│   ├── StarRating.tsx
│   ├── VerifiedBadge.tsx
│   ├── StatCard.tsx
│   ├── ReviewSection.tsx
│   └── ReportModal.tsx
└── pages/               One file per screen
    ├── LandingPage.tsx
    ├── MarketplacePage.tsx
    ├── ProductDetailPage.tsx
    ├── SellPage.tsx
    ├── AuthPage.tsx
    ├── ProfilePage.tsx
    ├── FavouritesPage.tsx
    ├── ChatPage.tsx
    └── AdminPage.tsx
```

The `@/` alias maps to `src/` (configured in `vite.config.ts` and `tsconfig.json`).

## Where the backend will plug in (later)

Everything reads from `src/data/products.ts` today. When the API is ready, replace those
imports with fetch calls (e.g. a `src/services/` layer) and lift auth/products into a data
layer — the page components already receive their data via props, so swapping the source is localized.

## Tech

- React 18.3, Vite 6.3, TypeScript 5.6
- Tailwind CSS v4 (via `@tailwindcss/vite`) with shadcn-style theme tokens
- `lucide-react` icons, `recharts` for the admin charts
