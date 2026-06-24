import { cookies } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getUserByUserName,
  getRoleById,
  getLibraryById,
} from "@/data/fetchPrisma";
import Link from "next/link";
import { BookOpen, FileText, FileBarChart, Trophy, TrendingUp } from "lucide-react";

import { eResourceActions, superAdminActions, superAdminCategories } from "@/constant/form";
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
  const lastLoginCookie = cookieStore.get("lastlogin")?.value;

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
    <main className='min-h-screen bg-background'>
      <div className='container mx-auto px-6 py-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-8'>
          Admin Dashboard
        </h1>
        <div
          className={`grid grid-cols-1 ${isRegularUserOnly ? "max-w-4xl mx-auto gap-6" : "gap-8 lg:grid-cols-3"}`}
        >
          {/* User Profile Section - Left Column */}
          <div className={isRegularUserOnly ? "" : "lg:col-span-1"}>
            <UserProfile
              user={userData.user}
              roles={userData.roles || []}
              library={userData.library}
              lastLogin={lastLoginCookie || undefined}
            />
          </div>

          {/* Main Content Area - Right Columns */}
          <div className={`space-y-8 lg:col-span-2`}>
            {/* No permissions message */}
            {!canViewFormsManagement &&
              !canViewEResourceEditor &&
              !canViewSuperAdminTools && (
                <Card className='border-2 border-muted'>
                  <CardContent className='p-8 text-center'>
                    <p className='text-muted-foreground'>
                      You don't have permission to access administrative
                      features. Please contact your administrator if you believe
                      this is an error.
                    </p>
                  </CardContent>
                </Card>
              )}

            {/* Statistics Forms Section - Visible to all authenticated users (Role 1, 2, 3, 4) */}
            {canViewFormsManagement && (
              <Card className='border-l-4 border-l-blue-500 shadow-sm'>
                <CardHeader className='pb-3'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <FileText className='w-5 h-5 text-blue-600' />
                    </div>
                    <div>
                      <CardTitle className='text-lg text-blue-700'>
                        Statistics Forms
                      </CardTitle>
                      <CardDescription>
                        Access and complete statistics forms, including
                        selecting and customizing database lists for your
                        institution and entering statistical data across all
                        categories.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='pt-0'>
                  <div className='flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center'>
                        <FileText className='w-4 h-4 text-blue-600' />
                      </div>
                      <div>
                        <p className='font-medium text-sm'>Forms Page</p>
                        <p className='text-xs text-muted-foreground'>
                          Access all annual statistics survey forms.
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      size='sm'
                      className='bg-blue-600 hover:bg-blue-700'
                    >
                      <Link
                        href={`/admin/forms?libraryName=${encodeURIComponent(userData.library?.name || "")}`}
                      >
                        Access Forms
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Institutional Reports Card - Visible to all authenticated users (Role 1, 2, 3, 4) */}
            {canViewFormsManagement && (
              <Card className='border-l-4 border-l-emerald-500 shadow-sm'>
                <CardHeader className='pb-3'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <FileBarChart className='w-5 h-5 text-emerald-600' />
                    </div>
                    <div>
                      <CardTitle className='text-lg text-emerald-700'>
                        Statistics Reports
                      </CardTitle>
                      <CardDescription>
                        Access cross-year statistics reports for individual
                        institutions, with the ability to select specific years
                        and reporting categories.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='pt-0 space-y-2'>
                  <div className='flex items-center justify-between p-3 bg-emerald-50/50 rounded-lg border border-emerald-100'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-emerald-100 rounded-md flex items-center justify-center'>
                        <FileBarChart className='w-4 h-4 text-emerald-600' />
                      </div>
                      <div>
                        <p className='font-medium text-sm'>
                          Institutional & Survey Reports
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {hasMemberInstitution &&
                          !hasSuperAdmin &&
                          !hasEResourceEditor
                            ? "Export institutional reports and global survey data"
                            : "Export cross-year institutional reports and AV/E-Book/E-Journal surveys"}
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      size='sm'
                      className='bg-emerald-600 hover:bg-emerald-700'
                    >
                      <Link href='/admin/reports'>Access Reports</Link>
                    </Button>
                  </div>

                  <div className='flex items-center justify-between p-3 bg-emerald-50/50 rounded-lg border border-emerald-100'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-emerald-100 rounded-md flex items-center justify-center'>
                        <Trophy className='w-4 h-4 text-emerald-600' />
                      </div>
                      <div>
                        <p className='font-medium text-sm'>
                          My CEAL Ranking (1970 - Current)
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          View your institution&apos;s ranking across fiscal,
                          holdings, personnel, and serial metrics
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      size='sm'
                      className='bg-emerald-600 hover:bg-emerald-700'
                    >
                      <Link href='/admin/ranking'>View Rankings</Link>
                    </Button>
                  </div>

                  <div className='flex items-center justify-between p-3 bg-emerald-50/50 rounded-lg border border-emerald-100'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-emerald-100 rounded-md flex items-center justify-center'>
                        <TrendingUp className='w-4 h-4 text-emerald-600' />
                      </div>
                      <div>
                        <p className='font-medium text-sm'>
                          Cross-Year Reports
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          View your institution&apos;s materials and fiscal
                          growth trends across a custom year range
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      size='sm'
                      className='bg-emerald-600 hover:bg-emerald-700'
                    >
                      <Link href='/admin/my-cross-year-reports'>View Report</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* E-Resource Editor Section - Visible to E-Resource Editors, Super Admins, and Assistant Admins */}
            {canViewEResourceEditor && (
              <div>
                <div className='mb-6'>
                  <h2 className='text-2xl font-bold text-foreground mb-2'>
                    E-Resource Editor Section
                  </h2>
                  <p className='text-muted-foreground'>
                    Statistics Committee members use this section to manage
                    e-resource database lists, review data submitted by
                    participating institutions, and prepare the annual
                    statistics reports.
                  </p>
                </div>

                <div className='grid grid-cols-1 xl:grid-cols-3 gap-4'>
                  {eResourceActions.slice(0, 3).map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <Card
                        key={index}
                        className='hover:shadow-md transition-shadow'
                      >
                        <CardContent className='p-6'>
                          <div className='flex items-start gap-4'>
                            <div
                              className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center`}
                            >
                              <IconComponent
                                className={`w-5 h-5 ${action.iconColor}`}
                              />
                            </div>
                            <div className='flex-1'>
                              <h3 className='font-semibold text-primary mb-1'>
                                {action.title}
                              </h3>
                              <p className='text-sm text-muted-foreground mb-3'>
                                {action.description}
                              </p>
                              <Button variant='outline' size='sm' asChild>
                                <Link href={action.href}>Access</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                <div className='grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4'>
                  {eResourceActions.slice(3).map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <Card
                        key={index}
                        className='hover:shadow-md transition-shadow'
                      >
                        <CardContent className='p-6'>
                          <div className='flex items-start gap-4'>
                            <div
                              className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center`}
                            >
                              <IconComponent
                                className={`w-5 h-5 ${action.iconColor}`}
                              />
                            </div>
                            <div className='flex-1'>
                              <h3 className='font-semibold text-primary mb-1'>
                                {action.title}
                              </h3>
                              <p className='text-sm text-muted-foreground mb-3'>
                                {action.description}
                              </p>
                              <Button variant='outline' size='sm' asChild>
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
                <div className='mb-6'>
                  <h2 className='text-2xl font-bold text-foreground mb-2'>
                    Super Admin Toolkit
                  </h2>
                  <p className='text-muted-foreground'>
                    Comprehensive administrative tools and resources for
                    managing the CEAL Statistics system
                  </p>
                </div>

                {/* All cards in a single compact grid - 2 per row on large screens, 1 on small */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                  {superAdminActions.map((action: any, index: number) => {
                    const IconComponent = action.icon;
                    const cat = (superAdminCategories as any)[action.category];
                    return (
                      <Card
                        key={index}
                        className={`hover:shadow-md transition-shadow border-l-4 ${cat?.accent || "border-l-gray-400"}`}
                      >
                        <CardContent className='p-6'>
                          <div className='flex items-start gap-4'>
                            <div
                              className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}
                            >
                              <IconComponent
                                className={`w-5 h-5 ${action.iconColor}`}
                              />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center gap-2 mb-1'>
                                <h3 className='font-semibold text-primary'>
                                  {action.title}
                                </h3>
                                <span
                                  className={`text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded ${cat?.badgeBg || "bg-gray-100"} ${cat?.badgeText || "text-gray-800"}`}
                                >
                                  {cat?.label.split(" ")[0] || "TOOL"}
                                </span>
                              </div>
                              <p className='text-sm text-muted-foreground mb-3 line-clamp-6'>
                                {action.description}
                              </p>
                              <div className='flex items-center gap-2'>
                                <Button variant='outline' size='sm' asChild>
                                  <Link href={action.href}>Access</Link>
                                </Button>
                                {action.secondaryHref && (
                                  <Button variant='outline' size='sm' asChild>
                                    <Link href={action.secondaryHref}>
                                      {action.secondaryLabel}
                                    </Link>
                                  </Button>
                                )}
                                {action.tertiaryHref && (
                                  <Button variant='outline' size='sm' asChild>
                                    <Link href={action.tertiaryHref}>
                                      {action.tertiaryLabel}
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Admin Guide Reference */}
                <div className='mt-6 p-4 bg-muted/50 rounded-lg border border-border'>
                  <div className='flex items-center gap-3'>
                    <BookOpen className='w-5 h-5 text-muted-foreground' />
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-foreground'>
                        Need help?
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        View the{" "}
                        <Link
                          href='/admin/superguide'
                          className='text-primary hover:underline'
                        >
                          Admin Guide
                        </Link>{" "}
                        for detailed instructions on performing key operations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default UserLoggedInPage;
