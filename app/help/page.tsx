"use client";

import { Container } from "@/components/Container";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Button } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
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
            <Link href="/">https://ceal-db.vercel.app/</Link>
          </p>
        </section>
        <section>
          <h2>New Libraries</h2>
          <p>
            New library/institution need to establish an account to join the
            database. Contact Anlin Yang{" "}
            <Tooltip title="Copy Email Address" placement="top" arrow>
              <Button
                style={{
                  color: "#dd6a6a",
                  borderColor: "#dd6a6a",
                }}
                variant="outlined"
                size="small"
                endIcon={<ContentCopyIcon />}
                onClick={() =>
                  navigator.clipboard.writeText("mailto:anlin.yang@wisc.edu")
                }
              >
                Copy
              </Button>
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
            https://ceal.ku.edu/member/forms/instructions access under Members
            tab.
          </p>
          <p>
            Enter and update your Library Information Form
            (https://ceal.ku.edu/member/library/) which is under Members tab
            follow the &ldquo;My Account&ldquo; link. This form needs to be
            filled and updated every year together with all Online Survey Forms.
          </p>

          <p>
            If you have further questions regarding online forms and this new
            version CEAL Stats database, please contact Dongyun Ni{" "}
            <Tooltip title="Copy Email Address" placement="top" arrow>
              <Button
                style={{
                  color: "#dd6a6a",
                  borderColor: "#dd6a6a",
                }}
                variant="outlined"
                size="small"
                endIcon={<ContentCopyIcon />}
                onClick={() =>
                  navigator.clipboard.writeText("mailto:dni@hawaii.edu")
                }
              >
                Copy
              </Button>
            </Tooltip>
          </p>
        </section>
      </Container>
    </main>
  );
};

export default HelpPage;
