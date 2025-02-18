import db from "@/lib/db";
import { NextResponse } from "next/server";
import { findMaxId } from "@/data/fetchPrisma";
import { connect } from "http2";

export async function POST(request) {
  try {
    const data = await request.json();

    const maxId = await findMaxId();

    // Ensure that the data conforms to the expected schema structure
    const libraryData = {
      library_name: data.library_name,
      plilaw: data.plilaw,
      plimed: data.plimed,
      plisubmitter_first_name: data.plisubmitter_first_name || null,
      plisubmitter_last_name: data.plisubmitter_last_name || null,
      pliposition_title: data.pliposition_title || null,
      pliwork_phone: data.pliwork_phone || null,
      plie_mail: data.plie_mail,
      plifax_number: data.plifax_number || null,
      plihome_page: data.plihome_page || null,
      plionline_catalog: data.plionline_catalog || null,
      plibibliographic: data.plibibliographic || null,
      pliconsortia: data.pliconsortia || null,
      plisystem_vendor: data.plisystem_vendor || null,
      pliopac: data.pliopac,
      pliestablishedyear: data.pliestablishedyear || null,
      pliinput_as_of_date: data.pliinput_as_of_date
        ? new Date(data.pliinput_as_of_date)
        : null,
      hideinlibrarylist: data.hideinlibrarylist,
      collection_title: data.collection_title || null,
      collection_incharge_title: data.collection_incharge_title || null,
      collection_head_reports_to: data.collection_head_reports_to || null,
      collection_organized_under: data.collection_organized_under || null,
      collection_top_department: data.collection_top_department || null,
      collection_next_position_title:
        data.collection_next_position_title || null,
      collection_other_departments: data.collection_other_departments || null,
      collection_librarians_groups: data.collection_librarians_groups || null,
      collection_type: data.collection_type || null,
      shelving_type: data.shelving_typoe || null,
      consultation_type: data.consultation_type || null,
      teaching_type: data.teaching_type || null,
      acquisition_type: data.acquisition_type || null,
      cataloging_type: data.cataloging_type || null,
      circulation_type: data.circulation_type || null,
      library_number: Number(data.library_number),
      date_last_changed: data.date_last_changed || null,
      notes: data.notes || null,

      libraryType: {
        connect: { id: Number(data.type) }, // Ensure type exists in Reflibrarytype
      },

      libraryRegion: {
        connect: { id: Number(data.pliregion) },
      },
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
