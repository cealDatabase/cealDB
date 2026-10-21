import { cookies } from 'next/headers';
import LibrariesClient from '@/components/LibrariesClient';

async function getUserRole() {
  const cookieStore = await cookies();
  const roleData = cookieStore.get('role')?.value;
  
  if (!roleData) return { isSuperAdmin: false, canManageVisibility: false };
  
  try {
    const roles = JSON.parse(decodeURIComponent(roleData));
    const isSuperAdmin = Array.isArray(roles) && roles.includes('1');
    // Only shows the tab; its API checks the signed session's roles itself.
    const canManageVisibility = Array.isArray(roles) && (roles.includes('1') || roles.includes('4'));
    return { isSuperAdmin, canManageVisibility };
  } catch {
    return { isSuperAdmin: roleData === '1', canManageVisibility: roleData === '1' || roleData === '4' };
  }
}

export default async function LibrariesHomePage() {
  const { isSuperAdmin, canManageVisibility } = await getUserRole();
  
  return <LibrariesClient isSuperAdmin={isSuperAdmin} canManageVisibility={canManageVisibility} />;
}
