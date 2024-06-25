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
async function getLibTypeDetailById({ typeId }) {
  const typeItem = await getTypeById(typeId);
  return <TypeSingle type={typeItem} />;
}

function TypeSingle({ type }) {
  return <>{type.typeName}</>;
}

// async function getUserDetailById({ userId }) {
//   const singleUser = await getUserById(userId);
//   return <UserSingle user={singleUser} />;
// }

function UserSingle(first_name, last_name, title, phone, email, faxnumber) {
  return (
    <div className="w-80 sm:min-w-96">
      <ul
        role="list"
        className="divide-y divide-gray-100 rounded-md border border-gray-200"
      >
        {(first_name || last_name) && (
          <li className="flex items-center justify-between py-1 pl-4 pr-5 text-sm leading-6">
            <div className="flex w-0 flex-1 items-center">
              <div className="ml-4 flex min-w-0 flex-1 gap-2">
                <span>Name: </span>
                <span>
                  {first_name || null} {last_name || null}
                </span>
              </div>
            </div>
          </li>
        )}

        {title && (
          <li className="flex items-center justify-between py-1 pl-4 pr-5 text-sm leading-6">
            <div className="flex w-0 flex-1 items-center">
              <div className="ml-4 flex min-w-0 flex-1 gap-2">
                <span>Title: </span>
                <span>{title}</span>
              </div>
            </div>
          </li>
        )}

        {phone && (
          <li className="flex items-center justify-between py-1 pl-4 pr-5 text-sm leading-6">
            <div className="flex w-0 flex-1 items-center">
              <div className="ml-4 flex min-w-0 flex-1 gap-2">
                <span>Phone: </span>
                <span>{phone}</span>
              </div>
            </div>
          </li>
        )}

        {email && (
          <li className="flex items-center justify-between py-1 pl-4 pr-5 text-sm leading-6">
            <div className="flex w-0 flex-1 items-center">
              <div className="ml-4 flex min-w-0 flex-1 gap-2">
                Email: <span style={{ display: "none" }}>HIDDEN</span>
                {email}
                <span style={{ display: "none" }}>HIDDEN</span>
              </div>
            </div>
          </li>
        )}

        {faxnumber && (
          <li className="flex items-center justify-between py-1 pl-4 pr-5 text-sm leading-6">
            <div className="flex w-0 flex-1 items-center">
              <div className="ml-4 flex min-w-0 flex-1 gap-2">
                <span>Fax: </span>
                <span>{faxnumber}</span>
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
  const isAdminLoggedIn = cookies().get("session");
  return (
    <main>
      <h1>{libraries.library_name}</h1>
      {isAdminLoggedIn ? <Button className="mb-4">Edit</Button> : ""}

      <Container className="bg-gray-100 rounded-lg">
        <div className="mt-2">
          <dl className="divide-y divide-gray-400">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
              <dt className="text-gray-500 font-medium">Library Region</dt>
              <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                {getRegionDetailById({ regionId: libraries.pliregion })}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
              <dt className="text-gray-500 font-medium">Law Library</dt>
              <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                {libraries.plilaw ? "Yes" : "No"}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
              <dt className="text-gray-500 font-medium">Medical Library</dt>
              <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                {libraries.plimed ? "Yes" : "No"}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
              <dt className="text-gray-500 font-medium">Library Type</dt>
              <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                {getLibTypeDetailById({ typeId: libraries.type })}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
              <dt className="text-gray-500 font-medium">Contact Person</dt>
              <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                {UserSingle(
                  libraries.plisubmitter_first_name,
                  libraries.plisubmitter_last_name,
                  libraries.pliposition_title,
                  libraries.pliwork_phone,
                  libraries.plie_mail,
                  libraries.plifax_number
                )}
              </dd>
            </div>

            {libraries.plibibliographic && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
                <dt className="text-gray-500 font-medium">
                  Bibliographic Utilities
                </dt>
                <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                  {libraries.plibibliographic}
                </dd>
              </div>
            )}

            {libraries.pliconsortia && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
                <dt className="text-gray-500 font-medium">
                  Networks or Consortia
                </dt>
                <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                  {libraries.pliconsortia}
                </dd>
              </div>
            )}

            {libraries.plisystem_vendor && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
                <dt className="text-gray-500 font-medium">
                  Integrated System Vendor
                </dt>
                <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                  {libraries.plisystem_vendor}
                </dd>
              </div>
            )}

            {libraries.pliopac && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
                <dt className="text-gray-500 font-medium">
                  OPAC Capability of CJK Display
                </dt>
                <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                  {libraries.pliopac ? "Yes" : "No"}
                </dd>
              </div>
            )}

            {libraries.plihome_page && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
                <dt className="text-gray-500 font-medium">Library HomePage</dt>
                <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                  <Link href={libraries.plihome_page}>
                    {libraries.plihome_page}
                  </Link>
                </dd>
              </div>
            )}

            {libraries.plionline_catalog && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
                <dt className="text-gray-500 font-medium">
                  Library Online Catalog
                </dt>
                <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                  <Link href={libraries.plionline_catalog}>
                    {libraries.plionline_catalog}
                  </Link>
                </dd>
              </div>
            )}

            {libraries.pliestablishedyear && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
                <dt className="text-gray-500 font-medium">Established At</dt>
                <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                  {libraries.pliestablishedyear}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </Container>
    </main>
  );
}
