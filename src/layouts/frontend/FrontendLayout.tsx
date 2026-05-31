import { Outlet } from 'react-router-dom'

import { FrontendFooter } from '@/components/partials/frontend/FrontendFooter'
import { FrontendHeader } from '@/components/partials/frontend/FrontendHeader'

export function FrontendLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <FrontendHeader />
      <main className="mx-auto w-full flex-1">
        <Outlet />
      </main>
      <FrontendFooter />
    </div>
  )
}

