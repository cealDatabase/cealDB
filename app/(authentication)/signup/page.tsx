"use client";

import Link from "next/link";
import { AuthLayout } from "@/components/AuthLayout";
import { useFormState } from "react-dom";
import { Button } from "@/components/Button";
import { TextField } from "@/components/Fields";
import signupAction from "./signupAction";

export default function SignUpPage() {
  const [error, formAction] = useFormState(signupAction, undefined);

  return (
    <>
      <AuthLayout
        title="Sign Up New Account by Email"
        subtitle={
          <>
            <div className="text-sm">
              CEAL Stats coordinators need to work with their libraries&lsquo;{" "}
              <Link href="/libraries">contact persons</Link> to gain access to
              the database online forms.
            </div>
          </>
        }
      >
        <form action={formAction}>
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
          <Button
            variant="outline"
            style={{
              color: "#dd6a6a",
              borderColor: "#dd6a6a",
            }}
            type="submit"
            className="mt-8 w-full"
          >
            Sign Up
          </Button>
        </form>
      </AuthLayout>
      {error && <p>{error}</p>}
    </>
  );
}
