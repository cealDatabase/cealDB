"use client";

import { Container } from "@/components/Container";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
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
          <h2>How to Cite</h2>
          <p>
            Council on East Asian Libraries. Council on East Asian Libraries
            Statistics. in University of Kansas Libraries [database online].
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Lawrence,
            KS, ©2024. Available from{" "}
            <Link href="https://ceal.ku.edu/">https://ceal.ku.edu/</Link>
          </p>
        </section>
        <section>
          <h2>New Libraries</h2>
          <p>
            New library/institution need to establish an account to join the
            database. Contact Anlin Yang{" "}

            <Tooltip>
              <TooltipTrigger>
                <Link
                  href=""
                  type="button"
                  style={{
                    color: "#dd6a6a",
                    borderColor: "#dd6a6a",
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #dd6a6a",
                    borderRadius: "8px",
                    padding: "2px 8px",
                    fontSize: "12px",
                  }}
                  onClick={() =>
                    navigator.clipboard.writeText("mailto:anlin.yang@wisc.edu")
                  }
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  Copy
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy Email Address</p>
              </TooltipContent>
            </Tooltip>{" "}
            to complete a new Library Information Form. The Library Information
            Form is used as an application to join the CEAL Statistics annual
            survey.
          </p>
        </section>
        <section>
          <h2>Change Password</h2>
          <p>From CEAL Database:</p>
          <ul className="list-decimal">
            <li>Log-in to the database as a user</li>
            <li>
              After you log in to the database, you can change your password
              immediately by clicking on Change Password link. (Tip: &ldquo;To
              increase security, please choose a password that does not relate
              directly to you. Do not use your first name or birthday. Your
              password is NOT case sensitive. You can use both numeric and
              character values.&ldquo;).
            </li>
          </ul>
        </section>
        <section>
          <h2>CEAL Statistics Online Forms</h2>
          <p>
            You may find complete instruction for online form each year in
            <Link href="https://ceal.ku.edu/member/forms/instructions">
              https://ceal.ku.edu/member/forms/instructions
            </Link>{" "}
            access under Members tab.
          </p>
          <p>
            Enter and update your Library Information Form (
            <Link href="https://ceal.ku.edu/member/library/">
              https://ceal.ku.edu/member/library/
            </Link>
            ) which is under Members tab follow the &ldquo;My Account&ldquo;
            link. This form needs to be filled and updated every year together
            with all Online Survey Forms.
          </p>

          <p>
            If you have further questions regarding online forms and this new
            version CEAL Stats database, please contact Dongyun Ni{" "}
            <Tooltip>
              <TooltipTrigger>
                <Link
                  href=""
                  type="button"
                  style={{
                    color: "#dd6a6a",
                    borderColor: "#dd6a6a",
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #dd6a6a",
                    borderRadius: "8px",
                    padding: "2px 8px",
                    fontSize: "12px",
                  }}

                  onClick={() =>
                    navigator.clipboard.writeText("mailto:dni@hawaii.edu")
                  }
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  Copy
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy Email Address</p>
              </TooltipContent>
            </Tooltip>
          </p>
        </section>
      </Container>
    </main>
  );
};

export default HelpPage;
