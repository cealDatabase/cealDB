"use client"

import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

import LibSingle from "./lib-single";
import { SingleLibraryType } from "@/types/types"; // Import the LibraryType type
import clsx from 'clsx';

export default function LibGrid({libraries}: { libraries: SingleLibraryType}) {
    const [selected, setSelected] = useState("chose one")
    
  return (
    <Listbox value={selected} onChange={setSelected}>
      {({ open }) => (
        <>
          <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Choose a library</Listbox.Label>
          <div className="relative mt-2 min-w-96">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
              <span className="block truncate">{ selected }</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {Array.isArray(libraries) && libraries.map((library: SingleLibraryType) => (
                  <Listbox.Option
                    key={library.id}
                    className={({ active }) =>
                      clsx(
                        active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9'
                      )
                    }
                    value={library.id}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={clsx(selected ? 'font-semibold' : 'font-normal', 'block')}>
                          {library.name}
                        </span>

                        {selected ? (
                          <span
                            className={clsx(
                              active ? 'text-white' : 'text-indigo-600',
                              'absolute inset-y-0 right-0 flex items-center pr-4'
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>






    // <>
    //   <div className="bg-white/30 p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-xl mx-auto w-full">
    //     <div className="flex justify-between items-center mb-4">
    //       <div className="space-y-1">
    //         <h2 className="text-xl font-semibold">Recent Libraries</h2>
    //       </div>
    //     </div>

    //     <div className="divide-y divide-gray-900/5">
    //       {libraries && Array.isArray(libraries)
    //         ? libraries.map((library: SingleLibraryType) => (
    //             <div key={library.id}>
    //               <LibSingle {...library} />
    //             </div>
    //           ))
    //         : "Error"}
    //     </div>
    //   </div>
    // </>
  );
}
