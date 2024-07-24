import db from "@/lib/db";
import { redirect } from "next/navigation";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";

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
      <form action={createLibrary}>
        <div className='space-y-12'>
          <h1 className='text-base font-semibold learning-7 text-gray-900'>
            Create a library
          </h1>
          <p className='mt-1 text-sm leading-6 text-gray-900'>
            Some placeholders over here to give some tips...
          </p>
          <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6'>
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
                    className='block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6'
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
        </div>
      </form>
    </main>
  );
};

export default CreateNewLibrary;
