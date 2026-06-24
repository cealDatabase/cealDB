import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserByUserName, getLibraryById } from '@/data/fetchPrisma';
import MyInstitutionCrossYearClient from './MyInstitutionCrossYearClient';

export default async function MyInstitutionCrossYearPage() {
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get('uinf')?.value;
  const roleCookie = cookieStore.get('role')?.value;

  if (!rawCookie) {
    redirect('/signin');
  }

  const userEmail = decodeURIComponent(rawCookie).toLowerCase();

  let userRoles: string[] = [];
  try {
    userRoles = roleCookie ? JSON.parse(roleCookie) : [];
  } catch {
    userRoles = roleCookie ? [roleCookie] : [];
  }

  // Any authenticated user (roles 1, 2, 3, 4) can access this page
  const isAllowed = userRoles.some(r => ['1', '2', '3', '4'].includes(r));
  if (!isAllowed) {
    redirect('/unauthorized');
  }

  // Resolve the user's attached library server-side
  const user = await getUserByUserName(userEmail);
  let libraryId: number | null = null;
  let libraryName: string | null = null;

  if (user?.User_Library && user.User_Library.length > 0) {
    const lid = user.User_Library[0].library_id;
    if (lid) {
      const lib = await getLibraryById(lid);
      if (lib) {
        libraryId = Number(lib.id);
        libraryName = String(lib.library_name);
      }
    }
  }

  return (
    <MyInstitutionCrossYearClient
      libraryId={libraryId}
      libraryName={libraryName}
    />
  );
}
