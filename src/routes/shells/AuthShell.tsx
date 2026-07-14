import { AuthLayout } from "@/layouts/auth/AuthLayout";
import { ClientOnly, FullPageSpinner } from "@/routes/ClientOnly";
import { GuestGate } from "@/routes/GuestGate";

/** Guest-only auth screens — client-only, unchanged from the pre-SSR router. */
export default function AuthShell() {
  return (
    <ClientOnly fallback={<FullPageSpinner />}>
      <GuestGate>
        <AuthLayout />
      </GuestGate>
    </ClientOnly>
  );
}
