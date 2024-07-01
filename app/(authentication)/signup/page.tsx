"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { AuthLayout } from "@/components/AuthLayout";
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
              label="Username Same as Email"
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
            <TextField
              label="Role Number"
              name="role"
              type="number"
              autoComplete="role"
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
    </>
  );
}
