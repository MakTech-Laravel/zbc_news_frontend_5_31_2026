import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { UserProfileForm } from "@/components/user/profile/UserProfileForm";
import { canManagePublicAuthorProfile } from "@/auth/roles";
import { useAuth } from "@/auth/useAuth";

export default function AdminProfile() {
  const { user } = useAuth();
  const showAuthorProfile = canManagePublicAuthorProfile(user);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="My Profile"
        description={
          showAuthorProfile
            ? "Update your public author profile, photo, biography, and social links"
            : "Manage your account details and preferences"
        }
      />
      <UserProfileForm />
    </div>
  );
}
