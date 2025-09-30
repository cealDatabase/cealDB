"use client";

import Link from "next/link";
import React from 'react';
import { CheckCircle, XCircle } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { TextField } from "@/components/Fields";
import forgotAction from "./forgotAction";

export default function ForgotPage() {
  const [error, formAction] = React.useActionState(forgotAction, undefined);

  return (
    <AuthLayout
      title="Reset Password"
      subtitle={
        <>
          <div className="text-xs">
            Enter your email address and click the button. Then check
            your email inbox or spam box for the reset link.
            <br />
            CEAL Stats coordinators need to work with their libraries&lsquo;{" "}
            <Link href="/libraries">contact persons</Link> to gain access to the
            database online forms.
          </div>
        </>
      }
    >
      <form action={formAction}>
        <div className="space-y-6">
          <TextField
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
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
          Send Reset Email
        </Button>
      </form>
      {error && error.includes("successfully") && (
        <div className="rounded-md bg-green-50 p-4 mt-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle
                className="h-5 w-5 text-green-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-700">
                {error}
              </h3>
            </div>
          </div>
        </div>
      )
      }

      {error && error.includes("Error") && (
        <div className="rounded-md bg-red-50 p-4 mt-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle
                className="h-5 w-5 text-red-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-700 whitespace-pre-line">
                {error}
              </h3>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
