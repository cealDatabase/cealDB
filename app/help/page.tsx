"use client";

import { Container } from "@/components/Container";
import { Copy, Download, FileText } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from "next/link";

const HelpPage = () => {
  return (
    <main>
      <h1>Help Page</h1>
      <Container>

        <section>
          <h2>Quick Guide for Institutional Users</h2>
          <p className="mb-4">
            This quick guide walks you through the basic steps to log in, view your institutional dashboard,
            and complete the annual survey forms in the new CEAL Statistics Database.
          </p>

          <div className="flex flex-col gap-3">
            {/* Example: User Guide PDF */}
            <Link
              href="/docs/user-guide.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors group max-w-md no-underline"
            >
              <FileText className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="font-semibold text-green-900">User Guide</p>
                <p className="text-sm text-green-700">Step-by-step database usage guide</p>
              </div>
              <Download className="w-5 h-5 text-green-600 group-hover:translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </section>


        <section>
          <h2>New Libraries</h2>
          <p>
            New library/institution need to establish an account to join the
            database. Contact CEAL Statistics Committee{" "}
            <Link href="https://www.eastasianlib.org/newsite/statistics/" target="_blank">https://www.eastasianlib.org/newsite/statistics/</Link>
            {" "}to complete a new Library Information Form. The Library Information
            Form is used as an application to join the CEAL Statistics annual
            survey.
          </p>
        </section>


      </Container>
    </main>
  );
};

export default HelpPage;
