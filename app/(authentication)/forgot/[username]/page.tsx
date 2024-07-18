import Link from "next/link";
import { getUserByUserName } from "../../../../data/fetchPrisma";

export const dynamic = "force-dynamic";

async function UserSinglePage(username: string) {
  const userItem = await getUserByUserName(username);
  if (userItem) return userItem;
  else return null;
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
      {userItem && (
        <>
          <div key={userItem.id}>
            <div>{userItem.id}</div>
            <div>{userItem.username}</div>
            <div>{userItem.firstname}</div>
            <div>{userItem.lastname}</div>
            <div>{userItem.password}</div>
          </div>
        </>
      )}
      {!userItem && (
        <div>
          <h2 className="text-red-600">User Not Found</h2>
          <div className="mt-8">
            <Link href="/">Back to Homepage</Link>
          </div>
        </div>
      )}
    </main>
  );
}
