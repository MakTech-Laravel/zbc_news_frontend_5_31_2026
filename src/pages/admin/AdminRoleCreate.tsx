import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { RoleForm } from "@/components/admin/roles/RoleForm";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";

export default function AdminRoleCreate() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 sm:space-y-6">
      <Link
        to="/admin/rabc"
        className="inline-flex items-center gap-2 text-sm font-medium text-admin-label transition-colors hover:text-admin-heading"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to roles
      </Link>

      <AdminPageHeader title="Create Role" />

      <RoleForm
        onCancel={() => navigate("/admin/rabc")}
        onSuccess={() => navigate("/admin/rabc")}
      />
    </div>
  );
}
