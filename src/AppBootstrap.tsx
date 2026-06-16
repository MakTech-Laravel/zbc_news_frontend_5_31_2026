import { RouterProvider } from 'react-router-dom'

import { AnalyticsScripts } from '@/components/integrations/AnalyticsScripts'
import { useDocumentHead } from '@/hooks/useDocumentHead'
import { useFavicon } from '@/hooks/useFavicon'
import { router } from '@/routes/router'

function AppEffects() {
  useDocumentHead()
  useFavicon({
    apiUrl: import.meta.env.VITE_FAVICON_API_URL as string | undefined,
    responsePath: (import.meta.env.VITE_FAVICON_RESPONSE_PATH as string | undefined) ?? 'data.favicon',
    ttlMs: Number(import.meta.env.VITE_FAVICON_CACHE_TTL_MS || 0) || undefined,
  })

  return <AnalyticsScripts />
}

export function AppBootstrap() {
  return (
    <>
      <AppEffects />
      <RouterProvider router={router} />
    </>
  )
}
