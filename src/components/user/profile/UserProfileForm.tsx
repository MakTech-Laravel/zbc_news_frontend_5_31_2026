import * as React from "react";
import { Bell, Mail, MapPin, User } from "lucide-react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRef, useState } from "react";

import { useAuth } from "@/auth/useAuth";
import { UserDashboardCard } from "@/components/user/dashboard/UserDashboardCard";
import { UserSettingSwitch } from "@/components/user/profile/UserSettingSwitch";
import { UserStatusBadge } from "@/components/user/shared/UserStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { request } from "@/api/request";
import toast from "react-hot-toast";
import InputError from "@/components/input-error";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "JD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  region: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

type SettingsCardHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  compact?: boolean;
};

function SettingsCardHeader({
  title,
  subtitle,
  icon,
  compact,
}: SettingsCardHeaderProps) {
  return (
    <div className={cn("px-6", compact ? "pt-4 pb-1" : "pt-6 pb-2")}>
      {icon ? (
        <div className="flex items-center gap-2 text-admin-heading">
          <span className="text-admin-label">{icon}</span>
          <h2 className="text-base font-semibold leading-5">{title}</h2>
        </div>
      ) : (
        <h2 className="text-base font-semibold leading-5 text-admin-heading">
          {title}
        </h2>
      )}
      {subtitle ? (
        <p className="mt-1 text-base leading-6 text-admin-label">{subtitle}</p>
      ) : null}
    </div>
  );
}

type NotificationToggleProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function NotificationToggleRow({
  id,
  label,
  checked,
  onChange,
}: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm font-medium text-admin-heading">{label}</span>
      <UserSettingSwitch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        aria-label={label}
      />
    </div>
  );
}

const NOTIFICATION_OPTIONS = [
  { id: "breaking_news", label: "Breaking News Alerts" },
  { id: "daily_newsletter", label: "Daily Newsletter" },
  { id: "personalized_recommendations", label: "Personalized Recommendations" },
  { id: "comment_replies", label: "Comment Replies" },
  { id: "saved_article_updates", label: "Saved Article Updates" },
] as const;

type NotificationPreferences = {
  breaking_news: boolean;
  daily_newsletter: boolean;
  personalized_recommendations: boolean;
  comment_replies: boolean;
  saved_article_updates: boolean;
};

type NotifKey = keyof NotificationPreferences;

export function UserProfileForm() {
  const { user } = useAuth();
  const initials = getInitials(user?.name ?? "John Doe");

  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "", region: "", bio: "" },
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await request.get("/admin/users/profile");
        const d = res.data.data;
        console.log(d);
        reset({
          name: d.name ?? "",
          email: d.email ?? "",
          region: d.user_information?.region ?? "",
          bio: d.user_information?.bio ?? "",
        });
        if (d.user_information?.profile_image) {
          setImagePreview(d.user_information.profile_image);
        }
      } catch {
        toast.error("Failed to load profile.");
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: ProfileForm) => {
    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      if (data.region) formData.append("region", data.region);
      if (data.bio) formData.append("bio", data.bio);
      if (imageFile) formData.append("profile_image", imageFile);
      formData.append("_method", "PUT");

      await request.post("/admin/users/profile/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // Notification preferences
  const [notifications, setNotifications] =
    React.useState<NotificationPreferences | null>(null);
  const [notifLoading, setNotifLoading] = useState(true);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setNotifLoading(true);
        const response = await request.get("/admin/notification-preferences");
        setNotifications(response.data.data);
      } catch (error) {
        console.error("Failed to fetch notification preferences:", error);
      } finally {
        setNotifLoading(false);
      }
    };
    fetchPreferences();
  }, []);

  const handleToggle = (id: NotifKey, value: boolean) => {
    const updated = { ...notifications!, [id]: value };
    setNotifications(updated);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        await request.put("/admin/notification-preferences/update", updated);
        toast.success("Preferences updated successfully.");
      } catch (error) {
        console.error("Failed to update notification preferences:", error);
        toast.error("Failed to update preferences. Please try again.");
      }
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <UserDashboardCard>
        <div className="w-full md:w-1/2">
          <SettingsCardHeader
            title="Profile Information"
            subtitle="Update your personal details"
          />
          <div className="space-y-6 px-6 pb-6">
            {/* Avatar */}
            <div className="flex flex-wrap items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <span className="inline-flex size-20 items-center justify-center overflow-hidden rounded-full bg-zbc-gray-200 text-2xl font-semibold text-zbc-gray-900">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="size-full object-cover"
                  />
                ) : (
                  initials
                )}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Photo
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleImageRemove}
                  disabled={!imagePreview}
                >
                  Remove
                </Button>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Form */}
            {profileLoading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-9 animate-pulse rounded bg-muted",
                      i === 3 && "sm:col-span-2 h-24",
                    )}
                  />
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-admin-heading">
                      <User className="size-4 text-admin-label" aria-hidden />
                      Full Name
                    </label>
                    <Input {...register("name")} className="h-9" />
                    {errors.name && (
                      <InputError message={errors.name.message!} />
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-admin-heading">
                      <Mail className="size-4 text-admin-label" aria-hidden />
                      Email
                    </label>
                    <Input
                      type="email"
                      {...register("email")}
                      className="h-9"
                    />
                    {errors.email && (
                      <InputError message={errors.email.message!} />
                    )}
                  </div>

                  {/* Region */}
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-admin-heading">
                      <MapPin className="size-4 text-admin-label" aria-hidden />
                      Region
                    </label>
                    <Input {...register("region")} className="h-9" />
                    {errors.region && (
                      <InputError message={errors.region.message!} />
                    )}
                  </div>

                  {/* Bio */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-admin-heading">
                      Bio
                    </label>
                    <textarea
                      {...register("bio")}
                      className="min-h-[100px] w-full rounded-lg border border-admin-input-border bg-card px-3 py-2 text-sm text-admin-heading placeholder:text-admin-label/60"
                      placeholder="Tell us about yourself..."
                    />
                    {errors.bio && <InputError message={errors.bio.message!} />}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    variant="default"
                    className="bg-zbc-gray-700 text-white"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset();
                      handleImageRemove();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </UserDashboardCard>

      {/* Notification Preferences */}
      <UserDashboardCard>
        <div id="notification-preferences" className="scroll-mt-6" />
        <SettingsCardHeader
          title="Notification Preferences"
          subtitle="Manage how you receive updates"
          icon={<Bell className="size-5" aria-hidden />}
        />
        <div className="space-y-1 px-6 pb-6">
          {notifLoading || !notifications
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-6 w-11 animate-pulse rounded-full bg-muted" />
                </div>
              ))
            : NOTIFICATION_OPTIONS.map((item) => (
                <NotificationToggleRow
                  key={item.id}
                  id={`notif-${item.id}`}
                  label={item.label}
                  checked={notifications[item.id]}
                  onChange={(v) => handleToggle(item.id as NotifKey, v)}
                />
              ))}
        </div>
      </UserDashboardCard>

      {/* Account Status */}
      <UserDashboardCard>
        <SettingsCardHeader title="Account Status" compact />
        <div className="space-y-3 px-6 pb-6">
          <Link
            to="/user/membership"
            className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-muted/80 px-4 py-4 transition-colors hover:bg-muted"
          >
            <div>
              <p className="text-base font-semibold text-admin-heading">
                Membership Status
              </p>
              <p className="mt-1 text-sm text-admin-label">
                Premium account active
              </p>
            </div>
            <UserStatusBadge label="Premium" variant="account" />
          </Link>
          <div className="rounded-lg bg-muted/80 px-4 py-4">
            <p className="text-base font-semibold text-admin-heading">
              Member Since
            </p>
            <p className="mt-1 text-sm text-admin-label">January 2024</p>
          </div>
        </div>
      </UserDashboardCard>
    </div>
  );
}