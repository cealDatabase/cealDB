import { Container } from "@/components/Container";
import Link from "next/link";
const FormsPage = () => {
  const forms = [
    {
      id: 1,
      title: "Monographic Acquisitions",
      href: "",
    },
    {
      id: 2,
      title: "Physical Volume Holdings",
      href: "",
    },
    {
      id: 3,
      title: "Serial Titles: Purchased and Non-Purchased",
      href: "",
    },
    {
      id: 4,
      title: "Holdings of Other Materials",
      href: "",
    },
    {
      id: 5,
      title: "Unprocessed BackLog Materials (volumes or pieces)",
      href: "",
    },
    {
      id: 6,
      title: "Fiscal Support",
      href: "",
    },
    {
      id: 7,
      title: "Personnel Support",
      href: "",
    },
    {
      id: 8,
      title: "Public Services",
      href: "",
    },
    {
      id: 9,
      title: "Electronic",
      href: "",
    },
    {
      id: 10,
      title: "Electronic Books",
      href: "",
    },
  ];

  const instructions = [
    {
      id: 1,
      question: "What's the best thing about Switzerland?",
      answer:
        "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
    },
    // More questions...
  ];

  return (
    <main>
      <h1>Forms Page</h1>
      <Container className="">
        <div className="bg-white rounded-md">
          <div className="mx-auto max-w-7xl divide-y divide-gray-900/10 px-6 py-12 sm:py-20 lg:px-8">
            <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
              Survery Forms
            </h2>
            <div className="mt-10 grid grid-cols-12 gap-x-2">
              <ul className="mt-6 space-y-4 sm:col-start-2 col-span-12 sm:col-span-6">
                {forms.map((form) => (
                  <li
                    key={form.id}
                    className="list-decimal text-base font-semibold"
                  >
                    <Link href={form.href}>{form.title}</Link>
                  </li>
                ))}
              </ul>
              <ul className="mt-6 space-y-4 col-span-12 sm:col-span-4">
                <li key="ebook" className="list-disc text-base font-semibold">
                  <Link href="/ebook">
                    E-Book Database by Subscription for McGill Library in 2024
                  </Link>
                </li>
                <li
                  key="ejournal"
                  className="list-disc text-base font-semibold"
                >
                  <Link href="/ejournal">
                    E-Journal Database by Subscription for McGill Library in
                    2024
                  </Link>
                </li>
                <li key="avdb" className="list-disc text-base font-semibold">
                  <Link href="/avdb">
                    Audio/Visual Database by Subscription for McGill Library in
                    2024
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="">
          <div className="mx-auto max-w-7xl divide-y divide-gray-900/10 px-6 py-12 lg:px-8 lg:py-24">
            <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
              Instructions
            </h2>
            <dl className="mt-10 space-y-8 ">
              {instructions.map((instruction) => (
                <div
                  key={instruction.id}
                  className="pt-8 lg:grid lg:grid-cols-12 lg:gap-8"
                >
                  <dt className="text-base font-semibold leading-7 text-gray-900 lg:col-span-5">
                    {instruction.question}
                  </dt>
                  <dd className="mt-4 lg:col-span-7 lg:mt-0">
                    <p className="text-base leading-7 text-gray-600">
                      {instruction.answer}
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </main>
  );
};

export default FormsPage;
