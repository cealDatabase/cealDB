"use client";

import {
  SingleLibraryType,
  Reflibraryregion,
  Reflibrarytype,
} from "@/types/types";
import { useState, useEffect } from "react";

type MyChildComponentProps = {
  data: any[];
};

const CreateFormDemo = ({ data }: MyChildComponentProps) => {
  // State for the form
  const [formData, setFormData] = useState<Partial<SingleLibraryType>>({
    // id: 999, //I will try to make it autoincrement
    library_name: "",
    type: 0,
    plilaw: false,
    plimed: false,
    plisubmitter_first_name: null,
    plisubmitter_last_name: null,
    pliposition_title: null,
    pliwork_phone: null,
    plie_mail: "",
    plifax_number: null,
    pliinput_as_of_date: null,
    password: null,
    hideinlibrarylist: false,
    pliregion: null,
    // Add other fields from SingleLibraryType as needed
  });

  // State for dropdown options
  const [libraryTypes, setLibraryTypes] = useState<Reflibrarytype[]>([]);
  const [libraryRegions, setLibraryRegions] = useState<Reflibraryregion[]>([]);

  useEffect(() => {
    const fetchLibraryTypesandRegions = async () => {
      setLibraryTypes(await data[0]);
      setLibraryRegions(await data[1]);
    };

    fetchLibraryTypesandRegions();
  }, []);

  // console.log("library Types:", libraryTypes);
  // console.log("library Regions:", libraryRegions);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Check if the input is a checkbox
    if (type === "checkbox") {
      const isChecked = (e.target as HTMLInputElement).checked;
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: isChecked,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Error submitting the form");

      const result = await res.json();
      console.log("Library created:", result);
    } catch (error) {
      console.error("Error creating library from CreateFormDemo:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor='library_name'>Library Name</label>
        <input
          type='text'
          id='library_name'
          name='library_name'
          value={formData.library_name || ""}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* Library Type Dropdown */}
      <div>
        <label htmlFor='type'>Library Type</label>
        <select
          id='type'
          name='type'
          value={formData.type ?? ""}
          onChange={handleInputChange}
          required
        >
          <option value=''>Select a type</option>
          {libraryTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.librarytype}
            </option>
          ))}
        </select>
      </div>

      {/* Library Region Dropdown */}
      <div>
        <label htmlFor='pliregion'>Library Region</label>
        <select
          id='pliregion'
          name='pliregion'
          value={formData.pliregion ?? ""}
          onChange={handleInputChange}
        >
          <option value=''>Select a region</option>
          {libraryRegions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.libraryregion}
            </option>
          ))}
        </select>
      </div>

      {/* Library Number */}
      <div>
        <label htmlFor='library_number'>Library Number</label>
        <input
          type='text'
          id='library_number'
          name='library_number'
          value={formData.library_number || 0}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* Boolean Fields */}
      <div>
        <label>
          <input
            type='checkbox'
            name='plilaw'
            checked={formData.plilaw || undefined}
            onChange={handleInputChange}
          />
          Plilaw
        </label>
      </div>

      <div>
        <label>
          <input
            type='checkbox'
            name='plimed'
            checked={formData.plimed || undefined}
            onChange={handleInputChange}
          />
          Plimed
        </label>
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor='plie_mail'>Email</label>
        <input
          type='email'
          id='plie_mail'
          name='plie_mail'
          value={formData.plie_mail || ""}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* Hide in Library List - Boolean Dropdown */}
      <div>
        <label htmlFor='hideinlibrarylist'>Hide in Library List</label>
        <select
          id='hideinlibrarylist'
          name='hideinlibrarylist'
          value={formData.hideinlibrarylist ? "true" : "false"}
          onChange={handleInputChange}
        >
          <option value='false'>No</option>
          <option value='true'>Yes</option>
        </select>
      </div>

      {/* Submit Button */}
      <button type='submit'>Submit</button>
    </form>
  );
};

export default CreateFormDemo;
