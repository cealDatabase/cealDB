'use client'

import { useEffect, useState } from 'react'
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/16/solid'
import { useRouter } from "next/navigation";

// Generate list of years option from 2017 to current year
const beginYear = 2017;
const yearLength = Number(new Date().getFullYear()) - beginYear + 1;
const years = Array.from({ length: yearLength }, (_, i) => beginYear + i);

export default function SelectYear({ yearCurrent }: { yearCurrent: string }) {
    const router = useRouter();
    const [selectedYear, setSelectedYear] = useState(years[0]);

    useEffect(() => {
        setSelectedYear(Number(yearCurrent));
    }, [yearCurrent]);

    const handleChange = (year: number) => {
        setSelectedYear(year);
        router.push(`/admin/survey/ejournal/${year}`);
    };


    return (
        <div className='flex flex-row self-end mb-4'>
            <Listbox value={selectedYear} onChange={handleChange}>
                <Label className="text-sm/6 font-medium text-sky-600">Select Year:</Label>
                <div className="relative">
                    <ListboxButton className="grid cursor-default grid-cols-1 rounded-md bg-white pb-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                        <span className="col-start-1 row-start-1 truncate pr-6 text-sky-600 font-medium">{selectedYear}</span>
                        <ChevronUpDownIcon
                            aria-hidden="true"
                            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                        />
                    </ListboxButton>

                    <ListboxOptions
                        transition
                        className="absolute z-10 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base ring-1 shadow-lg ring-black/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
                    >
                        {years.map((year) => (
                            <ListboxOption
                                key={year}
                                value={year}
                                className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
                            >
                                <span className="block truncate font-normal group-data-selected:font-semibold">{year}</span>

                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </div>
            </Listbox>
        </div>
    )
}
