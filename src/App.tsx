import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import { AppBootstrap } from "@/AppBootstrap";
import { AuthProvider } from "@/auth/AuthProvider";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { queryClient } from "@/lib/queryClient";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <AppBootstrap />
        </ErrorBoundary>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
