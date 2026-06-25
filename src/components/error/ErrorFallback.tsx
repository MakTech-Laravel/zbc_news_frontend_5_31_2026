import { type FallbackProps } from 'react-error-boundary'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { isChunkLoadError } from '@/lib/chunkLoadError'
import { getErrorMessage, getErrorStack } from '@/lib/error.utils'
import { isDebugLike } from '@/lib/env'

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = getErrorMessage(error)
  const stack = getErrorStack(error)
  const isStaleChunk = isChunkLoadError(error)

  return (
    <div
      className="mx-auto flex min-h-dvh max-w-3xl items-center justify-center px-4 py-12"
      role="alert"
      aria-live="assertive"
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{isStaleChunk ? "A new version is available" : "Something went wrong"}</CardTitle>
          <CardDescription>
            {isStaleChunk
              ? "The app was updated while this page was open. Reload to fetch the latest version."
              : "We hit an unexpected error. You can reload the app or go back home."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDebugLike ? (
            <div className="space-y-2">
              <div className="rounded-md border bg-muted p-3 text-sm">{message}</div>
              {stack ? (
                <pre className="max-h-60 overflow-auto rounded-md border bg-muted p-3 text-xs">
                  {stack}
                </pre>
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => {
                if (resetErrorBoundary) {
                  resetErrorBoundary()
                  return
                }
                window.location.reload()
              }}
            >
              Reload Page
            </Button>
            <Button asChild variant="outline" type="button">
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

