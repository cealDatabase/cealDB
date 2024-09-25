import db from "@/lib/db";
import CreateLibraryForm from "@/components/CreateLibraryForm";

export default async function CreateNewLibrary() {
  // Pulls db data and map out the options
  const typeData = await db.reflibrarytype.findMany();
  const regionData = await db.reflibraryregion.findMany();

  /******************************/
  // upload to db function
  /******************************/

  return (
    <div>
      <CreateLibraryForm data={[typeData, regionData]} />
    </div>
  );
};


