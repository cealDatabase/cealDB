"use client";

import { useState } from "react";
import React from "react";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { TextField } from "@/components/Fields";

import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { SingleLibraryType } from "@/types/types"; // Import the LibraryType type

import signupAction from "./signupAction";
import { CheckCircleIcon } from "@heroicons/react/20/solid";

interface SignupResult {
  success: boolean;
  message: string;
  error?: string;
}

export default function SignUpForm({
  libraries,
  roles,
}: {
  libraries: any;
  roles: any;
}) {
  const [result, formAction] = React.useActionState(signupAction, undefined);
  const [institution, setInstitution] = useState("");
  const [userRole, setUserRole] = useState("");

  const handleInstitutionChange = (event: SelectChangeEvent) => {
    setInstitution(event.target.value as string);
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setUserRole(event.target.value as string);
  };

  return (
    <>
      <AuthLayout
        title="Sign Up New Account by Email"
        subtitle={
          <>
            <div className="text-sm">
            This sign up form is for Super Admin only.
            </div>
          </>
        }
      >
        <form action={formAction}>
          <div className="space-y-6">
            <TextField
              label="*Email"
              name="username"
              type="email"
              autoComplete="email"
              required
            />

            <Box sx={{ minWidth: 360 }}>
              <FormControl fullWidth>
                <InputLabel id="institution-label">
                  *Select Institution
                </InputLabel>
                <Select
                  labelId="institution-label"
                  id="institution"
                  name="nameinstitution"
                  value={institution}
                  label="Select an institution"
                  onChange={handleInstitutionChange}
                >
                  {Array.isArray(libraries) &&
                    libraries.map(
                      (library: SingleLibraryType) =>
                        !library.hideinlibrarylist && (
                          <MenuItem value={library.id} key={library.id}>
                            {library.library_name}
                          </MenuItem>
                        )
                    )}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ minWidth: 360 }}>
              <FormControl fullWidth>
                <InputLabel id="userrole-label">*Select Role</InputLabel>
                <Select
                  labelId="userrole-label"
                  name="namerole"
                  value={userRole}
                  label="Select an user role"
                  onChange={handleRoleChange}
                >
                  {Array.isArray(roles) &&
                    roles.map((role: any) => (
                      <MenuItem value={role.id} key={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
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
        {result && result.success && (
          <div className="rounded-md bg-green-50 p-4 mt-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon
                  className="h-5 w-5 text-green-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-700">
                  Success! {result.message}
                </h3>
              </div>
            </div>
          </div>
        )}
        {result && !result.success && (
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
                  Error! {result.error}
                </h3>
              </div>
            </div>
          </div>
        )}
      </AuthLayout>
    </>
  );
}
