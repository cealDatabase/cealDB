import { Container } from "@/components/Container";
import Link from "next/link";

function generateYears(startYear: number, endYear: number) {
  const years = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year.toString() + "-" + (year + 1).toString());
  }
  return years;
}

const YearStatPDF = () => {
  return (
    <main>
      <h1 className="pb-4">CEAL Statistics PDFs</h1>
      <div className="text-2xl text-gray-700">From 1957 to 2019/2020</div>
      <Container className="bg-gray-100 rounded-lg mt-10">
        <div className="mt-2">
          <dl className="divide-y divide-gray-400 ">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
              <dt className="text-gray-500 font-medium">2020 - Present</dt>
              <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                <div className="grid grid-cols-4 gap-6">
                  {generateYears(2020, 2024).map((year) => (
                    <Link href="" key={year}>
                      {year}
                    </Link>
                  ))}
                </div>
              </dd>
            </div>

            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
              <dt className="text-gray-500 font-medium">2010 - 2019</dt>
              <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                <div className="grid grid-cols-4 gap-6">
                  {generateYears(2010, 2019).map((year) => (
                    <Link href="" key={year}>
                      {year}
                    </Link>
                  ))}
                </div>
              </dd>
            </div>

            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
              <dt className="text-gray-500 font-medium">2000 - 2009</dt>
              <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                <div className="grid grid-cols-4 gap-6">
                  {generateYears(2000, 2009).map((year) => (
                    <Link href="" key={year}>
                      {year}
                    </Link>
                  ))}
                </div>
              </dd>
            </div>

            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
              <dt className="text-gray-500 font-medium">1990 - 1999</dt>
              <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                <div className="grid grid-cols-4 gap-6">
                  {generateYears(1990, 1999).map((year) => (
                    <Link href="" key={year}>
                      {year === "1998-1999" ? `${year} rev.` : year}
                    </Link>
                  ))}
                </div>
              </dd>
            </div>

            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
              <dt className="text-gray-500 font-medium">1969 - 1989</dt>
              <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                <div className="grid grid-cols-4 gap-6">
                  <Link href="" key="1970">
                    1970 and Pre 1970
                  </Link>
                  <Link href="" key="1973">
                    1973
                  </Link>
                  <Link href="" key="1969-1975">
                    1969-1975
                  </Link>
                  <Link href="" key="1975">
                    1975
                  </Link>
                  <Link href="" key="1979-1980">
                    1979-1980
                  </Link>
                  {generateYears(1987, 1989).map((year) => (
                    <Link href="" key={year}>
                      {year}
                    </Link>
                  ))}
                </div>
              </dd>
            </div>

            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
              <dt className="text-gray-500 font-medium">1968 and Before</dt>
              <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
                <div className="grid grid-cols-4 gap-6">
                  <Link href="">
                    1930-1975 <br />
                    <span className="text-sm text-gray-500">
                      Growth of 15 Major E. Asian Collections
                    </span>
                  </Link>
                  <Link href="">
                    1957
                    <br />
                    <span className="text-sm text-gray-500">
                      includes data from 1869
                    </span>
                  </Link>
                  {[1964, 1965, 1967, 1968].map((year) => (
                    <Link href="" key={year}>
                      {year}
                    </Link>
                  ))}
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </Container>
    </main>
  );
};

export default YearStatPDF;
