import { cookies } from "next/headers";
import { Container } from "@/components/Container";
import {
  getUserByUserName,
  getRoleById,
  getLibraryById,
} from "@/data/fetchPrisma";
import { SingleUserType } from "@/types/types";
import Link from "next/link";

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
        return (
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
            <dt className="text-gray-500 font-medium">Library</dt>
            <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
              <Link href={`/libraries/${output?.id}`}>
                {output?.library_name}
              </Link>
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

  return (
    <UserSingle
      user={singleUser as unknown as SingleUserType}
      role={findRole()}
      library={findLibrary()}
    />
  );
}

function UserSingle({
  user,
  role,
  library,
}: {
  user: SingleUserType;
  role: any;
  library: any;
}) {
  if (!user) {
    return null; // or handle the case when user is null
  }
  return (
    <main>
      <h1>Hello {user.firstname}</h1>

      <Container className="bg-gray-100 rounded-lg lg:min-w-[720px]">
        <div className="mt-2">
          <dl className="divide-y divide-gray-400">
            {user.id && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
                <dt className="text-gray-500 font-medium">User Id</dt>
                <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                  {user.id}
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
                <dt className="text-gray-500 font-medium">Survey</dt>
                <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                  <Link href={`/admin/forms`}>Forms Page</Link>
                </dd>
              </div>

          </dl>
        </div>
      </Container>
    </main>
  );
}

function UserLoggedInPage() {
  const cookieStore = cookies().get("uinf")?.value.toLowerCase();
  return (
    <main>
      <Container>{getUserDetailByEmail({ cookieStore })}</Container>
    </main>
  );
}

export default UserLoggedInPage;
