-- CreateTable
CREATE TABLE "Electronic" (
    "id" SERIAL NOT NULL,
    "libraryyear" INTEGER,
    "entryid" TEXT,
    "eaccompanied_computer_cd_chinese" DOUBLE PRECISION,
    "eaccompanied_computer_cd_japanese" DOUBLE PRECISION,
    "eaccompanied_computer_cd_korean" DOUBLE PRECISION,
    "eaccompanied_computer_cd_noncjk" DOUBLE PRECISION,
    "eaccompanied_computer_cd_subtotal" DOUBLE PRECISION,
    "eaccompanied_computer_memo" TEXT,
    "eaccompanied_computer_title_chinese" DOUBLE PRECISION,
    "eaccompanied_computer_title_japanese" DOUBLE PRECISION,
    "eaccompanied_computer_title_korean" DOUBLE PRECISION,
    "eaccompanied_computer_title_noncjk" DOUBLE PRECISION,
    "eaccompanied_computer_title_subtotal" DOUBLE PRECISION,
    "efulltext_electronic_expenditure_chinese" DECIMAL(65,30),
    "efulltext_electronic_expenditure_japanese" DECIMAL(65,30),
    "efulltext_electronic_expenditure_korean" DECIMAL(65,30),
    "efulltext_electronic_expenditure_noncjk" DECIMAL(65,30),
    "efulltext_electronic_expenditure_subtotal" DECIMAL(65,30),
    "efulltext_electronic_memo" TEXT,
    "efulltext_electronic_title_chinese" DOUBLE PRECISION,
    "efulltext_electronic_title_japanese" DOUBLE PRECISION,
    "efulltext_electronic_title_korean" DOUBLE PRECISION,
    "efulltext_electronic_title_noncjk" DOUBLE PRECISION,
    "efulltext_electronic_title_subtotal" DOUBLE PRECISION,
    "egift_computer_cd_chinese" DOUBLE PRECISION,
    "egift_computer_cd_japanese" DOUBLE PRECISION,
    "egift_computer_cd_korean" DOUBLE PRECISION,
    "egift_computer_cd_noncjk" DOUBLE PRECISION,
    "egift_computer_cd_subtotal" DOUBLE PRECISION,
    "egift_computer_memo" TEXT,
    "egift_computer_title_chinese" DOUBLE PRECISION,
    "egift_computer_title_japanese" DOUBLE PRECISION,
    "egift_computer_title_korean" DOUBLE PRECISION,
    "egift_computer_title_noncjk" DOUBLE PRECISION,
    "egift_computer_title_subtotal" DOUBLE PRECISION,
    "egrand_memo" TEXT,
    "egrand_total_cd_chinese" INTEGER,
    "egrand_total_cd_japanese" INTEGER,
    "egrand_total_cd_korean" INTEGER,
    "egrand_total_cd_noncjk" INTEGER,
    "egrand_total_cd_subtotal" INTEGER,
    "egrand_total_title_chinese" DOUBLE PRECISION,
    "egrand_total_title_japanese" DOUBLE PRECISION,
    "egrand_total_title_korean" DOUBLE PRECISION,
    "egrand_total_title_noncjk" DOUBLE PRECISION,
    "egrand_total_title_subtotal" DOUBLE PRECISION,
    "egrandtotal_memo" TEXT,
    "eindex_electronic_expenditure_chinese" DECIMAL(65,30),
    "eindex_electronic_expenditure_japanese" DECIMAL(65,30),
    "eindex_electronic_expenditure_korean" DECIMAL(65,30),
    "eindex_electronic_expenditure_noncjk" DECIMAL(65,30),
    "eindex_electronic_expenditure_subtotal" DECIMAL(65,30),
    "eindex_electronic_memo" TEXT,
    "eindex_electronic_title_chinese" DOUBLE PRECISION,
    "eindex_electronic_title_japanese" DOUBLE PRECISION,
    "eindex_electronic_title_korean" DOUBLE PRECISION,
    "eindex_electronic_title_noncjk" DOUBLE PRECISION,
    "eindex_electronic_title_subtotal" DOUBLE PRECISION,
    "enotes" TEXT,
    "eonetime_computer_cd_chinese" DOUBLE PRECISION,
    "eonetime_computer_cd_japanese" DOUBLE PRECISION,
    "eonetime_computer_cd_korean" DOUBLE PRECISION,
    "eonetime_computer_cd_noncjk" DOUBLE PRECISION,
    "eonetime_computer_cd_subtotal" DOUBLE PRECISION,
    "eonetime_computer_expenditure_chinese" DECIMAL(65,30),
    "eonetime_computer_expenditure_japanese" DECIMAL(65,30),
    "eonetime_computer_expenditure_korean" DECIMAL(65,30),
    "eonetime_computer_expenditure_noncjk" DECIMAL(65,30),
    "eonetime_computer_expenditure_subtotal" DECIMAL(65,30),
    "eonetime_computer_memo" TEXT,
    "eonetime_computer_title_chinese" DOUBLE PRECISION,
    "eonetime_computer_title_japanese" DOUBLE PRECISION,
    "eonetime_computer_title_korean" DOUBLE PRECISION,
    "eonetime_computer_title_noncjk" DOUBLE PRECISION,
    "eonetime_computer_title_subtotal" DOUBLE PRECISION,
    "eprevious_memo" TEXT,
    "eprevious_total_cd_chinese" DOUBLE PRECISION,
    "eprevious_total_cd_japanese" DOUBLE PRECISION,
    "eprevious_total_cd_korean" DOUBLE PRECISION,
    "eprevious_total_cd_noncjk" DOUBLE PRECISION,
    "eprevious_total_cd_subtotal" DOUBLE PRECISION,
    "eprevious_total_title_chinese" DOUBLE PRECISION,
    "eprevious_total_title_japanese" DOUBLE PRECISION,
    "eprevious_total_title_korean" DOUBLE PRECISION,
    "eprevious_total_title_noncjk" DOUBLE PRECISION,
    "eprevious_total_title_subtotal" DOUBLE PRECISION,
    "etotal_computer_cd_chinese" DOUBLE PRECISION,
    "etotal_computer_cd_japanese" DOUBLE PRECISION,
    "etotal_computer_cd_korean" DOUBLE PRECISION,
    "etotal_computer_cd_noncjk" DOUBLE PRECISION,
    "etotal_computer_cd_subtotal" DOUBLE PRECISION,
    "etotal_computer_expenditure_chinese" DOUBLE PRECISION,
    "etotal_computer_expenditure_japanese" DOUBLE PRECISION,
    "etotal_computer_expenditure_korean" DOUBLE PRECISION,
    "etotal_computer_expenditure_noncjk" DOUBLE PRECISION,
    "etotal_computer_expenditure_subtotal" DOUBLE PRECISION,
    "etotal_computer_memo" TEXT,
    "etotal_computer_title_chinese" DOUBLE PRECISION,
    "etotal_computer_title_japanese" DOUBLE PRECISION,
    "etotal_computer_title_korean" DOUBLE PRECISION,
    "etotal_computer_title_noncjk" DOUBLE PRECISION,
    "etotal_computer_title_subtotal" DOUBLE PRECISION,
    "etotal_electronic_expenditure_chinese" DECIMAL(65,30),
    "etotal_electronic_expenditure_japanese" DECIMAL(65,30),
    "etotal_electronic_expenditure_korean" DECIMAL(65,30),
    "etotal_electronic_expenditure_noncjk" DECIMAL(65,30),
    "etotal_electronic_expenditure_subtotal" DECIMAL(65,30),
    "etotal_electronic_memo" TEXT,
    "etotal_electronic_title_chinese" DOUBLE PRECISION,
    "etotal_electronic_title_japanese" DOUBLE PRECISION,
    "etotal_electronic_title_korean" DOUBLE PRECISION,
    "etotal_electronic_title_noncjk" DOUBLE PRECISION,
    "etotal_electronic_title_subtotal" DOUBLE PRECISION,
    "etotal_expenditure_grandtotal" DECIMAL(65,30),
    "etotal_expenditure_memo" TEXT,
    "etotal_expenditure_onetime" DECIMAL(65,30),
    "etotal_expenditure_ongoing" DECIMAL(65,30),

    CONSTRAINT "Electronic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Electronic_Books" (
    "id" SERIAL NOT NULL,
    "libraryyear" INTEGER,
    "ebooks_purchased_volumes_chinese" INTEGER,
    "ebooks_purchased_volumes_japanese" INTEGER,
    "ebooks_purchased_volumes_korean" INTEGER,
    "ebooks_purchased_volumes_noncjk" INTEGER,
    "ebooks_purchased_volumes_subtotal" INTEGER,
    "ebooks_purchased_titles_chinese" INTEGER,
    "ebooks_purchased_titles_japanese" INTEGER,
    "ebooks_purchased_titles_korean" INTEGER,
    "ebooks_purchased_titles_noncjk" INTEGER,
    "ebooks_purchased_titles_subtotal" INTEGER,
    "ebooks_nonpurchased_volumes_chinese" INTEGER,
    "ebooks_nonpurchased_volumes_japanese" INTEGER,
    "ebooks_nonpurchased_volumes_korean" INTEGER,
    "ebooks_nonpurchased_volumes_noncjk" INTEGER,
    "ebooks_nonpurchased_volumes_subtotal" INTEGER,
    "ebooks_nonpurchased_titles_chinese" INTEGER,
    "ebooks_nonpurchased_titles_japanese" INTEGER,
    "ebooks_nonpurchased_titles_korean" INTEGER,
    "ebooks_nonpurchased_titles_noncjk" INTEGER,
    "ebooks_nonpurchased_titles_subtotal" INTEGER,
    "ebooks_subscription_volumes_chinese" INTEGER,
    "ebooks_subscription_volumes_japanese" INTEGER,
    "ebooks_subscription_volumes_korean" INTEGER,
    "ebooks_subscription_volumes_noncjk" INTEGER,
    "ebooks_subscription_volumes_subtotal" INTEGER,
    "ebooks_subscription_titles_chinese" INTEGER,
    "ebooks_subscription_titles_japanese" INTEGER,
    "ebooks_subscription_titles_korean" INTEGER,
    "ebooks_subscription_titles_noncjk" INTEGER,
    "ebooks_subscription_titles_subtotal" INTEGER,
    "ebooks_total_volumes" INTEGER,
    "ebooks_total_titles" INTEGER,
    "ebooks_expenditure_grandtotal" DECIMAL(65,30),
    "ebooks_notes" TEXT,
    "ebooks_purchased_prev_titles_chinese" INTEGER,
    "ebooks_purchased_prev_titles_japanese" INTEGER,
    "ebooks_purchased_prev_titles_korean" INTEGER,
    "ebooks_purchased_prev_titles_noncjk" INTEGER,
    "ebooks_purchased_prev_titles_subtotal" INTEGER,
    "ebooks_purchased_add_titles_chinese" INTEGER,
    "ebooks_purchased_add_titles_japanese" INTEGER,
    "ebooks_purchased_add_titles_korean" INTEGER,
    "ebooks_purchased_add_titles_noncjk" INTEGER,
    "ebooks_purchased_add_titles_subtotal" INTEGER,
    "ebooks_purchased_prev_volumes_chinese" INTEGER,
    "ebooks_purchased_prev_volumes_japanese" INTEGER,
    "ebooks_purchased_prev_volumes_korean" INTEGER,
    "ebooks_purchased_prev_volumes_noncjk" INTEGER,
    "ebooks_purchased_prev_volumes_subtotal" INTEGER,
    "ebooks_purchased_add_volumes_chinese" INTEGER,
    "ebooks_purchased_add_volumes_japanese" INTEGER,
    "ebooks_purchased_add_volumes_korean" INTEGER,
    "ebooks_purchased_add_volumes_noncjk" INTEGER,
    "ebooks_purchased_add_volumes_subtotal" INTEGER,

    CONSTRAINT "Electronic_Books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entry_Status" (
    "id" SERIAL NOT NULL,
    "fiscal_support" BOOLEAN DEFAULT false,
    "monographic_acquisitions" BOOLEAN DEFAULT false,
    "other_holdings" BOOLEAN DEFAULT false,
    "participating_libraries_information" BOOLEAN DEFAULT false,
    "personnel_support_fte" BOOLEAN DEFAULT false,
    "public_services" BOOLEAN DEFAULT false,
    "serials" BOOLEAN DEFAULT false,
    "unprocessed_backlog_materials" BOOLEAN DEFAULT false,
    "volume_holdings" BOOLEAN DEFAULT false,
    "electronic" BOOLEAN DEFAULT false,
    "electronic_books" BOOLEAN DEFAULT false,
    "espublished" BOOLEAN NOT NULL DEFAULT false,
    "libraryyear" INTEGER,

    CONSTRAINT "Entry_Status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fiscal_Support" (
    "id" SERIAL NOT NULL,
    "entryid" TEXT,
    "fschinese_appropriations_monographic" DECIMAL(65,30),
    "fschinese_appropriations_serial" DECIMAL(65,30),
    "fschinese_appropriations_other_material" DECIMAL(65,30),
    "fschinese_appropriations_electronic" DECIMAL(65,30),
    "fschinese_appropriations_subtotal" DECIMAL(65,30),
    "fsjapanese_appropriations_monographic" DECIMAL(65,30),
    "fsjapanese_appropriations_serial" DECIMAL(65,30),
    "fsjapanese_appropriations_other_material" DECIMAL(65,30),
    "fsjapanese_appropriations_electronic" DECIMAL(65,30),
    "fsjapanese_appropriations_subtotal" DECIMAL(65,30),
    "fskorean_appropriations_monographic" DECIMAL(65,30),
    "fskorean_appropriations_serial" DECIMAL(65,30),
    "fskorean_appropriations_other_material" DECIMAL(65,30),
    "fskorean_appropriations_electronic" DECIMAL(65,30),
    "fskorean_appropriations_subtotal" DECIMAL(65,30),
    "fsnoncjk_appropriations_monographic" DECIMAL(65,30),
    "fsnoncjk_appropriations_serial" DECIMAL(65,30),
    "fsnoncjk_appropriations_other_material" DECIMAL(65,30),
    "fsnoncjk_appropriations_electronic" DECIMAL(65,30),
    "fsnoncjk_appropriations_subtotal" DECIMAL(65,30),
    "fstotal_appropriations" DECIMAL(65,30),
    "fsendowments_chinese" DECIMAL(65,30),
    "fsendowments_japanese" DECIMAL(65,30),
    "fsendowments_korean" DECIMAL(65,30),
    "fsendowments_subtotal" DECIMAL(65,30),
    "fsgrants_chinese" DECIMAL(65,30),
    "fsgrants_japanese" DECIMAL(65,30),
    "fsgrants_korean" DECIMAL(65,30),
    "fsgrants_subtotal" DECIMAL(65,30),
    "fseast_asian_program_support_chinese" DECIMAL(65,30),
    "fseast_asian_program_support_japanese" DECIMAL(65,30),
    "fseast_asian_program_support_korean" DECIMAL(65,30),
    "fseast_asian_program_support_subtotal" DECIMAL(65,30),
    "fstotal_acquisition_budget" DECIMAL(65,30),
    "fsnotes" TEXT,
    "libraryyear" INTEGER,
    "fsendowments_noncjk" DECIMAL(65,30),
    "fsgrants_noncjk" DECIMAL(65,30),
    "fseast_asian_program_support_noncjk" DECIMAL(65,30),

    CONSTRAINT "Fiscal_Support_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Library" (
    "id" SERIAL NOT NULL,
    "type" INTEGER NOT NULL,
    "library_name" TEXT NOT NULL,
    "plilaw" BOOLEAN NOT NULL,
    "plimed" BOOLEAN NOT NULL,
    "plisubmitter_first_name" TEXT,
    "plisubmitter_last_name" TEXT,
    "pliposition_title" TEXT,
    "pliwork_phone" TEXT,
    "plie_mail" TEXT NOT NULL,
    "plifax_number" TEXT,
    "pliinput_as_of_date" TIMESTAMP(3),
    "password" TEXT,
    "plibibliographic" TEXT,
    "pliconsortia" TEXT,
    "plisystem_vendor" TEXT,
    "pliopac" BOOLEAN,
    "plihome_page" TEXT,
    "plionline_catalog" TEXT,
    "pliunique" BOOLEAN,
    "pliestablishedyear" TEXT,
    "library_number" INTEGER NOT NULL,
    "pliregion" INTEGER,
    "collection_title" TEXT,
    "collection_incharge_title" TEXT,
    "collection_organized_under" TEXT,
    "collection_head_reports_to" TEXT,
    "collection_top_department" TEXT,
    "collection_next_position_title" TEXT,
    "collection_other_departments" TEXT,
    "collection_librarians_groups" TEXT,
    "collection_type" TEXT,
    "shelving_type" TEXT,
    "consultation_type" TEXT,
    "teaching_type" TEXT,
    "acquisition_type" TEXT,
    "cataloging_type" TEXT,
    "circulation_type" TEXT,
    "date_last_changed" TIMESTAMP(3),
    "notes" TEXT,
    "hideinlibrarylist" BOOLEAN,

    CONSTRAINT "Library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryYear_ListAV" (
    "libraryyear_id" INTEGER NOT NULL,
    "listav_id" INTEGER NOT NULL,

    CONSTRAINT "LibraryYear_ListAV_pkey" PRIMARY KEY ("libraryyear_id","listav_id")
);

-- CreateTable
CREATE TABLE "LibraryYear_ListEBook" (
    "libraryyear_id" INTEGER NOT NULL,
    "listebook_id" INTEGER NOT NULL,

    CONSTRAINT "LibraryYear_ListEBook_pkey" PRIMARY KEY ("libraryyear_id","listebook_id")
);

-- CreateTable
CREATE TABLE "LibraryYear_ListEJournal" (
    "libraryyear_id" INTEGER NOT NULL,
    "listejournal_id" INTEGER NOT NULL,

    CONSTRAINT "LibraryYear_ListEJournal_pkey" PRIMARY KEY ("libraryyear_id","listejournal_id")
);

-- CreateTable
CREATE TABLE "List_AV" (
    "id" SERIAL NOT NULL,
    "type" TEXT,
    "title" TEXT,
    "cjk_title" TEXT,
    "romanized_title" TEXT,
    "subtitle" TEXT,
    "publisher" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "data_source" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_global" BOOLEAN,
    "libraryyear" INTEGER,

    CONSTRAINT "List_AV_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "List_AV_Counts" (
    "id" SERIAL NOT NULL,
    "titles" INTEGER,
    "year" INTEGER,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "ishidden" BOOLEAN,
    "listav" INTEGER,

    CONSTRAINT "List_AV_Counts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "List_AV_Language" (
    "listav_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,

    CONSTRAINT "List_AV_Language_pkey" PRIMARY KEY ("listav_id","language_id")
);

-- CreateTable
CREATE TABLE "ListCustomOtherHoldings" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "ListCustomOtherHoldings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "List_EBook" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "sub_series_number" TEXT,
    "publisher" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "subtitle" TEXT,
    "cjk_title" TEXT,
    "romanized_title" TEXT,
    "data_source" TEXT,
    "is_global" BOOLEAN,
    "libraryyear" INTEGER,

    CONSTRAINT "List_EBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "List_EBook_Counts" (
    "id" SERIAL NOT NULL,
    "titles" INTEGER,
    "volumes" INTEGER,
    "year" INTEGER,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "chapters" INTEGER,
    "ishidden" BOOLEAN,
    "listebook" INTEGER,

    CONSTRAINT "List_EBook_Counts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "List_EBook_Language" (
    "listebook_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,

    CONSTRAINT "List_EBook_Language_pkey" PRIMARY KEY ("listebook_id","language_id")
);

-- CreateTable
CREATE TABLE "List_EJournal" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "sub_series_number" TEXT,
    "publisher" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "subtitle" TEXT,
    "series" TEXT,
    "vendor" TEXT,
    "cjk_title" TEXT,
    "romanized_title" TEXT,
    "data_source" TEXT,
    "is_global" BOOLEAN,
    "libraryyear" INTEGER,

    CONSTRAINT "List_EJournal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "List_EJournal_Counts" (
    "id" SERIAL NOT NULL,
    "journals" INTEGER,
    "dbs" INTEGER,
    "year" INTEGER,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "ishidden" BOOLEAN,
    "listejournal" INTEGER,

    CONSTRAINT "List_EJournal_Counts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "List_EJournal_Language" (
    "listejournal_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,

    CONSTRAINT "List_EJournal_Language_pkey" PRIMARY KEY ("listejournal_id","language_id")
);

-- CreateTable
CREATE TABLE "Monographic_Acquisitions" (
    "id" SERIAL NOT NULL,
    "entryid" TEXT,
    "mapurchased_titles_chinese" DOUBLE PRECISION,
    "mapurchased_titles_japanese" DOUBLE PRECISION,
    "mapurchased_titles_korean" DOUBLE PRECISION,
    "mapurchased_titles_noncjk" DOUBLE PRECISION,
    "mapurchased_titles_subtotal" DOUBLE PRECISION,
    "mapurchased_volumes_chinese" DOUBLE PRECISION,
    "mapurchased_volumes_japanese" DOUBLE PRECISION,
    "mapurchased_volumes_korean" DOUBLE PRECISION,
    "mapurchased_volumes_noncjk" DOUBLE PRECISION,
    "mapurchased_volumes_subtotal" DOUBLE PRECISION,
    "manonpurchased_titles_chinese" DOUBLE PRECISION,
    "manonpurchased_titles_japanese" DOUBLE PRECISION,
    "manonpurchased_titles_korean" DOUBLE PRECISION,
    "manonpurchased_titles_noncjk" DOUBLE PRECISION,
    "manonpurchased_titles_subtotal" DOUBLE PRECISION,
    "manonpurchased_volumes_chinese" DOUBLE PRECISION,
    "manonpurchased_volumes_japanese" DOUBLE PRECISION,
    "manonpurchased_volumes_korean" DOUBLE PRECISION,
    "manonpurchased_volumes_noncjk" DOUBLE PRECISION,
    "manonpurchased_volumes_subtotal" DOUBLE PRECISION,
    "matotal_titles" DOUBLE PRECISION,
    "matotal_volumes" DOUBLE PRECISION,
    "manotes" TEXT,
    "libraryyear" INTEGER,

    CONSTRAINT "Monographic_Acquisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Other_Holdings" (
    "id" SERIAL NOT NULL,
    "entryid" TEXT,
    "libraryyear" INTEGER,
    "ohaudio_chinese" DOUBLE PRECISION,
    "ohaudio_japanese" DOUBLE PRECISION,
    "ohaudio_korean" DOUBLE PRECISION,
    "ohaudio_noncjk" DOUBLE PRECISION,
    "ohaudio_subtotal" DOUBLE PRECISION,
    "ohcarto_graphic_chinese" DOUBLE PRECISION,
    "ohcarto_graphic_japanese" DOUBLE PRECISION,
    "ohcarto_graphic_korean" DOUBLE PRECISION,
    "ohcarto_graphic_noncjk" DOUBLE PRECISION,
    "ohcarto_graphic_subtotal" DOUBLE PRECISION,
    "ohcomputer_cd_chinese" DOUBLE PRECISION,
    "ohcomputer_cd_japanese" DOUBLE PRECISION,
    "ohcomputer_cd_korean" DOUBLE PRECISION,
    "ohcomputer_cd_noncjk" DOUBLE PRECISION,
    "ohcomputer_cd_subtotal" DOUBLE PRECISION,
    "ohcomputer_files_chinese" DOUBLE PRECISION,
    "ohcomputer_files_japanese" DOUBLE PRECISION,
    "ohcomputer_files_korean" DOUBLE PRECISION,
    "ohcomputer_files_noncjk" DOUBLE PRECISION,
    "ohcomputer_files_subtotal" DOUBLE PRECISION,
    "ohcustom1_label" TEXT,
    "ohcustom1chinese" DOUBLE PRECISION,
    "ohcustom1japanese" DOUBLE PRECISION,
    "ohcustom1korean" DOUBLE PRECISION,
    "ohcustom1noncjk" DOUBLE PRECISION,
    "ohcustom1subtotal" DOUBLE PRECISION,
    "ohcustom2_label" TEXT,
    "ohcustom2chinese" DOUBLE PRECISION,
    "ohcustom2japanese" DOUBLE PRECISION,
    "ohcustom2korean" DOUBLE PRECISION,
    "ohcustom2noncjk" DOUBLE PRECISION,
    "ohcustom2subtotal" DOUBLE PRECISION,
    "ohcustom3_label" TEXT,
    "ohcustom3chinese" DOUBLE PRECISION,
    "ohcustom3japanese" DOUBLE PRECISION,
    "ohcustom3korean" DOUBLE PRECISION,
    "ohcustom3noncjk" DOUBLE PRECISION,
    "ohcustom3subtotal" DOUBLE PRECISION,
    "ohcustom4_label" TEXT,
    "ohcustom4chinese" DOUBLE PRECISION,
    "ohcustom4japanese" DOUBLE PRECISION,
    "ohcustom4korean" DOUBLE PRECISION,
    "ohcustom4noncjk" DOUBLE PRECISION,
    "ohcustom4subtotal" DOUBLE PRECISION,
    "ohcustomsubtotal" DOUBLE PRECISION,
    "ohdvd_chinese" DOUBLE PRECISION,
    "ohdvd_japanese" DOUBLE PRECISION,
    "ohdvd_korean" DOUBLE PRECISION,
    "ohdvd_noncjk" DOUBLE PRECISION,
    "ohdvd_subtotal" DOUBLE PRECISION,
    "ohfilm_video_chinese" DOUBLE PRECISION,
    "ohfilm_video_japanese" DOUBLE PRECISION,
    "ohfilm_video_korean" DOUBLE PRECISION,
    "ohfilm_video_noncjk" DOUBLE PRECISION,
    "ohfilm_video_subtotal" DOUBLE PRECISION,
    "ohgrandtotal" DOUBLE PRECISION,
    "ohmicroform_chinese" DOUBLE PRECISION,
    "ohmicroform_japanese" DOUBLE PRECISION,
    "ohmicroform_korean" DOUBLE PRECISION,
    "ohmicroform_noncjk" DOUBLE PRECISION,
    "ohmicroform_subtotal" DOUBLE PRECISION,
    "ohnotes" TEXT,
    "ohonlineimagechinese" DOUBLE PRECISION,
    "ohonlineimagejapanese" DOUBLE PRECISION,
    "ohonlineimagekorean" DOUBLE PRECISION,
    "ohonlineimagenoncjk" DOUBLE PRECISION,
    "ohonlineimagesubtotal" DOUBLE PRECISION,
    "ohonlinemapchinese" DOUBLE PRECISION,
    "ohonlinemapjapanese" DOUBLE PRECISION,
    "ohonlinemapkorean" DOUBLE PRECISION,
    "ohonlinemapnoncjk" DOUBLE PRECISION,
    "ohonlinemapsubtotal" DOUBLE PRECISION,
    "ohotherchinese" DOUBLE PRECISION,
    "ohotherjapanese" DOUBLE PRECISION,
    "ohotherkorean" DOUBLE PRECISION,
    "ohothernoncjk" DOUBLE PRECISION,
    "ohothersubtotal" DOUBLE PRECISION,
    "ohstreamingchinese" DOUBLE PRECISION,
    "ohstreamingjapanese" DOUBLE PRECISION,
    "ohstreamingkorean" DOUBLE PRECISION,
    "ohstreamingnoncjk" DOUBLE PRECISION,
    "ohstreamingsubtotal" DOUBLE PRECISION,
    "ohstreamingvideochinese" DOUBLE PRECISION,
    "ohstreamingvideojapanese" DOUBLE PRECISION,
    "ohstreamingvideokorean" DOUBLE PRECISION,
    "ohstreamingvideononcjk" DOUBLE PRECISION,
    "ohstreamingvideosubtotal" DOUBLE PRECISION,

    CONSTRAINT "Other_Holdings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personnel_Support" (
    "id" SERIAL NOT NULL,
    "entryid" TEXT,
    "libraryyear" INTEGER,
    "psfnotes" TEXT,
    "psfosacquisition" BOOLEAN,
    "psfosprocessing" BOOLEAN,
    "psfothers" DOUBLE PRECISION,
    "psfprofessional_chinese" DOUBLE PRECISION,
    "psfprofessional_eastasian" DOUBLE PRECISION,
    "psfprofessional_japanese" DOUBLE PRECISION,
    "psfprofessional_korean" DOUBLE PRECISION,
    "psfprofessional_subtotal" DOUBLE PRECISION,
    "psfstudent_assistants_chinese" DOUBLE PRECISION,
    "psfstudent_assistants_eastasian" DOUBLE PRECISION,
    "psfstudent_assistants_japanese" DOUBLE PRECISION,
    "psfstudent_assistants_korean" DOUBLE PRECISION,
    "psfstudent_assistants_subtotal" DOUBLE PRECISION,
    "psfsupport_staff_chinese" DOUBLE PRECISION,
    "psfsupport_staff_eastasian" DOUBLE PRECISION,
    "psfsupport_staff_japanese" DOUBLE PRECISION,
    "psfsupport_staff_korean" DOUBLE PRECISION,
    "psfsupport_staff_subtotal" DOUBLE PRECISION,
    "psftotal" DOUBLE PRECISION,

    CONSTRAINT "Personnel_Support_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exclude_Year" (
    "exyear" INTEGER NOT NULL,

    CONSTRAINT "Exclude_Year_pkey" PRIMARY KEY ("exyear")
);

-- CreateTable
CREATE TABLE "Reflibrarytype" (
    "id" SERIAL NOT NULL,
    "librarytype" TEXT NOT NULL,

    CONSTRAINT "Reflibrarytype_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reflibraryregion" (
    "id" SERIAL NOT NULL,
    "libraryregion" TEXT NOT NULL,

    CONSTRAINT "Reflibraryregion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" SERIAL NOT NULL,
    "short" TEXT NOT NULL,
    "full" TEXT NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Library_Year" (
    "id" SERIAL NOT NULL,
    "library" INTEGER,
    "is_open_for_editing" BOOLEAN DEFAULT false,
    "admin_notes" TEXT,
    "year" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,

    CONSTRAINT "Library_Year_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "lastlogin_at" TIMESTAMP(3),
    "firstname" TEXT,
    "lastname" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_Library" (
    "user_id" INTEGER NOT NULL,
    "library_id" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users_Roles" (
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Serials" (
    "id" SERIAL NOT NULL,
    "entryid" TEXT,
    "spurchased_chinese" DOUBLE PRECISION,
    "spurchased_japanese" DOUBLE PRECISION,
    "spurchased_korean" DOUBLE PRECISION,
    "spurchased_noncjk" DOUBLE PRECISION,
    "spurchased_subtotal" DOUBLE PRECISION,
    "snonpurchased_chinese" DOUBLE PRECISION,
    "snonpurchased_japanese" DOUBLE PRECISION,
    "snonpurchased_korean" DOUBLE PRECISION,
    "snonpurchased_noncjk" DOUBLE PRECISION,
    "snonpurchased_subtotal" DOUBLE PRECISION,
    "stotal_chinese" DOUBLE PRECISION,
    "stotal_japanese" DOUBLE PRECISION,
    "stotal_korean" DOUBLE PRECISION,
    "stotal_noncjk" DOUBLE PRECISION,
    "s_epurchased_chinese" DOUBLE PRECISION,
    "s_epurchased_japanese" DOUBLE PRECISION,
    "s_epurchased_korean" DOUBLE PRECISION,
    "s_epurchased_noncjk" DOUBLE PRECISION,
    "s_epurchased_subtotal" DOUBLE PRECISION,
    "s_enonpurchased_chinese" DOUBLE PRECISION,
    "s_enonpurchased_japanese" DOUBLE PRECISION,
    "s_enonpurchased_korean" DOUBLE PRECISION,
    "s_enonpurchased_noncjk" DOUBLE PRECISION,
    "s_enonpurchased_subtotal" DOUBLE PRECISION,
    "s_etotal_chinese" DOUBLE PRECISION,
    "s_etotal_japanese" DOUBLE PRECISION,
    "s_etotal_korean" DOUBLE PRECISION,
    "s_etotal_noncjk" DOUBLE PRECISION,
    "speriodical_cur_chinese" DOUBLE PRECISION,
    "speriodical_cur_japanese" DOUBLE PRECISION,
    "speriodical_cur_korean" DOUBLE PRECISION,
    "speriodical_ncur_chinese" DOUBLE PRECISION,
    "speriodical_ncur_japanese" DOUBLE PRECISION,
    "speriodical_ncur_korean" DOUBLE PRECISION,
    "speriodical_subtotal_chinese" DOUBLE PRECISION,
    "speriodical_subtotal_japanese" DOUBLE PRECISION,
    "speriodical_subtotal_korean" DOUBLE PRECISION,
    "speriodical_subtotal" DOUBLE PRECISION,
    "snewspaper_cur_chinese" DOUBLE PRECISION,
    "snewspaper_cur_japanese" DOUBLE PRECISION,
    "snewspaper_cur_korean" DOUBLE PRECISION,
    "snewspaper_ncur_chinese" DOUBLE PRECISION,
    "snewspaper_ncur_japanese" DOUBLE PRECISION,
    "snewspaper_ncur_korean" DOUBLE PRECISION,
    "snewspaper_subtotal_chinese" DOUBLE PRECISION,
    "snewspaper_subtotal_japanese" DOUBLE PRECISION,
    "snewspaper_subtotal_korean" DOUBLE PRECISION,
    "snewspaper_subtotal" DOUBLE PRECISION,
    "sgrandtotal" DOUBLE PRECISION,
    "s_egrandtotal" DOUBLE PRECISION,
    "snotes" TEXT,
    "libraryyear" INTEGER,

    CONSTRAINT "Serials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Volume_Holdings" (
    "id" SERIAL NOT NULL,
    "entryid" TEXT,
    "vhprevious_year_chinese" DOUBLE PRECISION,
    "vhprevious_year_japanese" DOUBLE PRECISION,
    "vhprevious_year_korean" DOUBLE PRECISION,
    "vhprevious_year_noncjk" DOUBLE PRECISION,
    "vhprevious_year_subtotal" DOUBLE PRECISION,
    "vhadded_gross_chinese" DOUBLE PRECISION,
    "vhadded_gross_japanese" DOUBLE PRECISION,
    "vhadded_gross_korean" DOUBLE PRECISION,
    "vhadded_gross_noncjk" DOUBLE PRECISION,
    "vhadded_gross_subtotal" DOUBLE PRECISION,
    "vhwithdrawn_chinese" DOUBLE PRECISION,
    "vhwithdrawn_japanese" DOUBLE PRECISION,
    "vhwithdrawn_korean" DOUBLE PRECISION,
    "vhwithdrawn_noncjk" DOUBLE PRECISION,
    "vhwithdrawn_subtotal" DOUBLE PRECISION,
    "vh_film_chinese" DOUBLE PRECISION,
    "vh_film_japanese" DOUBLE PRECISION,
    "vh_film_korean" DOUBLE PRECISION,
    "vh_film_subtotal" DOUBLE PRECISION,
    "vh_fiche_chinese" DOUBLE PRECISION,
    "vh_fiche_japanese" DOUBLE PRECISION,
    "vh_fiche_korean" DOUBLE PRECISION,
    "vh_fiche_subtotal" DOUBLE PRECISION,
    "vh_film_fiche_chinese" DOUBLE PRECISION,
    "vh_film_fiche_japanese" DOUBLE PRECISION,
    "vh_film_fiche_korean" DOUBLE PRECISION,
    "vh_film_fiche_subtotal" DOUBLE PRECISION,
    "vhgrandtotal" DOUBLE PRECISION,
    "vhnotes" TEXT,
    "libraryyear" INTEGER,

    CONSTRAINT "Volume_Holdings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Electronic_libraryyear_key" ON "Electronic"("libraryyear");

-- CreateIndex
CREATE UNIQUE INDEX "Electronic_Books_libraryyear_key" ON "Electronic_Books"("libraryyear");

-- CreateIndex
CREATE UNIQUE INDEX "Entry_Status_libraryyear_key" ON "Entry_Status"("libraryyear");

-- CreateIndex
CREATE UNIQUE INDEX "Fiscal_Support_libraryyear_key" ON "Fiscal_Support"("libraryyear");

-- CreateIndex
CREATE UNIQUE INDEX "List_AV_Counts_listav_key" ON "List_AV_Counts"("listav");

-- CreateIndex
CREATE UNIQUE INDEX "Monographic_Acquisitions_libraryyear_key" ON "Monographic_Acquisitions"("libraryyear");

-- CreateIndex
CREATE UNIQUE INDEX "Other_Holdings_libraryyear_key" ON "Other_Holdings"("libraryyear");

-- CreateIndex
CREATE UNIQUE INDEX "Personnel_Support_libraryyear_key" ON "Personnel_Support"("libraryyear");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_Library_user_id_library_id_key" ON "User_Library"("user_id", "library_id");

-- CreateIndex
CREATE UNIQUE INDEX "Users_Roles_user_id_role_id_key" ON "Users_Roles"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "Serials_libraryyear_key" ON "Serials"("libraryyear");

-- CreateIndex
CREATE UNIQUE INDEX "Volume_Holdings_libraryyear_key" ON "Volume_Holdings"("libraryyear");

-- AddForeignKey
ALTER TABLE "Electronic" ADD CONSTRAINT "Electronic_libraryyear_fkey" FOREIGN KEY ("libraryyear") REFERENCES "Library_Year"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Electronic_Books" ADD CONSTRAINT "Electronic_Books_libraryyear_fkey" FOREIGN KEY ("libraryyear") REFERENCES "Library_Year"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry_Status" ADD CONSTRAINT "Entry_Status_libraryyear_fkey" FOREIGN KEY ("libraryyear") REFERENCES "Library_Year"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fiscal_Support" ADD CONSTRAINT "Fiscal_Support_libraryyear_fkey" FOREIGN KEY ("libraryyear") REFERENCES "Library_Year"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Library" ADD CONSTRAINT "Library_pliregion_fkey" FOREIGN KEY ("pliregion") REFERENCES "Reflibraryregion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Library" ADD CONSTRAINT "Library_type_fkey" FOREIGN KEY ("type") REFERENCES "Reflibrarytype"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryYear_ListAV" ADD CONSTRAINT "LibraryYear_ListAV_libraryyear_id_fkey" FOREIGN KEY ("libraryyear_id") REFERENCES "Library_Year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryYear_ListAV" ADD CONSTRAINT "LibraryYear_ListAV_listav_id_fkey" FOREIGN KEY ("listav_id") REFERENCES "List_AV"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryYear_ListEBook" ADD CONSTRAINT "LibraryYear_ListEBook_libraryyear_id_fkey" FOREIGN KEY ("libraryyear_id") REFERENCES "Library_Year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryYear_ListEBook" ADD CONSTRAINT "LibraryYear_ListEBook_listebook_id_fkey" FOREIGN KEY ("listebook_id") REFERENCES "List_EBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryYear_ListEJournal" ADD CONSTRAINT "LibraryYear_ListEJournal_libraryyear_id_fkey" FOREIGN KEY ("libraryyear_id") REFERENCES "Library_Year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryYear_ListEJournal" ADD CONSTRAINT "LibraryYear_ListEJournal_listejournal_id_fkey" FOREIGN KEY ("listejournal_id") REFERENCES "List_EJournal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List_AV" ADD CONSTRAINT "List_AV_libraryyear_fkey" FOREIGN KEY ("libraryyear") REFERENCES "Library_Year"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List_AV_Counts" ADD CONSTRAINT "List_AV_Counts_listav_fkey" FOREIGN KEY ("listav") REFERENCES "List_AV"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List_AV_Language" ADD CONSTRAINT "List_AV_Language_listav_id_fkey" FOREIGN KEY ("listav_id") REFERENCES "List_AV"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List_AV_Language" ADD CONSTRAINT "List_AV_Language_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List_EBook" ADD CONSTRAINT "List_EBook_libraryyear_fkey" FOREIGN KEY ("libraryyear") REFERENCES "Library_Year"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List_EBook_Counts" ADD CONSTRAINT "List_EBook_Counts_listebook_fkey" FOREIGN KEY ("listebook") REFERENCES "List_EBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List_EBook_Language" ADD CONSTRAINT "List_EBook_Language_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List_EBook_Language" ADD CONSTRAINT "List_EBook_Language_listebook_id_fkey" FOREIGN KEY ("listebook_id") REFERENCES "List_EBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List_EJournal" ADD CONSTRAINT "List_EJournal_libraryyear_fkey" FOREIGN KEY ("libraryyear") REFERENCES "Library_Year"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List_EJournal_Counts" ADD CONSTRAINT "List_EJournal_Counts_listejournal_fkey" FOREIGN KEY ("listejournal") REFERENCES "List_EJournal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List_EJournal_Language" ADD CONSTRAINT "List_EJournal_Language_listejournal_id_fkey" FOREIGN KEY ("listejournal_id") REFERENCES "List_EJournal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List_EJournal_Language" ADD CONSTRAINT "List_EJournal_Language_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Monographic_Acquisitions" ADD CONSTRAINT "Monographic_Acquisitions_libraryyear_fkey" FOREIGN KEY ("libraryyear") REFERENCES "Library_Year"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Other_Holdings" ADD CONSTRAINT "Other_Holdings_libraryyear_fkey" FOREIGN KEY ("libraryyear") REFERENCES "Library_Year"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personnel_Support" ADD CONSTRAINT "Personnel_Support_libraryyear_fkey" FOREIGN KEY ("libraryyear") REFERENCES "Library_Year"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Library_Year" ADD CONSTRAINT "Library_Year_library_fkey" FOREIGN KEY ("library") REFERENCES "Library"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Library" ADD CONSTRAINT "User_Library_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Library" ADD CONSTRAINT "User_Library_library_id_fkey" FOREIGN KEY ("library_id") REFERENCES "Library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users_Roles" ADD CONSTRAINT "Users_Roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users_Roles" ADD CONSTRAINT "Users_Roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Serials" ADD CONSTRAINT "Serials_libraryyear_fkey" FOREIGN KEY ("libraryyear") REFERENCES "Library_Year"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Volume_Holdings" ADD CONSTRAINT "Volume_Holdings_libraryyear_fkey" FOREIGN KEY ("libraryyear") REFERENCES "Library_Year"("id") ON DELETE SET NULL ON UPDATE CASCADE;
