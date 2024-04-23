import { Container } from "@/components/Container";
import Link from "next/link";

const AboutPage = () => {
  return (
    <main>
      <h1>About CEAL Statistics Database</h1>

      <Container className="flex flex-col space-y-4">
        <p>
          The Council on East Asian Library (CEAL) Statistics is an annual
          publication of statistical data of East Asian libraries and museum
          collections (volumes held, volumes added gross, current serials, other
          materials, electronic resources), expenditures (expenditures and grant
          support), staffing, and services in North America. CEAL annual
          statistics have been collected and published annually in Journal of
          East Asian Libraries (JEAL) since late 1980s. The online statistics
          database covers CEAL statistics from 1999 to present with a parallel
          hard copy publication of CEAL statistics in the February issue of
          JEAL, the CEAL official publication. Pre-1999 statistics data was
          added in 2007. The database includes North America East Asian
          libraries and museums collection statistics published from 1957 to
          current which contains statistical data from 1869 to current. Quick
          Views, Simple Search, Advance Search in Table and Graph displays, PDF,
          Log-in Views (collection ranking and peer comparison) have been added
          for easy access. Collection data can be subdivided by region and
          funding type. CEAL collection grand total can be viewed from 1957 to
          current in addition to collection median and average data. The variety
          of statistical data collected is similar to that collected by the
          Association of Research Libraries (ARL) and is included in ARL&lsquo;s
          annual statistics (
          <Link href="http://www.arl.org/stats/arlstat/index.html">
            http://www.arl.org/stats/arlstat/index.html
          </Link>
          ) . CEAL statistics focus on East Asian collections and especially
          Chinese, Japanese, and Korean languages resources, staffing, and
          service to support East Asian studies in North America.
        </p>
        <p>
          The database is searchable, with results viewable and printable in
          table (numbers) and graph formats. Member libraries (with password
          access) can view library rankings in categories of collection size,
          expenditures, and grant funding with filters of library type (public
          or private), and/or geographical region, etc. The database is also a
          directory of East Asian collections contact information, URLs of
          online catalogs, library system utilities, and more. The data series
          is the most comprehensive continuing library statistical dataset among
          area studies collections in North America. Statistical data published
          in PDF are available from the Committee&lsquo;s home page (
          <Link href="https://ceal.ku.edu/pdfs">https://ceal.ku.edu/pdfs</Link>
          ).
        </p>
        <p>
          The CEAL Statistics site has been created and maintained by the CEAL
          Statistics Committee located at the University of Kansas Libraries,
          Lawrence, KS since 1999.
        </p>
      </Container>
    </main>
  );
};

export default AboutPage;
