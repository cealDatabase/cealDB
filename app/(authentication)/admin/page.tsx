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
  FileBarChart,
} from "lucide-react";

import { eResourceActions, superAdminActions } from "@/constant/form";
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
  
  // Role checks based on role IDs
  const hasSuperAdmin = Array.isArray(userRoleIds) && userRoleIds.includes("1"); // Role ID 1: Super Admin
  const hasMemberInstitution = Array.isArray(userRoleIds) && userRoleIds.includes("2"); // Role ID 2: Member Institution
  const hasEResourceEditor = Array.isArray(userRoleIds) && userRoleIds.includes("3"); // Role ID 3: E-Resource Editor
  const hasAssistantAdmin = Array.isArray(userRoleIds) && userRoleIds.includes("4"); // Role ID 4: Assistant Admin
  
  // Permission logic
  const canViewFormsManagement = hasSuperAdmin || hasAssistantAdmin || hasEResourceEditor || hasMemberInstitution;
  const canViewEResourceEditor = hasSuperAdmin || hasAssistantAdmin || hasEResourceEditor;
  const canViewSuperAdminTools = hasSuperAdmin || hasAssistantAdmin;
  
  // Layout check: if user only has access to forms but not super admin tools
  const isRegularUserOnly = canViewFormsManagement && !canViewEResourceEditor;

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
        <div className={`grid grid-cols-1 gap-y-8 ${isRegularUserOnly ? 'max-w-2xl mx-auto' : 'lg:grid-cols-3'}`}>
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
          <div className={`space-y-8 lg:col-span-2`}>
            {/* No permissions message */}
            {!canViewFormsManagement && !canViewEResourceEditor && !canViewSuperAdminTools && (
              <Card className="border-2 border-muted">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    You don't have permission to access administrative features. Please contact your administrator if you believe this is an error.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Statistics Forms Section - Visible to all authenticated users (Role 1, 2, 3, 4) */}
            {canViewFormsManagement && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Statistics Forms</CardTitle>
                    <CardDescription>View and manage statistics forms and submissions.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Forms Page</p>
                      <p className="text-sm text-muted-foreground">Access all annual statistics survey forms.</p>
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
            )}

            {/* Institutional Reports Card - Visible to all authenticated users (Role 1, 2, 3, 4) */}
            {canViewFormsManagement && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileBarChart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Statistics Reports</CardTitle>
                    <CardDescription>Export institutional and global survey reports</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileBarChart className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Institutional & Survey Reports</p>
                      <p className="text-sm text-muted-foreground">
                        {hasMemberInstitution && !hasSuperAdmin && !hasEResourceEditor
                          ? "Export institutional reports and global survey data"
                          : "Export cross-year institutional reports and AV/E-Book/E-Journal surveys"}
                      </p>
                    </div>
                  </div>
                  <Button asChild className="">
                    <Link href="/admin/reports">
                      Access Reports
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            )}

            {/* E-Resource Editor Section - Visible to E-Resource Editors, Super Admins, and Assistant Admins */}
            {canViewEResourceEditor && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">E-Resource Editor Section</h2>
                <p className="text-muted-foreground">Access forms to manage database lists and review annual reports.</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {eResourceActions.map((action, index) => {
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

            {/* Super Admin Toolkit - Visible only to Super Admins and Assistant Admins */}
            {canViewSuperAdminTools && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Super Admin Toolkit</h2>
                  <p className="text-muted-foreground">Comprehensive administrative tools and resources for managing the CEAL Statistics system</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {superAdminActions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <IconComponent className={`w-5 h-5 ${action.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-primary mb-1">{action.title}</h3>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
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

                {/* Admin Guide Reference */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Need help?</p>
                      <p className="text-sm text-muted-foreground">
                        View the <Link href="/admin/superguide" className="text-primary hover:underline">Admin Guide</Link> for detailed instructions on performing key operations.
                      </p>
                    </div>
                  </div>
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
