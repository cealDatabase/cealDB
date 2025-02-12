import { SingleElectronicType } from "./SingleElectronicType";
import { SingleElectronicBookType } from "./SingleElectronicBookType";
import { SingleFiscalSupportType } from "./SingleFiscalSupportType";
import { SingleSerialType } from "./SingleSerialType";
import { SingleEntryStatusType } from "./SingleEntryStatusType";
import { SingleMonographicType } from "./SingleMonographicType";
import { SingleOtherHoldingsType } from "./SingleOtherHoldingsType";
import { SinglePersonnelSupportType } from "./SinglePersonnelSupportType";
import { SingleVolumeHoldingsType } from "./SingleVolumeHoldingsType";

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

export type SingleLanguageType = {
  id: number;
  short: string;
  full: string;
};

export type SingleUserType = {
  id: number;
  username: string;
  password: string;
  isactive: Boolean;
  lastlogin_at: Date | null;
  firstname: string | null;
  lastname: string | null;
  user_library: User_Library_Type[] | null;
  user_roles: Users_Roles_Type[] | null;
};

export type User_Library_Type = {
  user_id: number;
  library_id: number;
  user: SingleUserType;
  library: SingleLibraryType;
};

export type SingleRoleType = {
  id: number;
  role: string;
  name: string;
  user_roles: Users_Roles_Type[] | null;
};

export type Users_Roles_Type = {
  user_id: number;
  role_id: number;
  user: SingleUserType;
  role: SingleRoleType;
};

export type LibraryYear_ListAVType = {
  libraryyear_id: number;
  listav_id: number;
};

export type LibraryYear_ListEBookType = {
  libraryyear_id: number;
  listebook_id: number;
};

export type LibraryYear_ListJournalType = {
  libraryyear_id: number;
  listjournal_id: number;
};

export type List_AV_Type = {
  id: number;
  type: String | null;
  title: String | null;
  cjk_title: String | null;
  romanized_title: String | null;
  subtitle: String | null;
  publisher: String | null;
  description: String | null;
  notes: String | null;
  data_source: String | null;
  updated_at: Date;
  is_global: Boolean | null;
  libraryyear: number | null;
  Library_Year: Library_Year_Type;
  LibraryYear_ListAV: LibraryYear_ListAVType[];
  List_AV_Counts: SingleListAVCountsType;
  List_AV_Language: SingleListAVLanguageType[];
};

export type SingleListAVLanguageType = {
  listav_id: number;
  language_id: number;
};

export type SingleListAVCountsType = {
  id: number;
  titles: number | null;
  year: number | null;
  updatedat: Date;
  ishidden: Boolean | null;
};

export type List_EBook_Type = {
  id: number;
  title: String | null;
  sub_series_number: String | null;
  publisher: String | null;
  description: String | null;
  notes: String | null;
  updated_at: Date;
  subtitle: String | null;
  cjk_title: String | null;
  romanized_title: String | null;
  data_source: String | null;
  is_global: Boolean | null;
  libraryyear: number | null;
};

export type List_EJournal_Type = {
  id: number;
  title: String | null;
  sub_series_number: String | null;
  publisher: String | null;
  description: String | null;
  notes: String | null;
  updated_at: Date;
  subtitle: String | null;
  series: String | null;
  vendor: String | null;
  cjk_title: String | null;
  romanized_title: String | null;
  data_source: String | null;
  is_global: Boolean | null;
  libraryyear: number | null;
};

export type SingleLibraryType = {
  // id: number;
  type: number;
  library_name: string;
  plilaw: boolean;
  plimed: boolean;
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
  pliopac: boolean | null;
  plihome_page: string | null;
  plionline_catalog: string | null;
  pliunique: boolean | null;
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
  hideinlibrarylist: boolean | null;
  libraryRegion: Reflibraryregion | null;
  libraryType: Reflibrarytype;
  user_library: User_Library_Type;
};

export type Library_Year_Type = {
  id: number;
  library: number | null;
  is_open_for_editing: Boolean | null;
  admin_notes: String | null;
  year: number;
  updated_at: Date;
  is_active: Boolean | null;

  Library: SingleLibraryType;
  Electronic: SingleElectronicType;
  Electronic_Books: SingleElectronicBookType;
  Entry_Status: SingleEntryStatusType;
  Fiscal_Support: SingleFiscalSupportType;
  LibraryYear_ListAV: LibraryYear_ListAVType[];
  LibraryYear_ListEBook: LibraryYear_ListEBookType[];
  LibraryYear_ListJournal: LibraryYear_ListJournalType[];
  Monographic_Acquisitions: SingleMonographicType;
  Other_Holdings: SingleOtherHoldingsType;
  Personnel_Support: SinglePersonnelSupportType;
  Serials: SingleSerialType;
  Volume_Holdings: SingleVolumeHoldingsType;
  List_AV: List_AV_Type[];
  List_EBook: List_EBook_Type[];
  List_EJournal: List_EJournal_Type[];
};
