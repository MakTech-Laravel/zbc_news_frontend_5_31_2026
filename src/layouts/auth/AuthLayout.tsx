import { Outlet } from 'react-router-dom'

import { FrontendFooter } from '@/components/partials/frontend/FrontendFooter'
import { FrontendHeader } from '@/components/partials/frontend/FrontendHeader'

export function AuthLayout({
  showHeader = true,
  showFooter = true,
}: {
  showHeader?: boolean
  showFooter?: boolean
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-auth-bg">
      {showHeader ? <FrontendHeader /> : null}
      <main className="mx-auto flex w-full flex-1 container items-center justify-center px-4 py-12">
        <Outlet />
      </main>
      {showFooter ? <FrontendFooter /> : null}
    </div>
  )
}

