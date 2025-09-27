import { cookies } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getUserByUserName,
  getRoleById,
  getLibraryById,
} from "@/data/fetchPrisma";
import { SingleUserType } from "@/types/types";
import Link from "next/link";
import { LocalDateTime } from "@/components/LocalDateTime";
import {
  User,
  Calendar,
  Mail,
  Building,
  FileText,
  Settings,
} from "lucide-react";

import { actions } from "@/constant/form";


function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}


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
    user: singleUser as unknown as SingleUserType,
    roles: Array.isArray(roleData) ? roleData : [],
    library: libraryData,
    lastLogin: lastLogin || undefined
  };
}

function UserProfile({
  user,
  roles,
  library,
  lastLogin,
}: {
  user: SingleUserType;
  roles: string[];
  library: { id: number; name: string } | null;
  lastLogin?: string;
}) {
  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          {/* <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div> */}
          <div>
            <CardTitle className="text-xl">Hello {user.firstname}</CardTitle>
            <CardDescription>Welcome back to your dashboard</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {lastLogin && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Last Login:</span>
              <span className="font-medium">
                <LocalDateTime dateString={lastLogin} />
              </span>
            </div>
          )}

          {(user.firstname || user.lastname) && (
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{user.firstname} {user.lastname}</span>
            </div>
          )}

          {user.username && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <Link href={`mailto:${user.username}`} className="font-medium">
                {user.username}
              </Link>
            </div>
          )}

          {roles && roles.length > 0 && (
            <div className="flex items-start gap-3 text-sm">
              <Settings className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span className="text-muted-foreground">Role:</span>
              <div className="flex flex-wrap gap-1">
                {roles.map((role, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {library && (
            <div className="flex items-center gap-3 text-sm">
              <Building className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Institution:</span>
              <Link href={`/libraries/${library.id}`} className="font-medium">
                {library.name}
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Section - Left Column */}
          <div className="lg:col-span-1">
            <UserProfile
              user={userData.user}
              roles={userData.roles || []}
              library={userData.library}
              lastLogin={userData.lastLogin || undefined}
            />
          </div>

          {/* Main Content Area - Right Columns */}
          <div className="lg:col-span-2 space-y-8">
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
