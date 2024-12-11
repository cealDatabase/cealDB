import { Container } from "@/components/Container";
import Link from "next/link";
import { forms, instructionGroup } from "@/constant/form";

type InstructionGroupKeys = keyof typeof instructionGroup;

import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

const FormsPage = () => {
  return (
    <main>
      <h1>Forms Page</h1>
      <Container className="">
        <div className="bg-white rounded-md">
          <div className="mx-auto divide-y divide-gray-900/10 px-6 py-12 sm:py-20 lg:px-8">
            <h2 className="text-2xl font-medium leading-10 tracking-tight text-gray-900">
              My Forms
            </h2>
            <div className="mt-10 grid grid-cols-12 gap-x-2">
              <ul className="mt-6 space-y-4 sm:col-start-2 col-span-12 sm:col-span-6">
                {forms.map((form, index) => (
                  <li key={index} className="list-decimal">
                    <Link href={form.href}>{form.title}</Link>
                  </li>
                ))}
              </ul>
              <ul className="mt-6 space-y-4 col-span-12 sm:col-span-4">
                <li key="ebook" className="list-disc">
                  <Link href="/admin/forms/ebookedit">
                    E-Book Database by Subscription for McGill Library in 2024
                  </Link>
                </li>
                <li key="ejournal" className="list-disc">
                  <Link href="/admin/forms/ejournaledit">
                    E-Journal Database by Subscription for McGill Library in
                    2024
                  </Link>
                </li>
                <li key="avdb" className="list-disc">
                  <Link href="/admin/forms/avdbedit">
                    Audio/Visual Database by Subscription for McGill Library in
                    2024
                  </Link>
                </li>
                <li key="avdb" className="list-disc">
                  <Link href="/admin/forms/tasks">
                    Template-task
                  </Link>
                </li>
              </ul>
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
                The 2023-2024 CEAL Statistics Online Survey input/edit period is
                from October 1 to December 1, 2024, with the results published
                in the February 2024 issue of the Journal of East Asian
                Libraries. The survey covers the fiscal year from July 1, 2022,
                to June 30, 2023, with all figures rounded to whole numbers and
                currency converted to US dollars. Non-CJK items refer to non-CJK
                language materials related to East Asia. Each institution,
                except law libraries, should submit a combined report, and
                significant data changes must be footnoted. Participants must
                log in to the CEAL Statistics Database using the registered
                contact's email and follow the password setup process if
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

        <div className="mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-medium leading-10 tracking-tight text-gray-900">
            Frequently Asked Questions
          </h2>
          <dl className="mt-10 space-y-6">
            {Object.keys(instructionGroup).map((key, index) => {
              return (
                <Accordion key={index} className="rounded-md">
                  <AccordionSummary
                    aria-controls={key}
                    id={key}
                    key={index}
                  >
                    <h3 className="py-2 font-medium">
                      {key}
                    </h3>
                  </AccordionSummary>
                  <AccordionDetails>
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
                  </AccordionDetails>
                </Accordion>
              )
            })}
          </dl>
        </div >
      </Container >
    </main >
  );
};

export default FormsPage;
