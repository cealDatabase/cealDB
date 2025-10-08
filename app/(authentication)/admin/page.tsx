import { cookies } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getUserByUserName,
  getRoleById,
  getLibraryById,
} from "@/data/fetchPrisma";
import Link from "next/link";
import {
  BookOpen,
  FileText,
} from "lucide-react";

import { actions } from "@/constant/form";
import { UserProfile } from "@/components/UserProfile";


async function getUserDetailByEmail({
  cookieStore,
}: {
  cookieStore: string | undefined;
}) {
  if (!cookieStore) {
    return null;
  }
  const singleUser = await getUserByUserName(cookieStore);

  if (!singleUser) {
    return null;
  }

  async function findRole() {
    try {
      const roleInfo = singleUser?.User_Roles;
      if (roleInfo && roleInfo.length > 0) {
        const roleNames = await Promise.all(
          roleInfo.map(async (roles) => {
            try {
              const roleObj = await getRoleById(roles.role_id);
              return roleObj?.name || null;
            } catch (error) {
              console.error('Error fetching role:', error);
              return null;
            }
          })
        );
        return roleNames.filter((role): role is string => Boolean(role));
      }
      return [];
    } catch (error) {
      console.error('Error in findRole:', error);
      return [];
    }
  }

  async function findLibrary() {
    try {
      const libraryid = singleUser?.User_Library?.[0]?.library_id;
      if (libraryid) {
        const output = await getLibraryById(libraryid);
        if (output && output.id && output.library_name) {
          return {
            id: Number(output.id),
            name: String(output.library_name)
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error in findLibrary:', error);
      return null;
    }
  }

  const libraryData = await findLibrary();
  const roleData = await findRole();

  async function findLastLogin() {
    try {
      const lastLogin = singleUser?.lastlogin_at;
      if (lastLogin) {
        return lastLogin.toISOString();
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  const lastLogin = await findLastLogin();

  return {
    user: singleUser as any,
    roles: Array.isArray(roleData) ? roleData : [],
    library: libraryData,
    lastLogin: lastLogin || undefined
  };
}

async function UserLoggedInPage() {
  const cookieStore = await cookies();
  const rawCookieValue = cookieStore.get("uinf")?.value;
  const userCookie = rawCookieValue ? decodeURIComponent(rawCookieValue).toLowerCase() : undefined;
  const roleIds = cookieStore.get("role")?.value;

  let userRoleIds: string[] = [];
  try {
    userRoleIds = roleIds ? JSON.parse(roleIds) : [];
  } catch (error) {
    console.error('Failed to parse role IDs from cookie:', error);
    userRoleIds = [];
  }

  if (!userCookie) {
    console.log("⚠️  No user cookie found in admin page");
  }

  const userData = await getUserDetailByEmail({ cookieStore: userCookie });
  const showSuperAdminTools = Array.isArray(userRoleIds) && userRoleIds.length > 0 && (
    userRoleIds.length > 1 || !userRoleIds.includes("2") || userRoleIds.includes("1")
  );

  // Check if user has ONLY role ID 2 (regular member institution user)
  const isRegularUserOnly = Array.isArray(userRoleIds) && 
    userRoleIds.length === 1 && 
    userRoleIds.includes("2");

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6">
          <CardContent>
            <p className="text-muted-foreground">Unable to load user data.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className={`grid grid-cols-1 gap-8 ${isRegularUserOnly ? 'max-w-2xl mx-auto' : 'lg:grid-cols-3'}`}>
          {/* User Profile Section - Left Column */}
          <div className={isRegularUserOnly ? '' : 'lg:col-span-1'}>
            <UserProfile
              user={userData.user}
              roles={userData.roles || []}
              library={userData.library}
              lastLogin={userData.lastLogin || undefined}
            />
          </div>

          {/* Main Content Area - Right Columns */}
          <div className={`space-y-8 ${isRegularUserOnly ? '' : 'lg:col-span-2'}`}>
            {/* Forms Management Section */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Forms Management</CardTitle>
                    <CardDescription>Manage and access all system forms</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Forms Page</p>
                      <p className="text-sm text-muted-foreground">Access all available forms and submissions</p>
                    </div>
                  </div>
                  <Button asChild className="">
                    <Link href={`/admin/forms?libraryName=${encodeURIComponent(userData.library?.name || '')}`}>
                      Access Forms
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Super Admin Toolkit */}
            {showSuperAdminTools && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Super Admin Toolkit</h2>
                  <p className="text-muted-foreground">Comprehensive administrative tools and resources</p>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-6">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center`}>
                          <BookOpen className={`w-5 h-5 text-green-600`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-primary mb-1">Admin Guide</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Provides an overview of the Super Admin’s responsibilities, along with instructions for performing key operations such as creating, editing, and deleting library and user information.
                          </p>
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/superguide">Access</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {actions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center`}>
                              <IconComponent className={`w-5 h-5 ${action.iconColor}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-primary mb-1">{action.title}</h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                {action.description}
                              </p>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={action.href}>Access</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserLoggedInPage;
