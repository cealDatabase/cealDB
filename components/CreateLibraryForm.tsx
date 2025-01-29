// Since the data in the form will change in the frontend, therefore it is important to claim the component as a client-side rendered component
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs"; // Import Dayjs for date handling
import * as dayjs from "dayjs"; // Import as a namespace to use isDayjs
import { Container } from "@/components/Container";

import {
  SingleLibraryType,
  Reflibraryregion,
  Reflibrarytype,
} from "@/types/types";

// Dynamically import the DatePicker
const DatePicker = dynamic(
  () => import("@mui/x-date-pickers/DatePicker").then((mod) => mod.DatePicker),
  { ssr: false } // Ensure this component is client-side only
);

// Make sure parent props path through child components
type MyChildComponentProps = {
  data: any[];
};

const CreateLibraryForm = ({ data }: MyChildComponentProps) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  // console.log("selected date:", selectedDate);

  // State for the form
  const [formData, setFormData] = useState<Partial<SingleLibraryType>>({
    // Since the library id is autoincrementing, therefore I will be operating the id number directly under api/route.ts
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
    pliestablishedyear: null,
    plibibliographic: null,
    pliconsortia: null,
    pliopac: false,
    plihome_page: null,
    plionline_catalog: null,
    plisystem_vendor: null,
  });

  // State for dropdown options
  const [libraryTypes, setLibraryTypes] = useState<Reflibrarytype[]>([]);
  const [libaryRegions, setLibraryRegions] = useState<Reflibraryregion[]>([]);

  // State for collection_librarian_groups
  const [librarianGroups, setLibrarianGroups] = useState<string[]>([]);

  // State for acquisition type
  const [acquisitionTypes, setAcquisitionTypes] = useState<string[]>([]);

  // State for cataloging type
  const [catalogingTypes, setCatalogingTypes] = useState<string[]>([]);

  // State for circulation type
  const [circulationTypes, setCirculationTypes] = useState<string[]>([]);

  // Options for collection_librarian_groups
  const librarianGroupOptions = [
    "International/global studies",
    "Subject librarians/consultant group",
    "Collection development",
    "Research and learning group",
    "Technical processing group",
    "Public services group",
    "Special collections group",
    'Other (input additional information in "Notes" box at the end of this form)',
  ];

  const acquisitionOptions = ["On Site", "Centralized", "Out-sourced"];

  const catalogingOptions = ["On Site", "Centralized", "Out-sourced"];

  const circulationOptions = ["On Site", "Centralized"];

  // load all library types and library regions when page refreshed/rendered
  useEffect(() => {
    const fetchLibraryTypesandRegions = async () => {
      setLibraryTypes(await data[0]);
      setLibraryRegions(await data[1]);
    };

    fetchLibraryTypesandRegions();
  }, []);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    // Check if the input is a checkbox
    if (type === "checkbox" && name === "collection_librarians_groups") {
      // add an && clause to make sure we have the correct checkbox name

      // Checkbox under "librarian groups"
      let updatedLibrarianGroups;
      if (librarianGroups.includes(value)) {
        updatedLibrarianGroups = librarianGroups.filter(
          (item) => item !== value
        );
      } else {
        updatedLibrarianGroups = [...librarianGroups, value];
      }

      setLibrarianGroups(updatedLibrarianGroups);

      // Convert the selected options to a comma-separated string
      const responseString = updatedLibrarianGroups.join(", ");
      setFormData((prevFormData) => ({
        ...prevFormData,
        collection_librarians_groups: responseString,
      }));
    } else if (type === "checkbox" && name === "acquisition_type") {
      // Checkbox under "Acquisitions (Order and Receiving)"
      let updatedAcquisitionTypes;
      if (acquisitionTypes.includes(value)) {
        updatedAcquisitionTypes = acquisitionTypes.filter(
          (item) => item !== value
        );
      } else {
        updatedAcquisitionTypes = [...acquisitionTypes, value];
      }

      setAcquisitionTypes(updatedAcquisitionTypes);

      const responseStringAcquisition = updatedAcquisitionTypes.join(", ");
      setFormData((prevFormData) => ({
        ...prevFormData,
        acquisition_type: responseStringAcquisition,
      }));
    } else if (type === "checkbox" && name === "cataloging_type") {
      // Checkbox under "Cataloging and Processing"
      let updatedCatalogingTypes;
      if (catalogingTypes.includes(value)) {
        updatedCatalogingTypes = catalogingTypes.filter(
          (item) => item !== value
        );
      } else {
        updatedCatalogingTypes = [...catalogingTypes, value];
      }

      setCatalogingTypes(updatedCatalogingTypes);

      const responseStringCataloging = updatedCatalogingTypes.join(", ");
      setFormData((prevFormData) => ({
        ...prevFormData,
        cataloging_type: responseStringCataloging,
      }));
    } else if (type === "checkbox" && name === "circulation_type") {
      // Checkbox under "Circulation"
      let updatedCirculationTypes;
      if (circulationTypes.includes(value)) {
        updatedCirculationTypes = circulationTypes.filter(
          (item) => item !== value
        );
      } else {
        updatedCirculationTypes = [...circulationTypes, value];
      }

      setCirculationTypes(updatedCirculationTypes);

      const responseStringCirculation = updatedCirculationTypes.join(", ");
      setFormData((prevFormData) => ({
        ...prevFormData,
        circulation_type: responseStringCirculation,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  console.log("Form Data:", formData);

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
    <main>
      <h1 className='text-base font-semibold learning-7 text-gray-900'>
        Create a library
      </h1>
      <Container>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <form className='bg-gray-100 rounded-lg pb-8' onSubmit={handleSubmit}>
            <div className='space-y-12'>
              {/* Library Create General Information */}

              <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mx-10'>
                {/* Starting from Here*/}
                {/* Library Number */}
                <div className='sm:col-span-4'>
                  <label
                    htmlFor='library_number'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Library Number
                  </label>
                  <div className='mt-2'>
                    <div className='flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md'>
                      <input
                        id='library_number'
                        name='library_number'
                        type='text'
                        placeholder='Please input your 4-digits library number'
                        autoComplete='library_number'
                        className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                        value={formData.library_number ?? ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
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
                        id='library_name'
                        name='library_name'
                        type='text'
                        placeholder='Please input your library full name'
                        autoComplete='libraryName'
                        className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                        value={formData.library_name ?? ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                {/* Hide in library listing */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='hideinlibrarylist'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Hide in library Listing?
                  </label>
                  <div className='mt-2'>
                    <select
                      id='hideinlibrarylist'
                      name='hideinlibrarylist'
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                      value={formData.hideinlibrarylist ? "true" : "false"}
                      onChange={(e) => {
                        const { value } = e.target;
                        setFormData((prevData) => ({
                          ...prevData,
                          hideinlibrarylist: value === "true",
                        }));
                      }}
                    >
                      <option value='false'>No</option>
                      <option value='true'>Yes</option>
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
                      id='type'
                      name='type'
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                      value={formData.type ?? ""}
                      onChange={handleInputChange}
                    >
                      {/* getLibraryTypes */}
                      <option value=''>Select a library type</option>
                      {libraryTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.librarytype}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Library Region */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='pliregion'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Library Region
                  </label>
                  <div className='mt-2'>
                    <select
                      id='pliregion'
                      name='pliregion'
                      autoComplete='pliregion-name'
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                      value={formData.pliregion ?? ""}
                      onChange={handleInputChange}
                      required
                    >
                      {/* getLibraryRegions */}
                      <option value=''>Select a region</option>
                      {libaryRegions.map((region) => (
                        <option key={region.id} value={region.id}>
                          {region.libraryregion}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className='sm:col-span-3' /> {/* Placeholder */}
                {/* Submitted By */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='plisubmitter_first_name'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Submitted By: first name
                  </label>
                  <div className='mt-2'>
                    <input
                      id='plisubmitter_first_name'
                      name='plisubmitter_first_name'
                      type='text'
                      autoComplete='given-name'
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      value={formData.plisubmitter_first_name ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='plisubmitter_last_name'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Submitted by: last name
                  </label>
                  <div className='mt-2'>
                    <input
                      id='plisubmitter_last_name'
                      name='plisubmitter_last_name'
                      type='text'
                      autoComplete='family-name'
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      value={formData.plisubmitter_last_name ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {/* Title */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='pliposition_title'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Title
                  </label>
                  <div className='mt-2'>
                    <input
                      id='pliposition_title'
                      name='pliposition_title'
                      type='text'
                      autoComplete='title'
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      value={formData.pliposition_title ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {/* Phone */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='pliwork_phone'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Phone
                  </label>
                  <div className='mt-2'>
                    <input
                      id='pliwork_phone'
                      name='pliwork_phone'
                      type='text'
                      autoComplete='phone'
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      value={formData.pliwork_phone ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {/* Email */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='plie_mail'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Email address
                  </label>
                  <div className='mt-2'>
                    <input
                      id='plie_mail'
                      name='plie_mail'
                      type='text'
                      autoComplete='email'
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      value={formData.plie_mail ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {/* Fax */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='plifax_number'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Fax
                  </label>
                  <div className='mt-2'>
                    <input
                      id='plifax_number'
                      name='plifax_number'
                      type='text'
                      autoComplete='fax'
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      value={formData.plifax_number ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {/* Library Home Page */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='plihome_page'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Library Home Page
                  </label>
                  <div className='mt-2'>
                    <input
                      id='plihome_page'
                      name='plihome_page'
                      type='text'
                      autoComplete='libraryHomePage'
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      value={formData.plihome_page ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {/* Library Online Catalogue */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='plionline_catalog'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Library Online Catalogue
                  </label>
                  <div className='mt-2'>
                    <input
                      id='plionline_catalog'
                      name='plionline_catalog'
                      type='text'
                      autoComplete='libraryOnlineCatalogue'
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      value={formData.plionline_catalog ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {/* Bibliographic Unitilies */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='plibibliographic'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Bibiliographic Utilities
                  </label>
                  <div className='mt-2'>
                    <input
                      id='plibibliographic'
                      name='plibibliographic'
                      type='text'
                      autoComplete='bibliographicUtilities'
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      value={formData.plibibliographic ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {/* Networks or Consortia */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='pliconsortia'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Networks or Consortia
                  </label>
                  <div className='mt-2'>
                    <input
                      id='pliconsortia'
                      name='pliconsortia'
                      type='text'
                      autoComplete='networksConsortia'
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      value={formData.pliconsortia ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {/* Integrated System Vendor */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='plisystem_vendor'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Integrated System Vendor
                  </label>
                  <div className='mt-2'>
                    <input
                      id='plisystem_vendor'
                      name='plisystem_vendor'
                      type='text'
                      autoComplete='integratedSystemVendor'
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      value={formData.plisystem_vendor ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {/* OPAC Capability of CJK Display */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='pliopac'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    OPAC Capability of CJK Display
                  </label>
                  <div className='mt-2'>
                    <select
                      id='pliopac'
                      name='pliopac'
                      autoComplete='OPACCJK-name'
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                      value={formData.pliopac ? "true" : "false"}
                      onChange={(e) => {
                        const { value } = e.target;
                        setFormData((prevData) => ({
                          ...prevData,
                          pliopac: value === "true",
                        }));
                      }}
                    >
                      <option value={"false"}>No</option>
                      <option value={"true"}>Yes</option>
                    </select>
                  </div>
                </div>
                {/* Established at (4-digit year) */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='pliestablishedyear'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Established at (4-digit year)
                  </label>
                  <div className='mt-2'>
                    <input
                      id='pliestablishedyear'
                      name='pliestablishedyear'
                      type='text'
                      autoComplete='establishedAt'
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      value={formData.pliestablishedyear ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {/* Law */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='plilaw'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Law
                  </label>
                  <div className='mt-2'>
                    <select
                      id='plilaw'
                      name='plilaw'
                      autoComplete='law-name'
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                      value={formData.plilaw ? "true" : "false"}
                      onChange={(e) => {
                        const { value } = e.target;
                        setFormData((prevData) => ({
                          ...prevData,
                          plilaw: value === "true",
                        }));
                      }}
                      required
                    >
                      <option value={"false"}>No</option>
                      <option value={"true"}>Yes</option>
                    </select>
                  </div>
                </div>
                {/* Medical */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='plimed'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Medical
                  </label>
                  <div className='mt-2'>
                    <select
                      id='plimed'
                      name='plimed'
                      autoComplete='medical-name'
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                      value={formData.plimed ? "true" : "false"}
                      onChange={(e) => {
                        const { value } = e.target;
                        setFormData((prevData) => ({
                          ...prevData,
                          plimed: value === "true",
                        }));
                      }}
                      required
                    >
                      <option value={"false"}>No</option>
                      <option value={"true"}>Yes</option>
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
                    htmlFor='collection_title'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Full title of East Asian collection
                  </label>
                  <div className='mt-2'>
                    <input
                      id='collection_title'
                      name='collection_title'
                      type='text'
                      autoComplete=''
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      value={formData.collection_title ?? ""}
                      onChange={handleInputChange}
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
                    htmlFor='collection_incharge_title'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Position title in charge of the East Asian collection
                  </label>
                  <div className='mt-2'>
                    <input
                      id='collection_incharge_title'
                      name='collection_incharge_title'
                      type='text'
                      autoComplete=''
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      value={formData.collection_incharge_title ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {/* Head of E.Asian collection reports to what position title */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='collection_head_reports_to'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Head of E.Asian collection reports to what position title
                  </label>
                  <div className='mt-2'>
                    <input
                      id='collection_head_reports_to'
                      name='collection_head_reports_to'
                      type='text'
                      autoComplete=''
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      value={formData.collection_head_reports_to ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {/* Collection organized under what department/unit? */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='collection_organized_under'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Collection organized under what department/unit?
                  </label>
                  <div className='mt-2'>
                    <input
                      id='collection_organized_under'
                      name='collection_organized_under'
                      type='text'
                      autoComplete=''
                      placeholder='e.g. International Collections'
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      value={formData.collection_organized_under ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {/* The top hierarchy department/unit the collection is under (if it is different than previous) */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='collection_top_department'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    The top hierarchy department/unit the collection is under
                    (if it is different than previous)
                  </label>
                  <div className='mt-2'>
                    <input
                      id='collection_top_department'
                      name='collection_top_department'
                      type='text'
                      autoComplete=''
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      value={formData.collection_top_department ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {/* Except the Univ. Librarian (or the Dean of the Libraries), the title of the next highest position the collection is under */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='collection_next_position_title'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Except the Univ. Librarian (or the Dean of the Libraries),
                    the title of the next highest position the collection is
                    under
                  </label>
                  <div className='mt-2'>
                    <input
                      id='collection_next_position_title'
                      name='collection_next_position_title'
                      type='text'
                      autoComplete=''
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      value={formData.collection_next_position_title ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {/* East Asian collection is associated with which other departments/units? */}
                <div className='sm: col-span-3'>
                  <label
                    htmlFor='collection_other_departments'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    East Asian collection is associated with which other
                    departments/units?
                  </label>
                  <div className='mt-2'>
                    <textarea
                      id='collection_other_departments'
                      name='collection_other_departments'
                      rows={3}
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                      value={formData.collection_other_departments ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <p className='mt-3 text-sm leading-6 text-gray-400'>
                    (e.g. Research and Learning Division, Collection
                    Development, etc.)
                  </p>
                </div>
                {/* East Asian librarian(s) are a part of which of the following group(s) */}

                <div className='mt-10 space-y-10 sm: col-span-6'>
                  <fieldset>
                    <legend className='text-base font-semibold text-gray-900'>
                      Members
                    </legend>
                    <div className='mt-4 divide-y divide-gray-200 border-b border-t border-gray-200'>
                      {librarianGroupOptions.map((option) => (
                        <div key={option} className='relative flex gap-3 py-4'>
                          <div className='min-w-0 flex-1 text-sm/6'>
                            <label
                              htmlFor={option}
                              className='select-none font-medium text-gray-900'
                            >
                              {option}
                            </label>
                          </div>
                          <div className='flex h-6 shrink-0 items-center'>
                            <div className='group grid size-4 grid-cols-1'>
                              <input
                                value={option}
                                checked={librarianGroups.includes(option)}
                                onChange={handleInputChange}
                                type='checkbox'
                                name='collection_librarians_groups'
                                className='col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto'
                              />
                              <svg
                                fill='none'
                                viewBox='0 0 14 14'
                                className='pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25'
                              >
                                <path
                                  d='M3 8L6 11L11 3.5'
                                  strokeWidth={2}
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  className='opacity-0 group-has-[:checked]:opacity-100'
                                />
                                <path
                                  d='M3 7H11'
                                  strokeWidth={2}
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  className='opacity-0 group-has-[:indeterminate]:opacity-100'
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
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
                      id='collection_type'
                      name='collection_type'
                      autoComplete=''
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                      value={formData.collection_type ?? ""}
                      onChange={handleInputChange}
                    >
                      <option>- Select -</option>
                      <option
                        value={
                          "Stand-alone E.Asian library/collection building"
                        }
                      >
                        Stand-alone E.Asian library/collection building
                      </option>
                      <option
                        value={
                          "Seperate E.Asian collection within a library building"
                        }
                      >
                        Seperate E.Asian collection within a library building
                      </option>
                      <option
                        value={
                          "Seperate E.Asian collection with some parts interfiled with some parts iterfiled with other collections (by subject, call number block, size, etc.)"
                        }
                      >
                        Seperate E.Asian collection with some parts interfiled
                        with other collections (by subject, call number block,
                        size, etc.)
                      </option>
                      <option
                        value={
                          "East Asian collection completely interfiled with main library collection"
                        }
                      >
                        East Asian collection completely interfiled with main
                        library collection
                      </option>
                      <option
                        value={
                          "Other (Add additional information in 'Notes' box at the end fo this form.)"
                        }
                      >
                        Other (Add additional information in "Notes" box at the
                        end of this form.)
                      </option>
                    </select>
                  </div>
                </div>

                {/* CJK Languages (shelving) */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='shelving_type'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    CJK Languages (shelving)
                  </label>
                  <div className='mt-2'>
                    <select
                      id='shelving_type'
                      name='shelving_type'
                      autoComplete=''
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                      value={formData.shelving_type ?? ""}
                      onChange={handleInputChange}
                    >
                      <option>- Select -</option>
                      <option>intefiled, no Western language texts</option>
                      <option>
                        interfiled, includes Western language texts
                      </option>
                      <option>
                        CJK shelved separately, no Western langauge texts
                      </option>
                      <option>
                        CJK shelved separately, includes Western language texts
                      </option>
                      <option>
                        Other (Add additional information in "Notes" box at the
                        end of this form.)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Reference/Consultation */}
                <div className='sm:col-span-3'>
                  <label
                    htmlFor='consultation_type'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Reference/Consultation
                  </label>
                  <div className='mt-2'>
                    <select
                      id='consultation_type'
                      name='consultation_type'
                      autoComplete=''
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                      value={formData.consultation_type ?? ""}
                      onChange={handleInputChange}
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
                    htmlFor='teaching_type'
                    className='block text-sm font-medium leading-6 text-gray-900'
                  >
                    Teaching and Learning
                  </label>
                  <div className='mt-2'>
                    <select
                      id='teaching_type'
                      name='teaching_type'
                      autoComplete=''
                      className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6'
                      value={formData.teaching_type ?? ""}
                      onChange={handleInputChange}
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
                    <div className='mt-4 divide-y divide-gray-200 border-b border-t border-gray-200'>
                      {acquisitionOptions.map((option) => (
                        <div key={option} className='relative flex gap-3 py-4'>
                          <div className='min-w-0 flex-1 text-sm/6'>
                            <label
                              htmlFor={option}
                              className='select-none font-medium text-gray-900'
                            >
                              {option}
                            </label>
                          </div>
                          <div className='flex h-6 shrink-0 items-center'>
                            <div className='group grid size-4 grid-cols-1'>
                              <input
                                value={option}
                                checked={acquisitionTypes.includes(option)}
                                onChange={handleInputChange}
                                type='checkbox'
                                name='acquisition_type'
                                className='col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto'
                              />
                              <svg
                                fill='none'
                                viewBox='0 0 14 14'
                                className='pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25'
                              >
                                <path
                                  d='M3 8L6 11L11 3.5'
                                  strokeWidth={2}
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  className='opacity-0 group-has-[:checked]:opacity-100'
                                />
                                <path
                                  d='M3 7H11'
                                  strokeWidth={2}
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  className='opacity-0 group-has-[:indeterminate]:opacity-100'
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>

                {/* Cataloging and Processing */}
                <div className='space-y-10 sm: col-span-6'>
                  <fieldset>
                    <legend className='text-sm font-medium leading-6'>
                      Cataloging and Processing
                    </legend>
                    <div className='mt-4 divide-y divide-gray-200 border-b border-t border-gray-200'>
                      {catalogingOptions.map((option) => (
                        <div key={option} className='relative flex gap-3 py-4'>
                          <div className='min-w-0 flex-1 text-sm/6'>
                            <label
                              htmlFor={option}
                              className='select-none font-medium text-gray-900'
                            >
                              {option}
                            </label>
                          </div>
                          <div className='flex h-6 shrink-0 items-center'>
                            <div className='group grid size-4 grid-cols-1'>
                              <input
                                value={option}
                                checked={catalogingTypes.includes(option)}
                                onChange={handleInputChange}
                                type='checkbox'
                                name='cataloging_type'
                                className='col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto'
                              />
                              <svg
                                fill='none'
                                viewBox='0 0 14 14'
                                className='pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25'
                              >
                                <path
                                  d='M3 8L6 11L11 3.5'
                                  strokeWidth={2}
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  className='opacity-0 group-has-[:checked]:opacity-100'
                                />
                                <path
                                  d='M3 7H11'
                                  strokeWidth={2}
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  className='opacity-0 group-has-[:indeterminate]:opacity-100'
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>

                {/* Circulation */}
                <div className='space-y-10 sm: col-span-6 border-b'>
                  <fieldset>
                    <legend className='text-sm font-medium leading-6'>
                      Circulation
                    </legend>
                    <div className='mt-4 divide-y divide-gray-200 border-b border-t border-gray-200'>
                      {circulationOptions.map((option) => (
                        <div key={option} className='relative flex gap-3 py-4'>
                          <div className='min-w-0 flex-1 text-sm/6'>
                            <label
                              htmlFor={option}
                              className='select-none font-medium text-gray-900'
                            >
                              {option}
                            </label>
                          </div>
                          <div className='flex h-6 shrink-0 items-center'>
                            <div className='group grid size-4 grid-cols-1'>
                              <input
                                value={option}
                                checked={circulationTypes.includes(option)}
                                onChange={handleInputChange}
                                type='checkbox'
                                name='circulation_type'
                                className='col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto'
                              />
                              <svg
                                fill='none'
                                viewBox='0 0 14 14'
                                className='pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25'
                              >
                                <path
                                  d='M3 8L6 11L11 3.5'
                                  strokeWidth={2}
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  className='opacity-0 group-has-[:checked]:opacity-100'
                                />
                                <path
                                  d='M3 7H11'
                                  strokeWidth={2}
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  className='opacity-0 group-has-[:indeterminate]:opacity-100'
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
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
                  <DatePicker
                    label='Pick a date'
                    value={selectedDate}
                    onChange={(newDate) => {
                      // Type-check the newDate to ensure it's a Dayjs object
                      let isoDate: Date;
                      if (dayjs.isDayjs(newDate)) {
                        setSelectedDate(newDate); // It's a valid Dayjs object

                        isoDate = newDate.toDate();
                        console.log("selected date iso string: ", isoDate);
                      } else {
                        setSelectedDate(null); // Handle invalid date or null
                      }

                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        date_last_changed: isoDate,
                      }));
                    }}
                  />
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
                      value={formData.notes ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className='mt-6 flex items-center justify-end gap-x-6 mx-10'>
                <button
                  type='submit'
                  className='rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        </LocalizationProvider>
      </Container>
    </main>
  );
};

export default CreateLibraryForm;
