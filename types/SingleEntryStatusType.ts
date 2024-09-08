export type SingleEntryStatusType = {
  id: number;
  fiscal_support: Boolean | null;
  monographic_acquisitions: Boolean | null;
  other_holdings: Boolean | null;
  participating_libraries_information: Boolean | null;
  personnel_support_fte: Boolean | null;
  public_services: Boolean | null;
  serials: Boolean | null;
  unprocessed_backlog_materials: Boolean | null;
  volume_holdings: Boolean | null;
  electronic: Boolean | null;
  electronic_books: Boolean | null;
  espublished: Boolean;
  libraryyear: number | null;
};
