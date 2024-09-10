import db from "@/lib/db";
import { redirect } from "next/navigation";

import DatePickerDemos from "@/components/DatePicker";
import { Container } from "@/components/Container";

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
       <h1 className='text-base font-semibold learning-7 text-gray-900'>
            Create a library
          </h1>
      <Container>
      <form action={createLibrary} className="bg-gray-100 rounded-lg pb-8">
        <div className='space-y-12'>
          {/* Library Create General Information */}         

          <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mx-10'>
            {/* Starting from Here*/}
            {/* Library Name */}
            <div className='sm:col-span-4'>
              <label
                htmlFor='libraryName'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Library Name
              </label>
              <div className='mt-2'>
                <div className='flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md'>
                  <input
                    id='libraryName'
                    name='libraryName'
                    type='text'
                    placeholder='Please input your library full name'
                    autoComplete='libraryName'
                    className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  />
                </div>
              </div>
            </div>
            {/* Hide in library listing */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='hideInLibraryListing'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Hide in library Listing?
              </label>
              <div className='mt-2'>
                <select
                  id='hideInLibraryListing'
                  name='hideInLibraryListing'
                  autoComplete='hideInLibraryListing-choose'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
            </div>
            {/* Library Type */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='libraryType'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Library Type
              </label>
              <div className='mt-2'>
                <select
                  id='libraryType'
                  name='libraryType'
                  autoComplete='libraryType-name'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                >
                  <option>Canadian University</option>
                  <option>U.S. Non-University</option>
                  <option>Private U.S. University</option>
                  <option>Public U.S. University</option>
                  <option>Canadian Non-University</option>
                </select>
              </div>
            </div>
            {/* Library Region */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='libraryRegion'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Library Region
              </label>
              <div className='mt-2'>
                <select
                  id='libraryRegion'
                  name='libraryRegion'
                  autoComplete='libraryRegion-name'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                >
                  <option>New England</option>
                  <option>Middle Atlantic</option>
                  <option>East North Central</option>
                  <option>West North Central</option>
                  <option>South Atlantic</option>
                  <option>East South Central</option>
                  <option>West South Central</option>
                  <option>Mountain</option>
                  <option>Pacific</option>
                  <option>Canada</option>
                  <option>Mexico</option>
                </select>
              </div>
            </div>
            <div className='sm:col-span-3' /> {/* Placeholder */}
            {/* Submitted By */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='first-name'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Submitted By: first name
              </label>
              <div className='mt-2'>
                <input
                  id='first-name'
                  name='first-name'
                  type='text'
                  autoComplete='given-name'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>
            <div className='sm:col-span-3'>
              <label
                htmlFor='last-name'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Submitted by: last name
              </label>
              <div className='mt-2'>
                <input
                  id='last-name'
                  name='last-name'
                  type='text'
                  autoComplete='family-name'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>
            {/* Title */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='title'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Title
              </label>
              <div className='mt-2'>
                <input
                  id='title'
                  name='title'
                  type='text'
                  autoComplete='title'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>
            {/* Phone */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='phone'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Phone
              </label>
              <div className='mt-2'>
                <input
                  id='phone'
                  name='phone'
                  type='text'
                  autoComplete='phone'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>
            {/* Email */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='email'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Email address
              </label>
              <div className='mt-2'>
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>
            {/* Fax */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='fax'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Fax
              </label>
              <div className='mt-2'>
                <input
                  id='fax'
                  name='fax'
                  type='text'
                  autoComplete='fax'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>
            {/* Library Home Page */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='libraryHomePage'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Library Home Page
              </label>
              <div className='mt-2'>
                <input
                  id='libraryHomePage'
                  name='libraryHomePage'
                  type='text'
                  autoComplete='libraryHomePage'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>
            {/* Library Online Catalogue */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='libraryOnlineCatalogue'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Library Online Catalogue
              </label>
              <div className='mt-2'>
                <input
                  id='libraryOnlineCatalogue'
                  name='libraryOnlineCatalogue'
                  type='text'
                  autoComplete='libraryOnlineCatalogue'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>
            {/* Bibliographic Unitilies */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='bibliographicUtilities'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Bibiliographic Utilities
              </label>
              <div className='mt-2'>
                <input
                  id='bibliographicUtilities'
                  name='bibliographicUtilities'
                  type='text'
                  autoComplete='bibliographicUtilities'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>
            {/* Networks or Consortia */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='networksConsortia'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Networks or Consortia
              </label>
              <div className='mt-2'>
                <input
                  id='networksConsortia'
                  name='networksConsortia'
                  type='text'
                  autoComplete='networksConsortia'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>
            {/* Integrated System Vendor */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='integratedSystemVendor'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Integrated System Vendor
              </label>
              <div className='mt-2'>
                <input
                  id='integratedSystemVendor'
                  name='integratedSystemVendor'
                  type='text'
                  autoComplete='integratedSystemVendor'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>
            {/* OPAC Capability of CJK Display */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='OPACCJK'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                OPAC Capability of CJK Display
              </label>
              <div className='mt-2'>
                <select
                  id='OPACCJK'
                  name='OPACCJK'
                  autoComplete='OPACCJK-name'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
            </div>
            {/* Established at (4-digit year) */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='establishedAt'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Established at (4-digit year)
              </label>
              <div className='mt-2'>
                <input
                  id='establishedAt'
                  name='establishedAt'
                  type='text'
                  autoComplete='establishedAt'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>
            {/* Law */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='law'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Law
              </label>
              <div className='mt-2'>
                <select
                  id='law'
                  name='law'
                  autoComplete='law-name'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
            </div>
            {/* Medical */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='medical'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Medical
              </label>
              <div className='mt-2'>
                <select
                  id='medical'
                  name='medical'
                  autoComplete='medical-name'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
            </div>
          </div>

          {/* *********************** */}
          {/* Institutional Structure of Your East Asian Collection */}
          {/* *********************** */}
          <h1 className='text-base font-semibold learning-7 text-gray-900'>
            Institutional Structure of Your East Asian Collection
          </h1>
          <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mx-10'>
            {/* Full title of East Asian Collection */}
            <div className='sm:col-span-6'>
              <label
                htmlFor='full-title-of-east-asian-collection'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Full title of East Asian collection
              </label>
              <div className='mt-2'>
                <input
                  id='full-title-of-east-asian-collection'
                  name='full-title-of-east-asian-collection'
                  type='text'
                  autoComplete=''
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>

            {/* Collection Administration */}
            <h2 className='text-base font-semibold learning-7 text-gray-900 sm:col-span-6'>
              Collection Administration
            </h2>
            {/* Position title in charge of the east asian collection */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='position-title-in-charge-of-the-east-asian-collection'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Position title in charge of the East Asian collection
              </label>
              <div className='mt-2'>
                <input
                  id='position-title-in-charge-of-the-east-asian-collection'
                  name='position-title-in-charge-of-the-east-asian-collection'
                  type='text'
                  autoComplete=''
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>
            {/* Head of E.Asian collection reports to what position title */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='head-of-easian-collection-reports-to-what-position'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Head of E.Asian collection reports to what position title
              </label>
              <div className='mt-2'>
                <input
                  id='head-of-easian-collection-reports-to-what-position'
                  name='head-of-easian-collection-reports-to-what-position'
                  type='text'
                  autoComplete=''
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>
            {/* Collection organized under what department/unit? */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='collection-organized-under-what-department-unit'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Collection organized under what department/unit?
              </label>
              <div className='mt-2'>
                <input
                  id='collection-organized-under-what-department-unit'
                  name='collection-organized-under-what-department-unit'
                  type='text'
                  autoComplete=''
                  placeholder='e.g. International Collections'
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>
            {/* The top hierarchy department/unit the collection is under (if it is different than previous) */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='the-top-hierarchy-department'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                The top hierarchy department/unit the collection is under (if it
                is different than previous)
              </label>
              <div className='mt-2'>
                <input
                  id='the-top-hierarchy-department'
                  name='the-top-hierarchy-department'
                  type='text'
                  autoComplete=''
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>
            {/* Except the Univ. Librarian (or the Dean of the Libraries), the title of the next highest position the collection is under */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='except-the-univ-librarian'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Except the Univ. Librarian (or the Dean of the Libraries), the
                title of the next highest position the collection is under
              </label>
              <div className='mt-2'>
                <input
                  id='except-the-univ-librarian'
                  name='except-the-univ-librarian'
                  type='text'
                  autoComplete=''
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>
            {/* East Asian collection is associated with which other departments/units? */}
            <div className='sm: col-span-3'>
              <label
                htmlFor='east-asian-collection-associated'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                East Asian collection is associated with which other
                departments/units?
              </label>
              <div className='mt-2'>
                <textarea
                  id='east-asian-collection-associated'
                  name='east-asian-collection-associated'
                  rows={3}
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  defaultValue={""}
                />
              </div>
              <p className='mt-3 text-sm leading-6 text-gray-400'>
                (e.g. Research and Learning Division, Collection Development,
                etc.)
              </p>
            </div>
            {/* East Asian librarian(s) are a part of which of the following group(s) */}

            <div className='mt-10 space-y-10 sm: col-span-6'>
              <fieldset>
                <legend className='text-sm font-medium leading-6'>
                  East Asian librarian(s) are a part of which of the following
                  group(s)
                </legend>
                <div className='mt-6 space-y-6'>
                  <div className='relative flex gap-x-3'>
                    <div className='flex h-6 items-center'>
                      <input
                        id='international-global-studies'
                        name='international-global-studies'
                        type='checkbox'
                        className='h-4 w-4 rounded order-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      />
                    </div>
                    <div className='text-sm leading-6'>
                      <label
                        htmlFor='international-global-studies'
                        className='font-medium'
                      >
                        International/global studies
                      </label>
                    </div>
                  </div>
                  <div className='relative flex gap-x-3'>
                    <div className='flex h-6 items-center'>
                      <input
                        id='subject-librarian-consultant-group'
                        name='subject-librarian-consultant-group'
                        type='checkbox'
                        className='h-4 w-4 rounded order-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      />
                    </div>
                    <div className='text-sm leading-6'>
                      <label
                        htmlFor='subject-librarian-consultant-group'
                        className='font-medium'
                      >
                        Subject librarian/consultant group
                      </label>
                    </div>
                  </div>
                  <div className='relative flex gap-x-3'>
                    <div className='flex h-6 items-center'>
                      <input
                        id='collection-development'
                        name='collection-development'
                        type='checkbox'
                        className='h-4 w-4 rounded order-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      />
                    </div>
                    <div className='text-sm leading-6'>
                      <label
                        htmlFor='collection-development'
                        className='font-medium'
                      >
                        Collection development
                      </label>
                    </div>
                  </div>
                  <div className='relative flex gap-x-3'>
                    <div className='flex h-6 items-center'>
                      <input
                        id='research-and-learning-group'
                        name='research-and-learning-group'
                        type='checkbox'
                        className='h-4 w-4 rounded order-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      />
                    </div>
                    <div className='text-sm leading-6'>
                      <label
                        htmlFor='research-and-learning-group'
                        className='font-medium'
                      >
                        Research and learning group
                      </label>
                    </div>
                  </div>
                  <div className='relative flex gap-x-3'>
                    <div className='flex h-6 items-center'>
                      <input
                        id='technical-processing-group'
                        name='technical-processing-group'
                        type='checkbox'
                        className='h-4 w-4 rounded order-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      />
                    </div>
                    <div className='text-sm leading-6'>
                      <label
                        htmlFor='technical-processing-group'
                        className='font-medium'
                      >
                        Technical processing group
                      </label>
                    </div>
                  </div>
                  <div className='relative flex gap-x-3'>
                    <div className='flex h-6 items-center'>
                      <input
                        id='public-services-group'
                        name='public-services-group'
                        type='checkbox'
                        className='h-4 w-4 rounded order-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      />
                    </div>
                    <div className='text-sm leading-6'>
                      <label
                        htmlFor='public-services-group'
                        className='font-medium'
                      >
                        Public services group
                      </label>
                    </div>
                  </div>
                  <div className='relative flex gap-x-3'>
                    <div className='flex h-6 items-center'>
                      <input
                        id='special-collections-group'
                        name='special-collections-group'
                        type='checkbox'
                        className='h-4 w-4 rounded order-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      />
                    </div>
                    <div className='text-sm leading-6'>
                      <label
                        htmlFor='special-collections-group'
                        className='font-medium'
                      >
                        Special collections group
                      </label>
                    </div>
                  </div>
                  <div className='relative flex gap-x-3'>
                    <div className='flex h-6 items-center'>
                      <input
                        id='other-in-notes'
                        name='other-in-notes'
                        type='checkbox'
                        className='h-4 w-4 rounded order-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      />
                    </div>
                    <div className='text-sm leading-6'>
                      <label htmlFor='other-in-notes' className='font-medium'>
                        Other (input additional information in "Notes" box at
                        the end of this form)
                      </label>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>

          {/* *********************** */}
          {/* Collection Buildiing and Services */}
          {/* *********************** */}
          <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mx-10'>
            <h2 className='text-base font-semibold learning-7 text-gray-900 sm:col-span-6'>
              Collection Building and Services
            </h2>
            {/* Collection physical location */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='collection-physical-location'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Collection physical location
              </label>
              <div className='mt-2'>
                <select
                  id='collection-physical-location'
                  name='collection-physical-location'
                  autoComplete=''
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                >
                  <option>- Select -</option>
                  <option>
                    Stand-alone E.Asian library/collection building
                  </option>
                  <option>
                    Seperate E.Asian collection within a library building
                  </option>
                  <option>
                    Seperate E.Asian collection with some parts interfiled with
                    other collections (by subject, call number block, size,
                    etc.)
                  </option>
                  <option>
                    East Asian collection completely interfiled with main
                    library collection
                  </option>
                  <option>
                    Other (Add additional information in "Notes" box at the end
                    of this form.)
                  </option>
                </select>
              </div>
            </div>

            {/* CJK Languages (shelving) */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='cjk-languages-shelving'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                CJK Languages (shelving)
              </label>
              <div className='mt-2'>
                <select
                  id='cjk-languages-shelving'
                  name='cjk-languages-shelving'
                  autoComplete=''
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                >
                  <option>- Select -</option>
                  <option>intefiled, no Western language texts</option>
                  <option>interfiled, includes Western language texts</option>
                  <option>
                    CJK shelved separately, no Western langauge texts
                  </option>
                  <option>
                    CJK shelved separately, includes Western language texts
                  </option>
                  <option>
                    Other (Add additional information in "Notes" box at the end
                    of this form.)
                  </option>
                </select>
              </div>
            </div>

            {/* Reference/Consultation */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='reference-consultation'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Reference/Consultation
              </label>
              <div className='mt-2'>
                <select
                  id='reference-consultation'
                  name='reference-consultation'
                  autoComplete=''
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                >
                  <option>- Select -</option>
                  <option>On Site</option>
                  <option>Centralized</option>
                </select>
              </div>
            </div>

            {/* Teaching and Learning */}
            <div className='sm:col-span-3'>
              <label
                htmlFor='teaching-and-learning'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Teaching and Learning
              </label>
              <div className='mt-2'>
                <select
                  id='teaching-and-learning'
                  name='teaching-and-learning'
                  autoComplete=''
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                >
                  <option>- Select -</option>
                  <option>EA Appt</option>
                  <option>Centralized</option>
                </select>
              </div>
            </div>

            {/* Acquisition Ordering and Receiving */}
            <div className='space-y-10 sm: col-span-6'>
              <fieldset>
                <legend className='text-sm font-medium leading-6'>
                  Acquisitions (Order and Receiving)
                </legend>
                <div className='mt-6 space-y-6'>
                  <div className='relative flex gap-x-3'>
                    <div className='flex h-6 items-center'>
                      <input
                        id='on-site'
                        name='on-site'
                        type='checkbox'
                        className='h-4 w-4 rounded order-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      />
                    </div>
                    <div className='text-sm leading-6'>
                      <label htmlFor='on-site' className='font-medium'>
                        On Site
                      </label>
                    </div>
                  </div>
                  <div className='relative flex gap-x-3'>
                    <div className='flex h-6 items-center'>
                      <input
                        id='centralized'
                        name='centralized'
                        type='checkbox'
                        className='h-4 w-4 rounded order-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      />
                    </div>
                    <div className='text-sm leading-6'>
                      <label htmlFor='centralized' className='font-medium'>
                        Centralized
                      </label>
                    </div>
                  </div>
                  <div className='relative flex gap-x-3'>
                    <div className='flex h-6 items-center'>
                      <input
                        id='out-sourced'
                        name='out-sourced'
                        type='checkbox'
                        className='h-4 w-4 rounded order-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      />
                    </div>
                    <div className='text-sm leading-6'>
                      <label htmlFor='out-sourced' className='font-medium'>
                        Out-sourced
                      </label>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>

            {/* Cataloging and Processing */}
            <div className='space-y-10 sm: col-span-6'>
              <fieldset>
                <legend className='text-sm font-medium leading-6'>
                  Cataloging and Processing
                </legend>
                <div className='mt-6 space-y-6'>
                  <div className='relative flex gap-x-3'>
                    <div className='flex h-6 items-center'>
                      <input
                        id='on-site'
                        name='on-site'
                        type='checkbox'
                        className='h-4 w-4 rounded order-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      />
                    </div>
                    <div className='text-sm leading-6'>
                      <label htmlFor='on-site' className='font-medium'>
                        On Site
                      </label>
                    </div>
                  </div>
                  <div className='relative flex gap-x-3'>
                    <div className='flex h-6 items-center'>
                      <input
                        id='centralized'
                        name='centralized'
                        type='checkbox'
                        className='h-4 w-4 rounded order-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      />
                    </div>
                    <div className='text-sm leading-6'>
                      <label htmlFor='centralized' className='font-medium'>
                        Centralized
                      </label>
                    </div>
                  </div>
                  <div className='relative flex gap-x-3'>
                    <div className='flex h-6 items-center'>
                      <input
                        id='out-sourced'
                        name='out-sourced'
                        type='checkbox'
                        className='h-4 w-4 rounded order-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      />
                    </div>
                    <div className='text-sm leading-6'>
                      <label htmlFor='out-sourced' className='font-medium'>
                        Out-sourced
                      </label>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>

            {/* Circulation */}
            <div className='space-y-10 sm: col-span-6 border-b'>
              <fieldset>
                <legend className='text-sm font-medium leading-6'>
                  Circulation
                </legend>
                <div className='mt-6 space-y-6'>
                  <div className='relative flex gap-x-3'>
                    <div className='flex h-6 items-center'>
                      <input
                        id='on-site'
                        name='on-site'
                        type='checkbox'
                        className='h-4 w-4 rounded order-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      />
                    </div>
                    <div className='text-sm leading-6'>
                      <label htmlFor='on-site' className='font-medium'>
                        On Site
                      </label>
                    </div>
                  </div>
                  <div className='relative flex gap-x-3'>
                    <div className='flex h-6 items-center'>
                      <input
                        id='centralized'
                        name='centralized'
                        type='checkbox'
                        className='h-4 w-4 rounded order-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      />
                    </div>
                    <div className='text-sm leading-6'>
                      <label htmlFor='centralized' className='font-medium'>
                        Centralized
                      </label>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>

          {/* *********************** */}
          {/* End Session */}
          {/* *********************** */}
          <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mx-10 border-b'>
            <div className='col-span-full'>
              <label
                htmlFor='most-recent-date-change'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Most recent date of organizational change
              </label>
              <DatePickerDemos />
            </div>

            <div className='col-span-full'>
              <label
                htmlFor='notes'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Notes
              </label>
              <div className='mt-2'>
                <textarea
                  id='notes'
                  name='notes'
                  rows={3}
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  defaultValue={""}
                />
              </div>
            </div>
          </div>

          <div className='mt-6 flex items-center justify-end gap-x-6 mx-10'>
            <button
              type='submit'
              className='rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
            >
              Save
            </button>
          </div>
        </div>
      </form>
      </Container>
    </main>
  );
};

export default CreateNewLibrary;
