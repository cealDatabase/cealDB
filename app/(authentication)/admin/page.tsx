import { cookies } from "next/headers";
import { Container } from "@/components/Container";
import { getUserByUserName, getRoleInfoByUserId } from "@/data/fetchPrisma";
import { SingleUserType } from "@/types/types";

async function getUserDetailByEmail({
  cookieStore,
}: {
  cookieStore: string | undefined;
}) {
  if (!cookieStore) {
    return null; // or handle the case when cookieStore is undefined
  }
  const singleUser = await getUserByUserName(cookieStore);
  async function role() {
    if (singleUser) {
      const roleIds = await getRoleInfoByUserId(singleUser.id);
      roleIds?.map(async (element) => {
        const resolvedElement = await element; // Await the promise to get the resolved value
        if (resolvedElement) {
          // Check if the resolved value is not null
          console.log(resolvedElement.role);
          return resolvedElement.role; // Access the name property directly
        } else {
          return null;
        }
      });
    }
  }

  return (
    <UserSingle user={singleUser as unknown as SingleUserType} role={role()} />
  );
}

function UserSingle({ user, role }: { user: SingleUserType; role: any }) {
  if (!user) {
    return null; // or handle the case when user is null
  }
  return (
    <div className="w-80 sm:min-w-96">
      <div className="">
        <p>User Id: {user.id}</p>
        <p>First Name: {user.firstName}</p>
        <p>Last Name: {user.lastName} </p>
        <p>Email:{user.username}</p>
        <p>Role: {role}</p> {/* Await the role promise */}
      </div>
    </div>
  );
}

function UserLoggedInPage() {
  const cookieStore = cookies().get("uinf")?.value.toLowerCase();
  return (
    <main>
      <Container>
        <h1>Hello {cookieStore}</h1>
        <div className="text-center">Contents on the User Page</div>
        {getUserDetailByEmail({ cookieStore })}
      </Container>
    </main>
  );
}

export default UserLoggedInPage;
