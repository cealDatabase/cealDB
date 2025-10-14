import db from "@/lib/db";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from "next/link";
import { EnhancedCreateLibraryForm } from "@/components/EnhancedCreateLibraryForm";
import { Container } from "@/components/Container";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { SlashIcon } from 'lucide-react';

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
      <Container>
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="my-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="no-underline">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <SlashIcon />
                </BreadcrumbSeparator>
                
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/admin" className="no-underline">Admin</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <SlashIcon />
                </BreadcrumbSeparator>
                
                <BreadcrumbItem>
                  <BreadcrumbPage>Create New Library</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </Container>
      
      <EnhancedCreateLibraryForm data={[typeData, regionData]} />
    </div>
  );
};


