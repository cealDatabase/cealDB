import Link from "next/link";

import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { TextField } from "@/components/Fields";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function Login() {
  return (
    <main>
    <AuthLayout
      title="Login by Your Email"
      subtitle={
        <>
          <div className="text-sm">
            Click to request a new password if you{" "}
            <Link href="/forgot">forgot password.</Link>
            <br />
            CEAL Stats coordinators need to work with their libraries&lsquo;{" "}
            <Link href="/libraries">contact persons</Link> to gain access to the
            database online forms.
          </div>
          <div className="text-xs text-left mt-6">
            You can login to the CEAL Statistics Database to change information
            about your institution. Every library contact person needs to use
            your email as your User ID, and the Password that you used since
            your last log-in. If you forget your password, you can request a new
            password by clicking the &ldquo;Forgot Password&ldquo; button. A system assigned
            password will be sent to individual&lsquo;s mail box. CEAL Stats
            coordinators need to work with their libraries&lsquo; contact persons to
            gain access to the database online forms.
          </div>
        </>
      }
    >
      <form>
        <div className="space-y-6">
          <TextField
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" color="orange" className="mt-8 w-full">
          Sign in to account
        </Button>
      </form>
    </AuthLayout>
    </main>
  );
}
