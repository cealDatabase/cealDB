export type SingleUserType = {
  id: number;
  username: string;
  password: string;
  isactive: Boolean;
  lastlogin_at: Date | null;
  firstName: string | null;
  lastName: string | null;
};

export type Reflibrarytype = {
  id: number;
  librarytype: string;
  library: SingleLibraryType[];
};

export type Reflibraryregion = {
  id: number;
  libraryregion: string;
  library: SingleLibraryType[];
};

export type SingleLibraryType = {
  id: number;
  type: number;
  library_name: string;
  plilaw: Boolean;
  plimed: Boolean;
  plisubmitter_first_name: string | null;
  plisubmitter_last_name: string | null;
  pliposition_title: string | null;
  pliwork_phone: string | null;
  plie_mail: string | null;
  plifax_number: string | null;
  pliinput_as_of_date: Date | null;
  password: string | null;
  plibibliographic: string | null;
  pliconsortia: string | null;
  plisystem_vendor: string | null;
  pliopac: Boolean | null;
  plihome_page: string | null;
  plionline_catalog: string | null;
  pliunique: Boolean | null;
  pliestablishedyear: string | null;
  library_number: number | null;
  pliregion: number | null;
  collection_title: string | null;
  collection_incharge_title: string | null;
  collection_organized_under: string | null;
  collection_head_reports_to: string | null;
  collection_top_department: string | null;
  collection_next_position_title: string | null;
  collection_other_departments: string | null;
  collection_librarians_groups: string | null;
  collection_type: string | null;
  shelving_type: string | null;
  consultation_type: string | null;
  teaching_type: string | null;
  acquisition_type: string | null;
  cataloging_type: string | null;
  circulation_type: string | null;
  date_last_changed: Date | null;
  notes: string | null;
  hideinlibrarylist: Boolean | null;
  libraryRegion: Reflibraryregion[] | null;
  libraryType: Reflibrarytype[];
};
