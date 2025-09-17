import { getAllLibraries, getAllRoles } from "@/data/fetchPrisma";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SignUpForm from "./formUI";

async function allLibraries() {
  const libraries = await getAllLibraries();
  return libraries;
}

async function allRoles() {
  const roles = await getAllRoles();
  return roles;
}

async function checkAuthorization() {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get('role');
  
  if (!roleCookie) {
    redirect('/unauthorized');
  }
  
  try {
    const userRoleIds: string[] = JSON.parse(roleCookie.value);
    const hasAuthorization = userRoleIds.includes("1") || userRoleIds.includes("4");
    
    if (!hasAuthorization) {
      redirect('/unauthorized');
    }
  } catch (error) {
    console.error('Failed to parse role cookie in signup page:', error);
    redirect('/unauthorized');
  }
}

export default async function SignUpPage() {
  await checkAuthorization();
  
  return (
    <main>
      <SignUpForm libraries={await allLibraries()} roles={await allRoles()} />
    </main>
  );
}
