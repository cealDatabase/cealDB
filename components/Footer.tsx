import Link from "next/link";

import { Button } from "@/components/Button";
import { TextField } from "@/components/Fields";
import { ContainerHeadFoot } from "./ContainerHeadFoot";

export function Footer() {
  return (
    <footer className="border-t border-gray-200">
      <ContainerHeadFoot>
        <div className="flex flex-col items-center border-t border-gray-200 pb-12 pt-8 md:flex-row-reverse md:justify-between md:pt-6">
          <form className="flex w-full justify-center md:w-auto">
            <TextField
              type="email"
              aria-label="Email address"
              placeholder="Email address"
              autoComplete="email"
              required
              className="w-60 min-w-0 shrink"
            />
            <Button
              style={{
                color: "#dd6a6a",
                borderColor: "#dd6a6a",
              }}
              type="submit"
              variant="outline"
              className="ml-4 flex-none"
            >
              <span className="hidden lg:inline">Join our newsletter</span>
              <span className="lg:hidden">Join newsletter</span>
            </Button>
          </form>
          {/* <p className="mt-6 text-sm text-gray-500 md:mt-0">
            &copy; Copyright {new Date().getFullYear()}. All rights reserved.
          </p> */}
          <div className="flex flex-col font-light text-gray-500 text-xs">
            <p className="mt-6 me-0 md:me-12 md:mt-0">
              CEAL Statistics by{" "}
              <Link href="https://www.eastasianlib.org">
                Council on East Asian Libraries Statistics
              </Link>{" "}
              is licensed under a{" "}
              <Link href="http://creativecommons.org/licenses/by/3.0">
                Creative Commons Attribution 3.0 Unported License
              </Link>
              .
            </p>
            <p className="mt-6 me-0 md:me-12 md:mt-0">
              Attribution - You must give appropriate credit, provide a link to
              the license, and indicate if changes were made. You may do so in
              any reasonable manner, but not in any way that suggests the
              licensor endorses you or your use. Based on a work at
              https://ceal.ku.edu/
            </p>
          </div>
        </div>
      </ContainerHeadFoot>
    </footer>
  );
}
