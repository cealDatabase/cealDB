"use client"

import Link from "next/link"
import { SlashIcon } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"

interface SubscriptionBreadcrumbProps {
  surveyType: "avdb" | "ebook" | "ejournal";
  year: number;
  libraryName: string;
  mode: "view" | "add";
}

export function SubscriptionBreadcrumb({ surveyType, year, libraryName, mode }: SubscriptionBreadcrumbProps) {
  // Survey type display names
  const surveyNames = {
    avdb: "AV Database Subscriptions",
    ebook: "E-Book Subscriptions", 
    ejournal: "E-Journal Subscriptions"
  }
  
  const shortNames = {
    avdb: "AV",
    ebook: "E-Book",
    ejournal: "E-Journal"
  }

  return (
    <div className="mb-6">
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

          {/* Survey Type */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/admin/survey/${surveyType}/${year}`} className="no-underline">
                {surveyNames[surveyType]}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {/* Library Name */}
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">{libraryName}</BreadcrumbPage>
          </BreadcrumbItem>

          {/* Year and Mode */}
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>
              {year} - {mode === "view" ? "Manage Subscriptions" : `Add ${shortNames[surveyType]}`}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
