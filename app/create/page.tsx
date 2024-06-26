import db from "@/lib/db";
import { redirect } from "next/navigation";

const CreateNewLibrary = () => {
  async function createLibrary(formData: FormData) {
    // This needs to be a server action
    "use server"; // If not specified, always server action

    // Check the user's inputs and make sure they're valid
    const libraryName = formData.get("name") as string;
    const isLawLibrary = formData.get("isLawLibrary") === "true" ? true : false;
    const isMedLibrary = formData.get("isMedLibrary") === "true" ? true : false;

    // Create a new record in the database
    await db.library.create({
      data: {
        type: 5,
        library_name: libraryName,
        plilaw: isLawLibrary,
        plimed: isMedLibrary,
        plie_mail: "test@ceal.org",
        plibibliographic: "OCLC",
        pliconsortia: "Orbis/Cascade Summit",
        plisystem_vendor: "Innovative III",
        pliopac: true,
        library_number: 9102,
        pliregion: 9,
        plihome_page: "https://www.mcgill.ca/library/",
        plionline_catalog: "https://libraryguides.mcgill.ca/az.php",
      },
    });

    // Redirect the user back to the Libraries route
    redirect("/libraries");
  }
  return (
    <main>
      <h2>Create a New Library</h2>
      <form action={createLibrary}>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <label htmlFor="name">Library Name</label>
            <input type="text" id="name" name="name" />
          </div>

          <div className="flex gap-4">
            <p>Is Law Library?</p>
            <label htmlFor="isLawLibrary">Yes</label>
            <input
              type="radio"
              id="isLawLibrary"
              name="isLawLibrary"
              value={`true`}
            />
            <label htmlFor="isLawLibrary">No</label>
            <input
              type="radio"
              id="isLawLibrary"
              name="isLawLibrary"
              value={`false`}
            />
          </div>

          <div className="flex gap-4">
            <p>Is Med Library?</p>
            <label htmlFor="isMedLibrary">Yes</label>
            <input
              type="radio"
              id="isMedLibrary"
              name="isMedLibrary"
              value={`true`}
            />
            <label htmlFor="isMedLibrary">No</label>
            <input
              type="radio"
              id="isMedLibrary"
              name="isMedLibrary"
              value={`false`}
            />
          </div>

          <button type="submit" className="rounded p-2 bg-blue-200">
            Create
          </button>
        </div>
      </form>
    </main>
  );
};

export default CreateNewLibrary;
