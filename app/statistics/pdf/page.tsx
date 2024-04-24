import { Container } from "@/components/Container";

const PublishedPDFs = () => {
  return (
    <main>
      <h1>Published Statistics (PDFs)</h1>
      <Container className="flex flex-col space-y-16">
        <section>
          <p>CEAL Statistics PDFs (1999-current)</p>
          <p>CEAL Statistics PDFs (1957-2019/2020)</p>
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
              Council on East Asian Libraries Five-Year Statistical Analysis,
              FY2019–FY2023: Trends and Insights. Journal of East Asian
              Libraries, 2024: no. 178, Article 6.
            </ol>
            <ol>
              Council on East Asian Libraries Statistics 2022-2023: For North
              American Institutions. Journal of East Asian Libraries, 2024: no.
              178, Article 7.
            </ol>
            <ol>
              Lists of Selected Full-text Databases by Subscription in East
              Asian Studies,&ldquo; Journal of East Asian Libraries: Vol. 2024 : No.
              178, Article 8.
            </ol>
          </ul>
          <ul>
            <p className="font-semibold">2021-2022</p>
            <ol>
              Council on East Asian Libraries Statistics 2021-2022: For North
              American Institutions. Journal of East Asian Libraries, 2023: no.
              176, Article 4.
            </ol>
            <ol>
              Lists of Selected Full-text Databases by Subscription in East
              Asian Studies,&ldquo; Journal of East Asian Libraries: Vol. 2023 : No.
              176 , Article 5.
            </ol>
          </ul>
          <ul>
            <p className="font-semibold">2020-2021</p>
            <ol>
              Council on East Asian Libraries Statistics 2020-2021: For North
              American Institutions. Journal of East Asian Libraries, 2022: no.
              174, Article 5.
            </ol>
            <ol>
              Lists of Selected Full-text Databases by Subscription in East
              Asian Studies,&ldquo; Journal of East Asian Libraries: Vol. 2022 : No.
              174 , Article 6.
            </ol>
          </ul>
        </section>
      </Container>
    </main>
  );
};

export default PublishedPDFs;
