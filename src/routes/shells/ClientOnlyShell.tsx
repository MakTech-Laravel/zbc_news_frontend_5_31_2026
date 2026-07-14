import { Outlet } from "react-router-dom";

import { ClientOnly, FullPageSpinner } from "@/routes/ClientOnly";

/** Pathless layout that renders its children only on the client. */
export default function ClientOnlyShell() {
  return (
    <ClientOnly fallback={<FullPageSpinner />}>
      <Outlet />
    </ClientOnly>
  );
}
