import type { AdminUserRow } from "@/components/admin/users/useUsersDataTable";

type MockUserSeed = Omit<AdminUserRow, "roleLabel" | "roles">;

const MOCK_USER_SEEDS: MockUserSeed[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@zbcnews.com",
    role: "Editor-in-Chief",
    status: "active",
    joined: "1/15/2024",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@zbcnews.com",
    role: "Senior Editor",
    status: "active",
    joined: "3/22/2024",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.j@zbcnews.com",
    role: "Contributor",
    status: "inactive",
    joined: "6/10/2024",
  },
  {
    id: "4",
    name: "Sarah Williams",
    email: "sarah.w@zbcnews.com",
    role: "Editor",
    status: "active",
    joined: "8/5/2024",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@zbcnews.com",
    role: "Admin",
    status: "active",
    joined: "11/18/2024",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@zbcnews.com",
    role: "Admin",
    status: "active",
    joined: "11/18/2024",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@zbcnews.com",
    role: "Admin",
    status: "active",
    joined: "11/18/2024",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@zbcnews.com",
    role: "Admin",
    status: "active",
    joined: "11/18/2024",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@zbcnews.com",
    role: "Admin",
    status: "active",
    joined: "11/18/2024",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@zbcnews.com",
    role: "Admin",
    status: "active",
    joined: "11/18/2024",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@zbcnews.com",
    role: "Admin",
    status: "active",
    joined: "11/18/2024",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@zbcnews.com",
    role: "Admin",
    status: "active",
    joined: "11/18/2024",
  },
];

export const MOCK_ADMIN_USERS: AdminUserRow[] = MOCK_USER_SEEDS.map((user) => ({
  ...user,
  roleLabel: user.role,
  roles: user.role ? [user.role] : [],
}));
