import { cookies } from "next/headers";
import { Container } from "@/components/Container";
import {
  getUserByUserName,
  getRoleById,
  getLibraryById,
} from "@/data/fetchPrisma";
import { SingleUserType } from "@/types/types";
import Link from "next/link";


import {
  AcademicCapIcon,
  BanknotesIcon,
  CheckBadgeIcon,
  ClockIcon,
  ReceiptRefundIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

const actions = [
  {
    title: 'Admin Help',
    href: '/admin/help',
    icon: ClockIcon,
    iconForeground: 'text-teal-700',
    iconBackground: 'bg-teal-50',
  },
  {
    title: 'Audio/Visual Databases',
    href: `/admin/survey/avdb/${new Date().getFullYear()}`,
    icon: CheckBadgeIcon,
    iconForeground: 'text-purple-700',
    iconBackground: 'bg-purple-50',
  },
  {
    title: 'Custom Fields for Other Holdings',
    href: '/admin/custom-other',
    icon: UsersIcon,
    iconForeground: 'text-sky-700',
    iconBackground: 'bg-sky-50',
  },
  {
    title: 'Ebook Databases',
    href: `/admin/survey/ebook/${new Date().getFullYear()}`,
    icon: BanknotesIcon,
    iconForeground: 'text-yellow-700',
    iconBackground: 'bg-yellow-50',
  },
  {
    title: 'All New User/Check All Users',
    href: '/admin/all-users',
    icon: ReceiptRefundIcon,
    iconForeground: 'text-rose-700',
    iconBackground: 'bg-rose-50',
  },
  {
    title: 'EJournal Databases',
    href: `/admin/survey/ejournal/${new Date().getFullYear()}`,
    icon: AcademicCapIcon,
    iconForeground: 'text-indigo-700',
    iconBackground: 'bg-indigo-50',
  },
  {
    title: 'Add New Library/Check All Libraries',
    href: '/admin/all-users',
    icon: ReceiptRefundIcon,
    iconForeground: 'text-rose-700',
    iconBackground: 'bg-rose-50',
  },
  {
    title: 'Something Else',
    href: '/admin/help',
    icon: ClockIcon,
    iconForeground: 'text-teal-700',
    iconBackground: 'bg-teal-50',
  },
]


function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}


async function getUserDetailByEmail({
  cookieStore,
}: {
  cookieStore: string | undefined;
}) {
  if (!cookieStore) {
    return null; // or handle the case when cookieStore is undefined
  }
  const singleUser = await getUserByUserName(cookieStore);

  async function findRole() {
    try {
      const roleInfo = singleUser?.User_Roles;
      if (roleInfo?.length ?? 0 > 1) {
        return (
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
            <dt className="text-gray-500 font-medium">Role</dt>
            <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
              {roleInfo?.map(async (roles) => {
                const roleObj = await getRoleById(roles.role_id);
                return roleObj?.name + ", ";
              })}
            </dd>
          </div>
        );
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  async function findLibrary() {
    try {
      const libraryid = singleUser?.User_Library[0].library_id;
      if (libraryid) {
        const output = await getLibraryById(libraryid);
        return {
          component: (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
              <dt className="text-gray-500 font-medium">Library</dt>
              <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                <Link href={`/libraries/${output?.id}`}>
                  {output?.library_name}
                </Link>
              </dd>
            </div>
          ),
          libraryName: output?.library_name
        };
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  const libraryData = await findLibrary();

  async function findLastLogin() {
    try {
      const lastLogin = singleUser?.lastlogin_at;
      if (lastLogin) {
        const nycTime = new Date(lastLogin).toLocaleString('en-US', {
          timeZone: 'America/New_York'
        });
        // return nycTime;
        return lastLogin.toISOString() // Return UTC time as ISO string for client-side conversion
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  const lastLogin = await findLastLogin();

  return (
    <UserSingle
      user={singleUser as unknown as SingleUserType}
      role={findRole()}
      library={libraryData?.component}
      libraryName={libraryData?.libraryName}
      lastLogin={lastLogin ? lastLogin : undefined}
    />
  );
}

function UserSingle({
  user,
  role,
  library,
  libraryName,
  lastLogin,
}: {
  user: SingleUserType;
  role: any;
  library: any;
  libraryName?: string;
  lastLogin?: string;
}) {
  if (!user) {
    return null; // or handle the case when user is null
  }
  return (
    <>
      <h1>Hello {user.firstname}</h1>

      <Container className="bg-gray-100 rounded-lg lg:min-w-[720px]">
        <div className="mt-2">
          <dl className="divide-y divide-gray-400">
            {lastLogin && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
                <dt className="text-gray-500 font-medium">Last Login</dt>
                <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                  <span>{new Date(lastLogin).toLocaleString()}</span>
                </dd>
              </div>
            )}

            {(user.firstname || user.lastname) && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
                <dt className="text-gray-500 font-medium">Name</dt>
                <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                  {user.firstname} {user.lastname}
                </dd>
              </div>
            )}

            {user.username && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
                <dt className="text-gray-500 font-medium">Email</dt>
                <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                  <Link href={`mailto:${user.username}`}>{user.username}</Link>
                </dd>
              </div>
            )}

            {role}

            {library}

            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
              <dt className="text-gray-500 font-medium">Forms</dt>
              <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                <Link href={`/admin/forms?libraryName=${encodeURIComponent(libraryName || '')}`}>Forms Page</Link>
              </dd>
            </div>

          </dl>
        </div>
      </Container>
    </>
  );
}

async function UserLoggedInPage() {
  // Use official Next.js cookies API
  const cookieStore = await cookies();
  const rawCookieValue = cookieStore.get("uinf")?.value;
  const userCookie = rawCookieValue ? decodeURIComponent(rawCookieValue).toLowerCase() : undefined;
  const roleIds = cookieStore.get("role")?.value;

  // Parse role IDs from JSON array
  let userRoleIds: string[] = [];
  try {
    userRoleIds = roleIds ? JSON.parse(roleIds) : [];
  } catch (error) {
    console.error('Failed to parse role IDs from cookie:', error);
    userRoleIds = [];
  }

  // Simple cookie check
  if (!userCookie) {
    console.log("⚠️  No user cookie found in admin page");
  }

  return (
    <main>
      {getUserDetailByEmail({ cookieStore: userCookie })}
      {/* Show Super Admin Tools when user has roles other than just role ID 2 */}
      {Array.isArray(userRoleIds) && userRoleIds.length > 0 && (
        userRoleIds.length > 1 || !userRoleIds.includes("2") || userRoleIds.includes("1")
      ) &&
        <div className="container mt-12">
          <h1>Super Admin Toolkit</h1>
          <div className="grid grid-cols-1 gap-y-12">
            <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
              {actions.map((action, actionIdx) => (
                <div
                  key={action.title}
                  className={classNames(
                    actionIdx === 0 ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none' : '',
                    actionIdx === 1 ? 'sm:rounded-tr-lg' : '',
                    actionIdx === actions.length - 2 ? 'sm:rounded-bl-lg' : '',
                    actionIdx === actions.length - 1 ? 'rounded-bl-lg rounded-br-lg sm:rounded-bl-none' : '',
                    'group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500',
                  )}
                >
                  <div>
                    <span
                      className={classNames(
                        action.iconBackground,
                        action.iconForeground,
                        'inline-flex rounded-lg p-3 ring-4 ring-white',
                      )}
                    >
                      <action.icon aria-hidden="true" className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-base font-semibold text-gray-900">
                      <a href={action.href} className="focus:outline-hidden">
                        {/* Extend touch target to entire panel */}
                        <span aria-hidden="true" className="absolute inset-0" />
                        {action.title}
                      </a>
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Doloribus dolores nostrum quia qui natus officia quod et dolorem. Sit repellendus qui ut at blanditiis et
                      quo et molestiae.
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400"
                  >
                    <svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6">
                      <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                    </svg>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      }
    </main>
  );
}

export default UserLoggedInPage;
