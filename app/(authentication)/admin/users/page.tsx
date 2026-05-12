import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserRoleManager } from "@/components/UserRoleManager";
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

async function UserManagementPage() {
  // Check if user is super admin
  const cookieStore = await cookies();
  const roleIds = cookieStore.get("role")?.value;
  
  let userRoleIds: string[] = [];
  try {
    userRoleIds = roleIds ? JSON.parse(roleIds) : [];
  } catch (error) {
    console.error('Failed to parse role IDs from cookie:', error);
    redirect('/admin');
  }

  // Check if user is super admin (role ID 1)
  if (!userRoleIds.includes("1")) {
    redirect('/admin');
  }

  return (
    <main className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <SlashIcon />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/admin">Admin</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <SlashIcon />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>Manage Users</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions across the system
          </p>
        </div>
        
        <UserRoleManager />
      </Container>
    </main>
  );
}

export default UserManagementPage;
