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
    monographic: "Monographic Acquisitions",
    volumeHoldings: "Physical Volume Holdings",
    serials: "Serial Titles",
    otherHoldings: "Holdings of Other Materials",
    unprocessed: "Unprocessed Backlog Materials",
    fiscal: "Fiscal Support",
    personnel: "Personnel Support",
    publicServices: "Public Services",
    electronic: "Electronic",
    electronicBooks: "Electronic Books",
    ebookedit: "E-Book Database by Subscription",
    ejournaledit: "E-Journal Database by Subscription",
    avdbedit: "Audio/Visual Database by Subscription"
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

          {/* Forms Management */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/forms" className="no-underline">Forms Management</Link>
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
                    {/* Special edit forms */}
                    {currentForm !== 'ebookedit' && (
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/forms/${libid}/ebookedit`} className="no-underline">
                          E-Book Database by Subscription
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {currentForm !== 'ejournaledit' && (
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/forms/${libid}/ejournaledit`} className="no-underline">
                          E-Journal Database by Subscription
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {currentForm !== 'avdbedit' && (
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/forms/${libid}/avdbedit`} className="no-underline">
                          Audio/Visual Database by Subscription
                        </Link>
                      </DropdownMenuItem>
                    )}
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
