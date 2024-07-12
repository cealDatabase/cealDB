import { getLibraryById, getRoleById, getUserByUserName } from "@/data/fetchPrisma";

export default async function getCookiesByEmail({
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
        return roleInfo?.map(async (roles) => {
          const roleObj = await getRoleById(roles.role_id);
          return roleObj?.name + ", ";
        });
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
        return output?.library_name;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  return {
    role: findRole(),
    library: findLibrary(),
  };
}
