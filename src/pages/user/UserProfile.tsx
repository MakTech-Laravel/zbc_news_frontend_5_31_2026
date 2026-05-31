import { UserProfileForm } from "@/components/user/profile/UserProfileForm";
import { UserPageShell } from "@/components/user/UserPageShell";

export default function UserProfile() {
  return (
    <UserPageShell
      title="Profile & Settings"
      description="Manage your account and preferences"
    >
      <UserProfileForm />
    </UserPageShell>
  );
}
