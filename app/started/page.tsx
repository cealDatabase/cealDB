import { Container } from "@/components/Container";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main>
      <h1>CEAL Statistics Database</h1>
      <Container>
        <section className="space-y-4">
        <h2>Quick Start</h2>
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
          <ul className="list-disc">
            <li>
              <Link href="/statistics/quickview">Quick View</Link> - Provides a
              quick view on the statistics of all institutions, containing
              information about total materials held (including serials).
            </li>
            <li>
              <Link href="/statistics/tableview/basic">Table View (Basic)</Link>{" "}
              - Search the database with year(s) and libraries, and view all the
              data and fields available in individual tables.
            </li>
            <li>
              <Link href="/statistics/tableview/adv">Table View (Advance)</Link>{" "}
              - Search the database with year(s) and libraries, and view the
              data available in individual tables. Unlike basic view, fields to
              display can be customized.
            </li>
            <li>
              <Link href="/statistics/graphview/basic">Graph View (Basic)</Link>{" "}
              - Search the database and view the data available as graphs.
            </li>
            <li>
              <Link href="/statistics/graphview/adv">
                Graph View (Advanced)
              </Link>{" "}
              - Search the database and view the data available as graphs
              .Unlike basic view, fields to display can be customized.
            </li>
            <li>
              <Link href="/statistics/pdf">PDF</Link> - View published data in
              PDF.
            </li>
            <li>
              <Link href="/libraries">Participating Libraries</Link> - Contains
              the list of CEAL participants along with information of CEAL forms
              submitted, sorted by year.
            </li>
            <li>
              <Link href="/libraries">Library Information</Link> - View
              information of CEAL participants.
            </li>
          </ul>
        </section>
      </Container>
    </main>
  );
}
