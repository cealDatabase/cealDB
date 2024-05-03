import { getRegionById, getUserById } from "@/data/fetchPrisma";
import Link from "next/link";

async function getRegionDetailById({ regionId }) {
  const regionItem = await getRegionById(regionId);
  return <RegionSingle region={regionItem} />;
}

function RegionSingle({ region }) {
  return <>{region.regionName}</>;
}

async function getUserDetailById({ userId }) {
  const singleUser = await getUserById(3);
  return <UserSingle user={singleUser} />;
}

function UserSingle({ user }) {
  console.log({ user });
  return (
    <>
      <p>
        Name: {user.firstName} {user.lastName}
      </p>
      <p>Email: {user.email}</p>
      <p>Title: {user.positionTitle}</p>
    </>
  );
}

export default function LibSingle({ libraries }) {
  return (
    <main>
      <h1>{libraries.name}</h1>

      <h3>Library ID: {libraries.id}</h3>

      {libraries.libHomePage && (
        <h3>
          <Link href={libraries.libHomePage}>{libraries.libHomePage}</Link>
        </h3>
      )}

      <h3>Region: {getRegionDetailById({ regionId: libraries.regionId })}</h3>
      <h3>Contact Person: {getUserDetailById({ userId: libraries.userId })}</h3>
    </main>
  );
}
