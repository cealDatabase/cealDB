import db from "@/lib/db";
import CreateLibraryForm from "@/components/CreateLibraryForm";

export default async function CreateNewLibrary() {
  // Pulls db data and map out the options
  const typeData = await db.reflibrarytype.findMany();
  const regionData = await db.reflibraryregion.findMany();
  //   const maxId =
  //     await db.$executeRaw`SELECT setval(pg_get_serial_sequence('"Library"', 'id'), MAX(id)) FROM "Library";
  // `;

  // console.log("maxId:", maxId);

  /******************************/
  // upload to db function
  /******************************/

  return (
    <div>
      <CreateLibraryForm data={[typeData, regionData]} />
      {/* <CreateFormDemo data={[typeData, regionData]} /> */}
    </div>
  );
};


