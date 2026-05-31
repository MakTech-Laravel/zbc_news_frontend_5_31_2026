# Sonographer Pal — Frontend

React + Vite + TypeScript + Tailwind v4 frontend for **Sonographer Pal**, an on-demand
exam-prep platform for sonography students and professionals (SPI, ARDMS, CCI, ARRT).

## Tech

- React 19 + Vite 8 + TypeScript
- Tailwind CSS v4
- React Router 7
- TanStack Query (data fetching)
- Axios (HTTP, Laravel Passport / Sanctum aware)
- Lucide icons

## Project structure

```
src/
  api/            # axios client + Laravel response helpers
  auth/           # AuthProvider, token storage, role/Spatie helpers, session probe
  components/
    error/        # ErrorBoundary + fallback
    partials/     # shared frontend Header / Footer
    ui/           # Reusable primitives (Button, Card, Input, ...)
  config/         # env reader
  features/auth/  # login/register/OTP service + role selection
  hooks/          # useFavicon
  layouts/        # FrontendLayout, AuthLayout
  lib/            # utils, container, queryClient, env, logger
  pages/
    Dashboard.tsx
    frontend/
      Home.tsx
      NotFound.tsx
      Unauthorized.tsx
      auth/       # UserType, LoginEmail, Register, ForgetPassword, OTPVerification, ResetPassword, AdminLogin
  routes/         # router, publicRoutes, authRoutes, GuestGate, routeUtils
  utils/          # favicon helpers
  AppBootstrap.tsx
  main.tsx
  index.css
```

## Getting started

```bash
npm install
cp .env.example .env   # update VITE_API_BASE_URL
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

# shomostime_web_laravel_react
