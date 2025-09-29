import db from "@/lib/db";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { EnhancedCreateLibraryForm } from "@/components/EnhancedCreateLibraryForm";

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
    console.error('Failed to parse role cookie in create page:', error);
    redirect('/unauthorized');
  }
}

export default async function CreateNewLibrary() {
  await checkAuthorization();
  
  // Pulls db data and map out the options
  const typeData = await db.reflibrarytype.findMany();
  const regionData = await db.reflibraryregion.findMany();

  return (
    <div className="min-h-screen bg-background">
      <EnhancedCreateLibraryForm data={[typeData, regionData]} />
    </div>
  );
};


