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
  searchParams,
}: {
  params: { username: string };
  searchParams: { token: number };
}) {
  const userItem = await UserSinglePage(normalizeUsername(params.username));
  const isValid =
    Math.abs(Number(Date.now()) - searchParams.token) <= 15 * 60 * 1000 // 15 minutes
      ? true
      : false;

  console.log(isValid);

  return (
    <main>
      {userItem && !isValid && (
        <div>
          <p className="text-3xl font-medium text-gray-900">
            User found.
            <br />
            But validation email <b>expired</b>...
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              href="/forgot"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
            >
              Resend Email
            </Link>
            <Link
              href="/"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Back Home <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      )}
      {userItem && isValid && (
        <div key={userItem.id}>
          <div>{userItem.id}</div>
          <div>{userItem.username}</div>
          <div>{userItem.firstname}</div>
          <div>{userItem.lastname}</div>
          <div>{userItem.password}</div>
        </div>
      )}
      {!userItem && (
        <div>
          <p className="text-4xl font-medium text-gray-900 text-center">
            User Not Found
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              href="/forgot"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
            >
              Resend Validation Email
            </Link>
            <Link
              href="/"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Back Home <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
