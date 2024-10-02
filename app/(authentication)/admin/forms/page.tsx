import { Container } from "@/components/Container";
import Link from "next/link";
import { forms, instructions } from "@/constant/form";

import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const FormsPage = () => {
  return (
    <main>
      <h1>Forms Page</h1>
      <Container className="">
        <div className="bg-white rounded-md">
          <div className="mx-auto divide-y divide-gray-900/10 px-6 py-12 sm:py-20 lg:px-8">
            <h2 className="text-2xl font-medium leading-10 tracking-tight text-gray-900">
              Survery Forms
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
              </ul>
            </div>
          </div>
        </div>
        <div className="mx-auto divide-y divide-gray-900/10 px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-medium leading-10 tracking-tight text-gray-900">
            Instruction
          </h2>
          <div className="mt-10 grid grid-cols-12 ">
            <div className="mt-6 space-y-4 sm:col-start-2 col-span-10 leading-7">
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
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="General-Instructions-content"
                id="General-Instructions"
              >
                <h3 className="py-2 md:py-4 font-semibold">
                  General Instructions for Data Submission
                </h3>
              </AccordionSummary>
              <AccordionDetails>
                {instructions.map((instruction, index) => (
                  <div key={index}>
                    {instruction.title ==
                      "General Instructions for Data Submission" && (
                      <div className="lg:grid lg:grid-cols-12 lg:gap-8 mt-4">
                        <dt className="lg:col-span-5 font-medium">
                          {instruction.question}
                        </dt>
                        <dd className="lg:col-span-7">
                          <p className="text-gray-600/90">
                            <span
                              dangerouslySetInnerHTML={{
                                __html: instruction.answer,
                              }}
                            />
                          </p>
                        </dd>
                      </div>
                    )}
                  </div>
                ))}
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="Timeline-content"
                id="Timeline"
              >
                <h3 className="py-2 md:py-4 font-semibold">
                  Survey Time Frame and Publication
                </h3>
              </AccordionSummary>
              <AccordionDetails>
                {instructions.map((instruction, index) => (
                  <div key={index}>
                    {instruction.title ==
                      "Survey Time Frame and Publication" && (
                      <div className="lg:grid lg:grid-cols-12 lg:gap-8 mt-4">
                        <dt className="lg:col-span-5 font-medium">
                          {instruction.question}
                        </dt>
                        <dd className="lg:col-span-7">
                          <p className="text-gray-600/90">
                            <span
                              dangerouslySetInnerHTML={{
                                __html: instruction.answer,
                              }}
                            />
                          </p>
                        </dd>
                      </div>
                    )}
                  </div>
                ))}
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="Accessing-content"
                id="Accessing"
              >
                <h3 className="py-2 md:py-4 font-semibold">
                  Accessing the CEAL Statistics Database
                </h3>
              </AccordionSummary>
              <AccordionDetails>
                {instructions.map((instruction, index) => (
                  <div key={index}>
                    {instruction.title ==
                      "Accessing the CEAL Statistics Database" && (
                      <div className="lg:grid lg:grid-cols-12 lg:gap-8 mt-4">
                        <dt className="lg:col-span-5 font-medium">
                          {instruction.question}
                        </dt>
                        <dd className="lg:col-span-7">
                          <p className="text-gray-600/90">
                            <span
                              dangerouslySetInnerHTML={{
                                __html: instruction.answer,
                              }}
                            />
                          </p>
                        </dd>
                      </div>
                    )}
                  </div>
                ))}
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="Participation-content"
                id="Participation"
              >
                <h3 className="py-2 md:py-4 font-semibold">
                  New Library Participation
                </h3>
              </AccordionSummary>
              <AccordionDetails>
                {instructions.map((instruction, index) => (
                  <div key={index}>
                    {instruction.title == "New Library Participation" && (
                      <div className="lg:grid lg:grid-cols-12 lg:gap-8 mt-4">
                        <dt className="lg:col-span-5 font-medium">
                          {instruction.question}
                        </dt>
                        <dd className="lg:col-span-7">
                          <p className="text-gray-600/90">
                            <span
                              dangerouslySetInnerHTML={{
                                __html: instruction.answer,
                              }}
                            />
                          </p>
                        </dd>
                      </div>
                    )}
                  </div>
                ))}
              </AccordionDetails>
            </Accordion>
          </dl>
        </div>
      </Container>
    </main>
  );
};

export default FormsPage;
