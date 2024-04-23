"use client"

import { Container } from "@/components/Container";
import Button from '@mui/material/Button';
import Link from "next/link";

const HelpPage = () => {
  function copyEmail(){
    return ("mailto:anlin.yang@wisc.edu")
  }
  return (
    <main>
      <h1>Help Page</h1>
      <Container className="flex flex-col space-y-4">
        <h2>How to Cite</h2>
        <p>
          Council on East Asian Libraries. Council on East Asian Libraries
          Statistics. in University of Kansas Libraries [database online].
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Lawrence,
          KS, ©2024. Available from{" "}
          <Link href="/">https://ceal-db.vercel.app/</Link>
        </p>
        <h2>New Libraries</h2>
        <p>
          New library/institution need to establish an account to join the
          database. Contact <Button onClick={copyEmail} variant="outlined" size="small">Anlin Yang</Button> to complete a new
          Library Information Form. The Library Information Form is used as an
          application to join the CEAL Statistics annual survey.
        </p>
        <h2>Change Password</h2>

        <h2>CEAL Statistics Online Forms</h2>
      </Container>
    </main>
  );
};

export default HelpPage;