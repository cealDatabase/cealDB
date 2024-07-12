import { getUserByUserName } from "@/data/fetchPrisma";

export default async function getCookiesByEmail({
  cookieStore,
}: {
  cookieStore: string | undefined;
}) {
  if (!cookieStore) {
    return null; // or handle the case when cookieStore is undefined
  }
  const singleUser = await getUserByUserName(cookieStore);

  async function findRole(): Promise<string | undefined> {
    try {
      const roleInfo = singleUser?.User_Roles.map((element) => element.role_id);
      return roleInfo?.join("; ");
    } catch (error) {
      return undefined;
    }
  }

  async function findLibrary() {
    try {
      return singleUser?.User_Library[0].library_id;
    } catch (error) {
      return undefined;
    }
  }

  const role = await findRole(); // Assuming findRole is correctly defined and uses await for asynchronous operations
  const library = await findLibrary(); // Assuming findLibrary is correctly defined and uses await for asynchronous operations

  return {
    role,
    library,
  };
}
