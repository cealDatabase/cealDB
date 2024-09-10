import { Container } from "@/components/Container";
import Link from "next/link";

const PublishedPDFs = () => {
  return (
    <main>
      <h1>Published Statistics (PDFs)</h1>
      <Container>
        <section>
          <p><Link href="/statistics/pdf/">CEAL Statistics PDFs (1999-current)</Link></p>
          <p><Link href="/statistics/pdf/year-pdf-version">CEAL Statistics PDFs (1957-2019/2020)</Link></p>
          <p>
            CEAL Statistics publications citation (The Committee wishes to thank
            Dr. Tsuen-Hsuin Tsien 錢存訓 for his generous support and permission
            to use his publications in pdf)
          </p>
        </section>
        <section className="flex flex-col space-y-4">
          <ul>
            <p className="font-semibold">2022-2023</p>
            <ol>
              <Link href="/">Council on East Asian Libraries Five-Year Statistical Analysis,
              FY2019–FY2023: Trends and Insights</Link>. Journal of East Asian
              Libraries, 2024: no. 178, Article 6.
            </ol>
            <ol>
            <Link href="/">Council on East Asian Libraries Statistics 2022-2023: For North
              American Institutions</Link>. Journal of East Asian Libraries, 2024: no.
              178, Article 7.
            </ol>
            <ol>
            <Link href="/">Lists of Selected Full-text Databases by Subscription in East
              Asian Studies</Link>. Journal of East Asian Libraries: Vol. 2024 : No.
              178, Article 8.
            </ol>
          </ul>
          <ul>
            <p className="font-semibold">2021-2022</p>
            <ol>
            <Link href="/">Council on East Asian Libraries Statistics 2021-2022: For North
              American Institutions</Link>. Journal of East Asian Libraries, 2023: no.
              176, Article 4.
            </ol>
            <ol>
            <Link href="/">Lists of Selected Full-text Databases by Subscription in East
              Asian Studies</Link>. Journal of East Asian Libraries: Vol. 2023 : No.
              176 , Article 5.
            </ol>
          </ul>
          <ul>
            <p className="font-semibold">2020-2021</p>
            <ol>
            <Link href="/">Council on East Asian Libraries Statistics 2020-2021: For North
              American Institutions</Link>. Journal of East Asian Libraries, 2022: no.
              174, Article 5.
            </ol>
            <ol>
            <Link href="/">Lists of Selected Full-text Databases by Subscription in East
              Asian Studies</Link>. Journal of East Asian Libraries: Vol. 2022 : No.
              174 , Article 6.
            </ol>
          </ul>
        </section>
      </Container>
    </main>
  );
};

export default PublishedPDFs;
