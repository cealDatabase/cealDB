"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SlashIcon } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"

interface SurveyBreadcrumbProps {
  surveyType: "avdb" | "ebook" | "ejournal";
  year: string;
  libid?: number;
}

export function SurveyBreadcrumb({ surveyType, year, libid }: SurveyBreadcrumbProps) {
  const pathname = usePathname()
  
  // Survey type display names
  const surveyNames = {
    avdb: "Audio/Visual Databases",
    ebook: "E-Book Databases", 
    ejournal: "E-Journal Databases"
  }

  // Access management edit paths per survey type
  const editPaths = {
    avdb: "avdbedit",
    ebook: "ebookedit",
    ejournal: "ejournaledit"
  }
  
  // Check if we're on create page
  const isCreatePage = pathname.includes('/create')

  // Link back to library-specific Access Management page when libid is available
  const accessManagementHref = libid
    ? `/admin/forms/${libid}/${editPaths[surveyType]}?year=${year}`
    : "/admin"

  return (
    <div className="m-8 ">
      <Breadcrumb>
        <BreadcrumbList>
          {/* Home */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="no-underline">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>

          {/* Admin */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin" className="no-underline">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>

          {/* Manage Access (links to library-specific page if libid available) */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={accessManagementHref} className="no-underline">
                {libid ? "Manage Access" : "Survey Management"}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>

          {/* Survey Type */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/admin/survey/${surveyType}/${year}`} className="no-underline">
                {surveyNames[surveyType]}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {/* Year */}
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            {isCreatePage ? (
              <BreadcrumbLink asChild>
                <Link href={`/admin/survey/${surveyType}/${year}`} className="no-underline">
                  {year}
                </Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{year}</BreadcrumbPage>
            )}
          </BreadcrumbItem>

          {/* Create New Entry (if on create page) */}
          {isCreatePage && (
            <>
              <BreadcrumbSeparator>
                <SlashIcon />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>Create New Entry</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
