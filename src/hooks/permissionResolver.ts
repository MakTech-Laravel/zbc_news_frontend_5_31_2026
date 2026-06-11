
import type { AuthUser } from '@/auth/types'
import { useAuth } from '@/auth/useAuth'

const hasPermission = (permission: string) => {
  const { user } = useAuth()

  console.log(user);
  if (isSupperAdmin(user)) return true

  const permissions =
    JSON.parse(localStorage.getItem('permissions') || '[]') || []

    console.log(permissions.includes(permission), permission, permissions);
  return permissions.includes(permission)


}


const isSupperAdmin = (user: AuthUser | null) => {
  return user?.role == 'super-admin';
};

export { hasPermission }
