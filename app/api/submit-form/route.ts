import db from "@/lib/db";
import { NextResponse } from "next/server";
import { findMaxId } from "@/data/fetchPrisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const maxId = await findMaxId();

    // Ensure that the data conforms to the expected schema structure
    const libraryData = {
      id: maxId !== null ? maxId + 1 : 999,
      type: Number(data.type), // Foreign key or type ID
      library_name: data.library_name,
      plilaw: data.plilaw,
      plimed: data.plimed,
      plisubmitter_first_name: data.plisubmitter_first_name || null,
      plisubmitter_last_name: data.plisubmitter_last_name || null,
      pliposition_title: data.pliposition_title || null,
      pliwork_phone: data.pliwork_phone || null,
      plie_mail: data.plie_mail,
      plifax_number: data.plifax_number || null,
      pliinput_as_of_date: data.pliinput_as_of_date
        ? new Date(data.pliinput_as_of_date)
        : null,
      hideinlibrarylist: data.hideinlibrarylist === "true" ? true : false,
      pliregion: Number(data.pliregion) || null, // Foreign key if related
      collection_title: data.collection_title || null,
      library_number: Number(data.library_number),
      // Continue for other fields...
    };

    // Create a new library entry
    const newLibrary = await db.library.create({
      data: libraryData,
    });

    return NextResponse.json({ newLibrary });
  } catch (error) {
    console.error("Error creating library:", error);
    return NextResponse.json(
      { error: "Error creating library" },
      { status: 500 }
    );
  }
}
