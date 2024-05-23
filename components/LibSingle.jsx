import { cookies } from "next/headers";
import { getRegionById, getUserById, getTypeById } from "@/data/fetchPrisma";
import Link from "next/link";
import { Container } from "./Container";
import { Button } from "./Button";

// Get Region
async function getRegionDetailById({ regionId }) {
  const regionItem = await getRegionById(regionId);
  return <RegionSingle region={regionItem} />;
}

function RegionSingle({ region }) {
  return <>{region.regionName}</>;
}

// Get Library Type
async function getTypeDetailById({ typeId }) {
  const typeItem = await getTypeById(typeId);
  return <TypeSingle type={typeItem} />;
}

function TypeSingle({ type }) {
  return <>{type.typeName}</>;
}

// Get User Detail
async function getUserDetailById({ userId }) {
  const singleUser = await getUserById(userId);
  return <UserSingle user={singleUser} />;
}

function UserSingle({ user }) {
  return (
    <div className="w-80 sm:min-w-96">
      <ul
        role="list"
        className="divide-y divide-gray-100 rounded-md border border-gray-200"
      >
        <li className="flex items-center justify-between py-1 pl-4 pr-5 text-sm leading-6">
          <div className="flex w-0 flex-1 items-center">
            <div className="ml-4 flex min-w-0 flex-1 gap-2">
              <span>Name: </span>
              <span>
                {user.firstName} {user.lastName}
              </span>
            </div>
          </div>
        </li>

        {user.positionTitle && (
          <li className="flex items-center justify-between py-1 pl-4 pr-5 text-sm leading-6">
            <div className="flex w-0 flex-1 items-center">
              <div className="ml-4 flex min-w-0 flex-1 gap-2">
                <span>Title: </span>
                <span>{user.positionTitle}</span>
              </div>
            </div>
          </li>
        )}

        {user.workPhone && (
          <li className="flex items-center justify-between py-1 pl-4 pr-5 text-sm leading-6">
            <div className="flex w-0 flex-1 items-center">
              <div className="ml-4 flex min-w-0 flex-1 gap-2">
                <span>Phone: </span>
                <span>{user.workPhone}</span>
              </div>
            </div>
          </li>
        )}

        {user.email && (
          <li className="flex items-center justify-between py-1 pl-4 pr-5 text-sm leading-6">
            <div className="flex w-0 flex-1 items-center">
              <div className="ml-4 flex min-w-0 flex-1 gap-2">
                Email: <span style={{ display: "none" }}>HIDDEN</span>
                {user.email}
                <span style={{ display: "none" }}>HIDDEN</span>
              </div>
            </div>
          </li>
        )}

        {user.faxNumber && (
          <li className="flex items-center justify-between py-1 pl-4 pr-5 text-sm leading-6">
            <div className="flex w-0 flex-1 items-center">
              <div className="ml-4 flex min-w-0 flex-1 gap-2">
                <span>Fax: </span>
                <span>{user.faxNumber}</span>
              </div>
            </div>
          </li>
        )}

        {!user.isActive && (
          <li className="flex items-center justify-between py-1 pl-4 pr-5 text-sm leading-6">
            <div className="flex w-0 flex-1 items-center">
              <div className="ml-4 flex min-w-0 flex-1 gap-2">
                <span>No longer serve as record submitter.</span>
              </div>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}

// Present Single Library details
export default function LibSingle({ libraries }) {
  const isAdminLoggedIn = cookies().get("Authorization");
  return (
    <main>
      <h1>{libraries.name}</h1>
      {isAdminLoggedIn ? <Button className="mb-4">Edit</Button> : ""}

      <Container className="bg-gray-100 rounded-lg">
        <div className="mt-2">
          <dl className="divide-y divide-gray-400">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
              <dt className="text-gray-500 font-medium">Library Region</dt>
              <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                {getRegionDetailById({ regionId: libraries.regionId })}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
              <dt className="text-gray-500 font-medium">Law Library</dt>
              <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                {libraries.isLawLibrary ? "Yes" : "No"}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
              <dt className="text-gray-500 font-medium">Medical Library</dt>
              <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                {libraries.isMedLibrary ? "Yes" : "No"}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
              <dt className="text-gray-500 font-medium">Library Type</dt>
              <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                {getTypeDetailById({ typeId: libraries.typeId })}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
              <dt className="text-gray-500 font-medium">Contact Person</dt>
              <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                {getUserDetailById({
                  userId: libraries.contactPersonId,
                })}
              </dd>
            </div>

            {libraries.bibliographic && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
                <dt className="text-gray-500 font-medium">
                  Bibliographic Utilities
                </dt>
                <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                  {libraries.bibliographic}
                </dd>
              </div>
            )}

            {libraries.consortia && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
                <dt className="text-gray-500 font-medium">
                  Networks or Consortia
                </dt>
                <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                  {libraries.consortia}
                </dd>
              </div>
            )}

            {libraries.systemVendor && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
                <dt className="text-gray-500 font-medium">
                  Integrated System Vendor
                </dt>
                <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                  {libraries.systemVendor}
                </dd>
              </div>
            )}

            {libraries.opac && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
                <dt className="text-gray-500 font-medium">
                  OPAC Capability of CJK Display
                </dt>
                <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                  {libraries.opac ? "Yes" : "No"}
                </dd>
              </div>
            )}

            {libraries.libHomePage && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
                <dt className="text-gray-500 font-medium">Library HomePage</dt>
                <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                  <Link href={libraries.libHomePage}>
                    {libraries.libHomePage}
                  </Link>
                </dd>
              </div>
            )}

            {libraries.onlineCatalogPage && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
                <dt className="text-gray-500 font-medium">
                  Library Online Catalog
                </dt>
                <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                  <Link href={libraries.onlineCatalogPage}>
                    {libraries.onlineCatalogPage}
                  </Link>
                </dd>
              </div>
            )}

            {libraries.establishedAt && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
                <dt className="text-gray-500 font-medium">Established At</dt>
                <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                  {libraries.establishedAt}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </Container>
    </main>
  );
}
