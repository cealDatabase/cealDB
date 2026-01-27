"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { ChevronDownIcon, SlashIcon } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { forms } from "@/constant/form"

interface AdminBreadcrumbProps {
  libraryName?: string;
}

export function AdminBreadcrumb({ libraryName }: AdminBreadcrumbProps) {
  const params = useParams()
  const pathname = usePathname()
  const libid = params?.libid as string

  // Form mapping for better display names
  const formMap: Record<string, string> = {
    monographic: "1. Monographic Acquisitions",
    volumeHoldings: "2. Physical Volume Holdings",
    serials: "3. Serial Titles",
    otherHoldings: "4. Holdings of Other Materials",
    unprocessed: "5. Unprocessed Backlog Materials",
    fiscal: "6. Fiscal Support",
    personnel: "7. Personnel Support",
    publicServices: "8. Public Services",
    electronic: "9. Electronic",
    electronicBooks: "10. Electronic Books",
  }

  // Get current form from pathname
  const pathSegments = pathname.split('/').filter(Boolean)
  const currentForm = pathSegments[pathSegments.length - 1]
  const isFormPage = pathSegments.includes('forms') && libid && currentForm !== libid

  // Get other forms for dropdown (excluding current form)
  const otherForms = forms.filter(form => form.href !== currentForm)

  return (
    <div className="my-6">
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

          {/* Statistics Forms */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/forms" className="no-underline">Statistics Forms</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {/* Library specific section */}
          {libid && (
            <>
              <BreadcrumbSeparator>
                <SlashIcon />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/admin/forms?libraryName=${encodeURIComponent(libraryName || 'Library')}`} className="no-underline">
                    {libraryName || `Library ${libid}`}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}

          {/* Current form with dropdown for other forms */}
          {isFormPage && (
            <>
              <BreadcrumbSeparator>
                <SlashIcon />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5">
                    {formMap[currentForm] || currentForm}
                    <ChevronDownIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    {otherForms.map((form, index) => (
                      <DropdownMenuItem key={form.href} asChild>
                        <Link href={`/admin/forms/${libid}/${form.href}`} className="no-underline">
                          {form.title}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
