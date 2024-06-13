import { cookies } from "next/headers";
import { Container } from "@/components/Container";
import { getUserByEmail } from "@/data/fetchPrisma";

const cookieStore = cookies().get("uinf")?.value;

async function getUserDetailByEmail({
  cookieStore,
}: {
  cookieStore: string | undefined;
}) {
  if (!cookieStore) {
    return null; // or handle the case when cookieStore is undefined
  }
  const singleUser = await getUserByEmail(cookieStore);
  return <UserSingle user={singleUser} />;
}

function UserSingle({ user }: { user: any }) {
  return (
    <div className="w-80 sm:min-w-96">
      <div className="flex items-center justify-between py-1 pl-4 pr-5">
        <p>First Name: {user?.firstName}</p>
        <p>Last Name: {user?.lastName} </p>
        <p>Email:{user?.email}</p>
      </div>
    </div>
  );
}

const UserLoggedInPage = () => {
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
