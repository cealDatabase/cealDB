"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function SelectYear() {
    const router = useRouter();

    const [selectedYear, setSelectedYear] = useState("");
    const years = Array.from({ length: 26 }, (_, i) => 2000 + i);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const year = Number(e.target.value);
        setSelectedYear(String(year));
        router.push(`/admin/survey/avdb/${year}`);
    };

    return (
        <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="mb-4">
                <label htmlFor="yearSelect" className="mr-2">
                    Select Year:
                </label>
                <select
                    id="yearSelect"
                    value={selectedYear}
                    onChange={handleChange}
                >
                    {years.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
