export type SingleEntryStatusType = {
  id: number;
  fiscal_support: boolean | null;
  monographic_acquisitions: boolean | null;
  other_holdings: boolean | null;
  participating_libraries_information: boolean | null;
  personnel_support_fte: boolean | null;
  public_services: boolean | null;
  serials: boolean | null;
  unprocessed_backlog_materials: boolean | null;
  volume_holdings: boolean | null;
  electronic: boolean | null;
  electronic_books: boolean | null;
  espublished: boolean;
  libraryyear: number | null;
};
