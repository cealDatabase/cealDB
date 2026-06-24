import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CrossYearReportsClient from './CrossYearReportsClient';

export default async function CrossYearReportsPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('uinf')?.value;
  const roleCookie = cookieStore.get('role')?.value;

  if (!userCookie) {
    redirect('/signin');
  }

  let userRoles: string[] = [];
  try {
    userRoles = roleCookie ? JSON.parse(roleCookie) : [];
  } catch {
    userRoles = roleCookie ? [roleCookie] : [];
  }

  // Restrict to Super Admin (1), Assistant Admin (4), E-Resource Editor (3)
  const isAllowed =
    userRoles.includes('1') ||
    userRoles.includes('3') ||
    userRoles.includes('4');

  if (!isAllowed) {
    redirect('/unauthorized');
  }

  return <CrossYearReportsClient />;
}
