'use client'

import { useEffect, useState } from 'react'
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Generate list of years option from 2017 to current year
const beginYear = 2017;

export default function SelectYear({ yearCurrent }: { yearCurrent: string }) {
    const router = useRouter();
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [years, setYears] = useState<number[]>([]);
    const [isClient, setIsClient] = useState(false);

    // Initialize client-side state and years array
    useEffect(() => {
        setIsClient(true);
        const yearLength = currentYear - beginYear + 1;
        const yearsArray = Array.from({ length: yearLength }, (_, i) => beginYear + i).reverse();
        setYears(yearsArray);
        
        // Set selectedYear based on yearCurrent prop or default to current year
        if (yearCurrent) {
            setSelectedYear(Number(yearCurrent));
        } else {
            setSelectedYear(currentYear);
        }
    }, [yearCurrent, currentYear]);

    const handleChange = (year: number) => {
        setSelectedYear(year);
        router.push(`/admin/survey/ejournal/${year}`);
    };

    const handleCreateClick = () => {
        if (!isClient) return; // Prevent SSR issues
        const currentPath = window.location.pathname; // e.g., /admin/survey/avdb/2024
        const segments = currentPath.split("/");
        const type = segments[segments.indexOf("survey") + 1]; // avdb, ebook, ejournal
        router.push(`/admin/survey/${type}/create?year=${selectedYear}`);
    };

    // Show loading state during hydration
    if (!isClient || years.length === 0) {
        return (
            <div className='flex items-center justify-end my-4 gap-4'>
                <div className='flex flex-row self-end'>
                    <div className="text-sm/6 font-medium text-sky-600">Select Year:</div>
                    <div className="grid cursor-default grid-cols-1 rounded-md bg-white px-3 pb-0.5 text-left outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                        <span className="col-start-1 row-start-1 truncate pr-6 text-sky-600 text-sm/6 md:text-normal">
                            {selectedYear}
                        </span>
                    </div>
                </div>
                <Button disabled className='ml-4 text-sm px-4 py-0 md:text-normal'>
                    Create New Entry
                </Button>
            </div>
        );
    }

    return (
        <div className='flex items-center justify-between my-4 gap-4'>
            <div className="flex items-center gap-4">
                <div className="min-w-[120px]">
                    <label className="block text-sm font-medium text-gray-900 mb-2">Select Year</label>
                <Select value={selectedYear?.toString()} onValueChange={(value) => handleChange(parseInt(value))}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a year" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                                {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                </div>
            </div>

            <Button onClick={handleCreateClick} className='text-sm px-4 py-0 md:text-normal'>
                Create New Entry
            </Button>
        </div>
    );
}
