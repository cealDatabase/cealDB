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
}

export function SurveyBreadcrumb({ surveyType, year }: SurveyBreadcrumbProps) {
  const pathname = usePathname()
  
  // Survey type display names
  const surveyNames = {
    avdb: "Audio/Visual Database",
    ebook: "E-Book Database", 
    ejournal: "E-Journal Database"
  }
  
  // Check if we're on create page
  const isCreatePage = pathname.includes('/create')

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

          {/* Survey Management */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin" className="no-underline">Survey Management</Link>
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
