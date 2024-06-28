import { cookies } from "next/headers";
import { Container } from "@/components/Container";
import { getUserByUserName, getRoleInfoByUserId} from "@/data/fetchPrisma";
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
  // const roleInfo = await getInfoByUserId();
  return <UserSingle user={singleUser as unknown as SingleUserType} />;
}

function UserSingle({ user }: { user: SingleUserType }) {
  return (
    <div className="w-80 sm:min-w-96">
      <div className="flex items-center justify-between py-1 pl-4 pr-5">
        <p>Test Purpose: {user?.id}</p>
        <p>First Name: {user?.firstName}</p>
        <p>Last Name: {user?.lastName} </p>
        <p>Email:{user?.username}</p>
      </div>
    </div>
  );
}

const UserLoggedInPage = () => {
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
};

export default UserLoggedInPage;
