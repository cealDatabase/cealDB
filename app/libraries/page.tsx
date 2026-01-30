import { cookies } from 'next/headers';
import LibrariesClient from '@/components/LibrariesClient';

async function getUserRole() {
  const cookieStore = await cookies();
  const roleData = cookieStore.get('role')?.value;
  
  if (!roleData) return { isSuperAdmin: false };
  
  try {
    const roles = JSON.parse(decodeURIComponent(roleData));
    const isSuperAdmin = Array.isArray(roles) && roles.includes('1');
    return { isSuperAdmin };
  } catch {
    return { isSuperAdmin: roleData === '1' };
  }
}

export default async function LibrariesHomePage() {
  const { isSuperAdmin } = await getUserRole();
  
  return <LibrariesClient isSuperAdmin={isSuperAdmin} />;
}
