import { Container } from "@/components/Container";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="mb-12">
      <h1>CEAL Statistics Database</h1>
      <Container className="flex flex-col space-y-8">
        <section className="space-y-4">
          <p>
            The Council on East Asian Libraries (CEAL) Statistics is an annual
            publication of statistical data of East Asian libraries and museum
            collections (volumes held, volumes added gross, current serials,
            other materials, electronic resources), expenditures (expenditures
            and grant support), staffing, and services in North America. CEAL
            annual statistics have been collected and published annually in the
            Journal of East Asian Libraries (JEAL) since the late 1980s. The
            online statistics database covers CEAL statistics from 1999 to
            present with a parallel hard copy publication of CEAL statistics in
            the February issue of JEAL, the CEAL official publication. Pre 1999
            statistics data was added in 2007. The database includes North
            American East Asian libraries and museums collection statistics
            published from 1957 to present and contains statistical data from
            1869 to present. Quick Views, Simple Search, Advanced Search in
            Table and Graph displays, PDF, and Log-in Views (collection ranking
            and peer comparison) have been added for easy access. Collection
            data can be subdivided by region and funding type. The CEAL
            collection grand total can be viewed from 1957 to present in
            addition to collection median and average data. The variety of the
            statistical data collected is similar to that collected by the{" "}
            <Link href="https://www.arl.org/">
              Association of Research Libraries (ARL)
            </Link>{" "}
            and is included in ARL&lsquo;s annual statistics. The scope of the
            CEAL statistics focuses on East Asian libraries and collections and
            especially Chinese, Japanese, and Korean languages resources,
            staffing, and service to support East Asian studies in North
            America.
          </p>
          <p>
            The database is searchable, with results viewable and printable in
            table (numbers) and graph formats. Member libraries (with password
            access) can view library rankings in categories of collection size,
            expenditures, and grant funding with filters for library type
            (public or private), and/or geographical region, etc. The database
            is also serves as a directory of East Asian collections information.
            The data series is the most comprehensive continuing library
            statistical dataset among area studies collections in North America.{" "}
            <Link href="statistics/pdf">Statistical data published in PDF</Link>{" "}
            are available from the web site.
          </p>
          <p>
            The CEAL Statistics site has been created and maintained by the CEAL
            Statistics Committee located at the University of Kansas Libraries,
            Lawrence, KS since 1999.
          </p>
          <p className="font-semibold">
            For new users of this database, please click{" "}
            <Link href="/help">here</Link> for more information.
          </p>
          <p className="font-semibold">
            Certain data, such as tables with derived statistical data, can only
            be accessed by members. Please <Link href="help">contact us</Link>{" "}
            for information about membership.
          </p>
        </section>

        <section>
          <h2>Searching the database</h2>
          <ul className="list-disc list-inside">
            <li>
              Quick View - Provides a quick view on the statistics of all
              institutions, containing information about total materials held
              (including serials).
            </li>
            <li>
              Table View (Basic) - Search the database with year(s) and
              libraries, and view all the data and fields available in
              individual tables.
            </li>
            <li>
              Table View (Advance) - Search the database with year(s) and
              libraries, and view the data available in individual tables.
              Unlike basic view, fields to display can be customized.
            </li>
            <li>
              Graph View (Basic) - Search the database and view the data
              available as graphs.
            </li>
            <li>
              Graph View (Advanced) - Search the database and view the data
              available as graphs .Unlike basic view, fields to display can be
              customized.
            </li>
            <li><Link href="/statistics/pdf">PDF</Link> - View published data in PDF.</li>
            <li>
              Participating Libraries - Contains the list of CEAL participants
              along with information of CEAL forms submitted, sorted by year.
            </li>
            <li>
              Library Information - View information of CEAL participants.
            </li>
          </ul>
        </section>
      </Container>
    </main>
  );
}
