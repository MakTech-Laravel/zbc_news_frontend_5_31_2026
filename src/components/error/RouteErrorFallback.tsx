import { isRouteErrorResponse, useRouteError } from "react-router-dom";

import { ErrorFallback } from "@/components/error/ErrorFallback";
import { getErrorMessage } from "@/lib/error.utils";

export function RouteErrorFallback() {
  const routeError = useRouteError();
  const error =
    routeError instanceof Error
      ? routeError
      : new Error(
          isRouteErrorResponse(routeError)
            ? routeError.statusText || `Request failed with status ${routeError.status}`
            : getErrorMessage(routeError),
        );

  return (
    <ErrorFallback
      error={error}
      resetErrorBoundary={() => window.location.reload()}
    />
  );
}
