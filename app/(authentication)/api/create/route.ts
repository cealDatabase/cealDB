import db from "@/lib/db";

export async function POST(request: Request) {
  // read data off request body
  const body = await request.json();
  const { libraryName, hideInLibraryListing, libraryType  } = body;

  // ----------------- Create library in db -----------------
  // create a user in db. Will move to /data/fetchPrisma.ts in the future
  await db.library.create({
    data: {
      library_name: libraryName,
      hideinlibrarylist: false, // Add appropriate value
      date_last_changed: new Date(),
      plilaw: false, // Add appropriate value
      plimed: false, // Add appropriate value
      plie_mail: "", // Add appropriate value
      library_number: 0, // Add appropriate value
      libraryType: {
        connect: {
          id: 1, // Replace with the appropriate ID
        },
      }, // Add appropriate value
    },
  });

  // return something
  return Response.json({});
}
