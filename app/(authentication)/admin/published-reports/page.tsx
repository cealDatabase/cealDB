import { cookies } from 'next/headers';
import PublishedReportsClient from './PublishedReportsClient';

async function getUserRoles(): Promise<string[]> {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get('role')?.value;
  if (!roleCookie) return [];
  try { return JSON.parse(roleCookie); }
  catch { return [roleCookie]; }
}

export default async function PublishedReportsPage() {
  const roles = await getUserRoles();
  return <PublishedReportsClient userRoles={roles} />;
}
