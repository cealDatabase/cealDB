"use client";

import Link from "next/link";
import React from "react";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { TextField } from "@/components/Fields";
import signinAction from "./signinAction";

export default function SignInPage() {
  const [error, formAction] = React.useActionState(signinAction, undefined);

  return (
    <AuthLayout
      title="Sign in by Your Username"
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
            You can sign in to the CEAL Statistics Database to change
            information about your institution. Every library contact person
            needs to use your email as your User ID, and the Password that you
            used since your last sign-in. If you forget your password, you can
            request a new password by clicking the &ldquo;Forgot Password&ldquo;
            button. A system assigned password will be sent to
            individual&lsquo;s mail box. CEAL Stats coordinators need to work
            with their libraries&lsquo; contact persons to gain access to the
            database online forms.
          </div>
        </>
      }
    >
      <form action={formAction}>
        <div className="space-y-6">
          <TextField
            label="Username same as email"
            name="username"
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
          Sign in to Account
        </Button>
      </form>
      {error && (
        <div className="rounded-md bg-red-50 p-4 mt-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon
                className="h-5 w-5 text-red-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-700">
                Error! {error}
              </h3>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
