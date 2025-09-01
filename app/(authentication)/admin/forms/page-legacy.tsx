import { cookies } from "next/headers";
import { Container } from "@/components/Container";
import Link from "next/link";
import { forms, instructionGroup } from "@/constant/form";

type InstructionGroupKeys = keyof typeof instructionGroup;

import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FormsPage = async () => {
  const cookieStore = await cookies();
  const library = cookieStore.get("library");
  const libid = library?.value;

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const nextYear = currentYear + 1;

  return (
    <main>
      <h1>Forms Page</h1>
      <Container className="">
        <div className="bg-white rounded-md">
          <div className="mx-auto divide-y divide-gray-900/10 px-6 py-12 sm:py-20 lg:px-8">
            <h2 className="text-2xl font-medium leading-10 tracking-tight text-gray-900">
              Complete These First
            </h2>
            <div className="mt-10 gap-x-2 text-lg">
              <ul className="">
                <li key="ebook" className="list-disc">
                  <Link href={`/admin/forms/${libid}/ebookedit`}>
                    E-Book Database by Subscription for McGill Library in {currentYear}
                  </Link>
                </li>
                <li key="ejournal" className="list-disc">
                  <Link href={`/admin/forms/${libid}/ejournaledit`}>
                    E-Journal Database by Subscription for McGill Library in {currentYear}
                  </Link>
                </li>
                <li key="avdb" className="list-disc">
                  <Link href={`/admin/forms/${libid}/avdbedit`}>
                    Audio/Visual Database by Subscription for McGill Library in {currentYear}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mx-auto divide-y divide-gray-900/10 px-6 py-12 sm:py-20 lg:px-8">
            <h2 className="text-2xl font-medium leading-10 tracking-tight text-gray-900">
              My Forms
            </h2>
            <div className="mt-10 grid grid-cols-12 gap-x-2">
              {/* Single column layout for small/medium screens */}
              <ul className="mt-6 space-y-4 sm:col-start-2 col-span-12 lg:hidden">
                {forms.map((form, index) => (
                  <li key={index} className="list-decimal">
                    <Link href={`/admin/forms/${libid}/${form.href}`}>{form.title}</Link>
                  </li>
                ))}
              </ul>

              {/* Two column layout for large screens */}
              <div className="hidden lg:block lg:col-start-2 lg:col-span-10">
                <ul className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 list-decimal">
                  {forms.map((form, index) => (
                    <li key={index} className="min-h-[2rem]">
                      <Link href={`/admin/forms/${libid}/${form.href}`}>{form.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto divide-y divide-gray-900/10 px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-medium leading-10 tracking-tight text-gray-900">
            Instruction
          </h2>
          <div className="mt-10 grid grid-cols-12 ">
            <div className="mt-6 space-y-4 md:col-start-2 col-span-12 md:col-span-10 leading-7">
              <p>
                The {previousYear}-{currentYear} CEAL Statistics Online Survey input/edit period is
                from October 1 to December 1, {currentYear}, with the results published
                in the February {nextYear} issue of the Journal of East Asian
                Libraries. The survey covers the fiscal year from July 1, {previousYear},
                to June 30, {currentYear}, with all figures rounded to whole numbers and
                currency converted to US dollars. Non-CJK items refer to non-CJK
                language materials related to East Asia. Each institution,
                except law libraries, should submit a combined report, and
                significant data changes must be footnoted. Participants must
                log in to the CEAL Statistics Database using the registered
                contact&apos;s email and follow the password setup process if
                necessary. New libraries wanting to participate should contact
                vdoll[at]ku.edu for account setup.
              </p>
              <p className="font-medium">
                Check on{" "}
                <a href="https://guides.lib.ku.edu/CEAL_Stats">
                  https://guides.lib.ku.edu/CEAL_Stats
                </a>{" "}
                for detailed instructions.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-full px-6 lg:px-8">
          <h2 className="text-2xl font-medium leading-10 tracking-tight text-gray-900">
            Frequently Asked Questions
          </h2>
          <dl className="mt-10 space-y-6">
            <Accordion type="multiple">
              {Object.keys(instructionGroup).map((key, index) => {
                return (
                  <AccordionItem key={index} value={key}>
                    <AccordionTrigger
                      aria-controls={key}
                      id={key}
                      key={index}
                    >
                      <h3 className="py-2 font-medium">
                        {key}
                      </h3>
                    </AccordionTrigger>
                    <AccordionContent>
                      {(instructionGroup[key as InstructionGroupKeys] as { question: string; answer: string }[]).map((item, index) => (
                        <div key={index}>
                          <div className="lg:grid lg:grid-cols-12 lg:gap-8 mt-4">
                            <dt className="lg:col-span-5 font-medium text-gray-800">
                              {item.question}
                            </dt>
                            <dd className="lg:col-span-7">
                              <p className="text-gray-600/90">
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: item.answer,
                                  }}
                                />
                              </p>
                            </dd>
                          </div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </dl>
        </div >
      </Container >
    </main >
  );
};

export default FormsPage;
