import { cookies } from 'next/headers';
import EmailTemplatesClient from './EmailTemplatesClient';

async function getUserRoles(): Promise<string[]> {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get('role')?.value;
  if (!roleCookie) return [];
  try {
    return JSON.parse(roleCookie);
  } catch {
    return [roleCookie];
  }
}

export default async function EmailTemplatesPage() {
  const roles = await getUserRoles();
  return <EmailTemplatesClient userRoles={roles} />;
}
