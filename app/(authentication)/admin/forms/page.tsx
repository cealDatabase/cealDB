import { cookies } from "next/headers"
import { Container } from "@/components/Container"
import Link from "next/link"
import { forms, instructionGroup } from "@/constant/form"
import { OctagonAlert, BadgeQuestionMark, ClipboardType } from "lucide-react"
import { getLibraryById } from "@/data/fetchPrisma"
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb"
import { getFormattedSurveyDates } from "@/data/fetchSurveyDates"
import { FormStatusBadge } from "@/components/FormStatusBadge"
import { FormsAvailabilityBadge } from "@/components/FormsAvailabilityBadge"
import db from "@/lib/db"

type InstructionGroupKeys = keyof typeof instructionGroup

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const FormsPage = async ({ searchParams }: { searchParams: Promise<{ libraryName?: string }> }) => {
    const cookieStore = await cookies()
    const library = cookieStore.get("library")
    const libid = library?.value

    // Get library name with fallback logic
    const resolvedSearchParams = await searchParams;
    let libraryName = resolvedSearchParams.libraryName;

    if (!libraryName && libid) {
        try {
            const libraryData = await getLibraryById(parseInt(libid));
            libraryName = libraryData?.library_name;
        } catch (error) {
            console.error("Error fetching library name:", error);
        }
    }

    // Final fallback
    libraryName = libraryName || "your library";

    const currentYear = new Date().getFullYear()
    const previousYear = currentYear - 1
    const nextYear = currentYear + 1

    // Fetch survey dates (with defaults or admin-selected dates)
    const surveyDates = await getFormattedSurveyDates(currentYear)

    // Fetch form status data once server-side (if libid is available)
    let formStatusData = null
    if (libid) {
        try {
            const libraryYear = await db.library_Year.findFirst({
                where: {
                    library: parseInt(libid),
                    year: currentYear,
                },
                include: {
                    Monographic_Acquisitions: true,
                    Volume_Holdings: true,
                    Serials: true,
                    Other_Holdings: true,
                    Unprocessed_Backlog_Materials: true,
                    Fiscal_Support: true,
                    Personnel_Support: true,
                    Public_Services: true,
                    Electronic: true,
                    Electronic_Books: true,
                },
            })

            if (libraryYear) {
                formStatusData = {
                    isFormsClosed: !libraryYear.is_open_for_editing,
                    forms: {
                        monographic: {
                            submitted: !!libraryYear.Monographic_Acquisitions,
                            recordId: libraryYear.Monographic_Acquisitions?.id || null,
                        },
                        volumeHoldings: {
                            submitted: !!libraryYear.Volume_Holdings,
                            recordId: libraryYear.Volume_Holdings?.id || null,
                        },
                        serials: {
                            submitted: !!libraryYear.Serials,
                            recordId: libraryYear.Serials?.id || null,
                        },
                        otherHoldings: {
                            submitted: !!libraryYear.Other_Holdings,
                            recordId: libraryYear.Other_Holdings?.id || null,
                        },
                        unprocessed: {
                            submitted: !!libraryYear.Unprocessed_Backlog_Materials,
                            recordId: libraryYear.Unprocessed_Backlog_Materials?.id || null,
                        },
                        fiscal: {
                            submitted: !!libraryYear.Fiscal_Support,
                            recordId: libraryYear.Fiscal_Support?.id || null,
                        },
                        personnel: {
                            submitted: !!libraryYear.Personnel_Support,
                            recordId: libraryYear.Personnel_Support?.id || null,
                        },
                        publicServices: {
                            submitted: !!libraryYear.Public_Services,
                            recordId: libraryYear.Public_Services?.id || null,
                        },
                        electronic: {
                            submitted: !!libraryYear.Electronic,
                            recordId: libraryYear.Electronic?.id || null,
                        },
                        electronicBooks: {
                            submitted: !!libraryYear.Electronic_Books,
                            recordId: libraryYear.Electronic_Books?.id || null,
                        },
                    },
                }
            }
        } catch (error) {
            console.error('Error fetching form status:', error)
        }
    }

    // Create dynamic FAQ with correct dates
    const dynamicInstructionGroup = {
        ...instructionGroup,
        "Survey Time Frame and Publication": [
            {
                question: "Input/Edit Time Frame",
                answer: `The ${previousYear} - ${currentYear} Online Survey input/edit time frame is from ${surveyDates.shortDateRange} (11:59 pm Pacific Time)`,
            },
            {
                question: "Publication Date",
                answer: `The ${previousYear} - ${currentYear} CEAL annual statistics will be published in the ${surveyDates.publicationMonth} online issue of the <i>Journal of East Asian Libraries</i>.`,
            },
        ],
    }

    return (
        <main className="min-h-screen">
            <div className="bg-gradient-to-r from-gray-200/10 to-gray-200/10 text-stone-900 w-full">
                <Container>
                    <AdminBreadcrumb libraryName={libraryName} />
                    <div className="pt-12">
                        <h1 className="text-4xl font-bold text-stone-900 mb-3">Forms Management</h1>
                        <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/90 text-emerald-50 text-sm font-medium">
                            <div className="w-2 h-2 bg-emerald-800 rounded-full mr-2"></div>
                            Active Survey Period: {surveyDates.shortDateRange}
                        </div>
                    </div>
                </Container>
            </div>

            <Container className="py-12">
                <div className="space-y-12">

                    <section className="bg-white rounded-xl shadow-lg border border-emerald-200 p-8">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                    <OctagonAlert className="text-white text-sm font-bold" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Instructions</h2>
                            </div>
                            <p className="text-gray-600">Important information about the survey process</p>
                        </div>

                        <div className="prose prose-gray max-w-none">
                            <p className="text-gray-700 leading-relaxed mb-6">
                                The{" "}
                                <span className="font-semibold text-emerald-700">
                                    {previousYear}-{currentYear} CEAL Statistics Online Survey
                                </span>{" "}
                                input/edit period is from{" "}
                                <span className="font-semibold text-orange-600">{surveyDates.shortDateRange}</span>, with the
                                results published in the <span className="font-semibold text-blue-600">{surveyDates.publicationMonth}</span> issue of the Journal of East Asian Libraries. The survey
                                covers the fiscal year <span className="font-semibold text-purple-600">{surveyDates.fiscalYearPeriod}</span>, with all figures rounded
                                to whole numbers and currency converted to US dollars.
                            </p>

                            <p className="text-gray-700 leading-relaxed mb-6">
                                <span className="font-semibold text-purple-700">Non-CJK items</span> refer to non-CJK language materials
                                related to East Asia. Each institution, except law libraries, should submit a combined report, and
                                significant data changes must be footnoted. Participants must log in to the CEAL Statistics Database
                                using the registered contact's email and follow the password setup process if necessary.
                            </p>

                            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-300 rounded-lg p-6">
                                <p className="text-emerald-900 font-semibold">
                                    📖 For detailed instructions, visit:{" "}
                                    <a
                                        href="https://guides.lib.ku.edu/CEAL_Stats"
                                        className="text-emerald-600 hover:text-emerald-800 underline decoration-2 underline-offset-2 transition-colors"
                                    >
                                        https://guides.lib.ku.edu/CEAL_Stats
                                    </a>
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-xl shadow-lg border border-orange-200 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-full -mr-16 -mt-16"></div>
                        <div className="mb-8 relative">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                                <h2 className="text-2xl font-bold text-gray-900">Complete These First</h2>
                                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-semibold rounded-full">
                                    Priority
                                </span>
                            </div>
                            <p className="text-gray-600">Priority forms that need immediate attention</p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-5 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-l-4 border-orange-500 hover:shadow-md transition-all">
                                <Link
                                    href={`/admin/forms/${libid}/avdbedit`}
                                    className="block text-orange-900 hover:text-orange-700 font-semibold transition-colors"
                                >
                                    🎵 Audio/Visual Database by Subscription for {libraryName} in {currentYear}
                                </Link>
                            </div>
                            <div className="p-5 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-l-4 border-orange-500 hover:shadow-md transition-all">
                                <Link
                                    href={`/admin/forms/${libid}/ebookedit`}
                                    className="block text-orange-900 hover:text-orange-700 font-semibold transition-colors"
                                >
                                    📚 E-Book Database by Subscription for {libraryName} in {currentYear}
                                </Link>
                            </div>
                            <div className="p-5 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-l-4 border-orange-500 hover:shadow-md transition-all">
                                <Link
                                    href={`/admin/forms/${libid}/ejournaledit`}
                                    className="block text-orange-900 hover:text-orange-700 font-semibold transition-colors"
                                >
                                    📰 E-Journal Database by Subscription for {libraryName} in {currentYear}
                                </Link>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-xl shadow-lg border border-purple-200 p-8">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <ClipboardType className="text-white text-sm font-bold" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">My Forms</h2>
                                {libid && formStatusData && (
                                    <FormsAvailabilityBadge
                                        totalForms={forms.length}
                                        isFormsClosed={formStatusData.isFormsClosed}
                                    />
                                )}
                            </div>
                            <p className="text-gray-600">All available forms for your library</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {forms.map((form, index) => (
                                <div
                                    key={index}
                                    className="p-5 border border-purple-200 rounded-lg hover:border-purple-400 hover:shadow-lg transition-all group bg-gradient-to-br from-white to-purple-50/30"
                                >
                                    <Link
                                        href={`/admin/forms/${libid}/${form.href}`}
                                        className="block text-gray-900 hover:text-purple-600 font-semibold transition-colors group-hover:translate-x-1 transform duration-200 no-underline"
                                    >
                                        {form.title}
                                    </Link>
                                    {formStatusData && (
                                        <FormStatusBadge
                                            formHref={form.href}
                                            statusData={formStatusData}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>



                    <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <BadgeQuestionMark className="text-white text-sm font-bold" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
                            </div>
                            <p className="text-gray-600">Common questions and answers about the forms</p>
                        </div>

                        <Accordion type="multiple" className="space-y-4">
                            {Object.keys(dynamicInstructionGroup).map((key, index) => (
                                <AccordionItem
                                    key={index}
                                    value={key}
                                    className="border border-gray-200 rounded-lg px-6 py-2 hover:border-blue-300 transition-colors"
                                >
                                    <AccordionTrigger className="text-left hover:no-underline">
                                        <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">{key}</h3>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4">
                                        <div className="space-y-6">
                                            {(dynamicInstructionGroup[key as InstructionGroupKeys] as { question: string; answer: string }[]).map(
                                                (item, itemIndex) => (
                                                    <div
                                                        key={itemIndex}
                                                        className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg"
                                                    >
                                                        <dt className="font-semibold text-blue-700">{item.question}</dt>
                                                        <dd className="lg:col-span-2 text-gray-700 leading-relaxed">
                                                            <span
                                                                dangerouslySetInnerHTML={{
                                                                    __html: item.answer,
                                                                }}
                                                            />
                                                        </dd>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </section>
                </div>
            </Container>
        </main>
    )
}

export default FormsPage
