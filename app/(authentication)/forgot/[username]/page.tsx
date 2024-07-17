import { getUserByUserName } from "../../../../data/fetchPrisma";

export const dynamic = "force-dynamic";

async function UserSinglePage(username: string) {
  const userItem = await getUserByUserName(username);
  return userItem;
}

function normalizeUsername(rawUsername: string): string {
  // Clean the username by trimming and replacing any unwanted characters
  return rawUsername.trim().replace("%40", "@").toLowerCase();
}

export default async function SingleLibraryInfoHomePage({
  params,
}: {
  params: { username: string };
}) {
  const userItem = await UserSinglePage(normalizeUsername(params.username));
  return (
    <main>
      here is your info:
      {userItem && (
        <>
          <div>{userItem.id}</div>
          <div>{userItem.username}</div>
          <div>{userItem.firstname}</div>
          <div>{userItem.lastname}</div>
          <div>{userItem.password}</div>
        </>
      )}
    </main>
  );
}
