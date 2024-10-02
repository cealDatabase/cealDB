import { Container } from "@/components/Container";
import Link from "next/link";
import { forms, instructions } from "@/constant/form";

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
                  <Link href="/ebookedit">
                    E-Book Database by Subscription for McGill Library in 2024
                  </Link>
                </li>
                <li key="ejournal" className="list-disc">
                  <Link href="/ejournaledit">
                    E-Journal Database by Subscription for McGill Library in
                    2024
                  </Link>
                </li>
                <li key="avdb" className="list-disc">
                  <Link href="/avdbedit">
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
          <div className="mt-10 grid grid-cols-12">
            <div className="mt-6 space-y-4 sm:col-start-2 col-span-10 font-medium leading-7">
              The 2023-2024 CEAL Statistics Online Survey input/edit period is
              from October 1 to December 1, 2024, with the results published in
              the February 2024 issue of the Journal of East Asian Libraries.
              The survey covers the fiscal year from July 1, 2022, to June 30,
              2023, with all figures rounded to whole numbers and currency
              converted to US dollars. Non-CJK items refer to non-CJK language
              materials related to East Asia. Each institution, except law
              libraries, should submit a combined report, and significant data
              changes must be footnoted. Participants must log in to the CEAL
              Statistics Database using the registered contact's email and
              follow the password setup process if necessary. New libraries
              wanting to participate should contact vdoll[at]ku.edu for account
              setup.
            </div>
          </div>
        </div>

        <div className="mx-auto divide-y divide-gray-900/10 px-6 lg:px-8">
          <h2 className="text-2xl font-medium leading-10 tracking-tight text-gray-900">
            Frequently Asked Questions
          </h2>
          <dl className="mt-10 space-y-6 py-8">
            {instructions.map((instruction, index) => (
              <div key={index}>
                {instruction.title && (
                  <h3 className="mt-4 py-2 md:py-8 text-stone-900 font-semibold">
                    {instruction.title}
                  </h3>
                )}
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                  <dt className="lg:col-span-5">{instruction.question}</dt>
                  <dd className="lg:col-span-7 lg:mt-0">
                    <p className="text-gray-600/90">
                      <span
                        dangerouslySetInnerHTML={{ __html: instruction.answer }}
                      />
                    </p>
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </main>
  );
};

export default FormsPage;
