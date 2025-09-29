"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import React from "react";
import { Button } from "@/components/Button";
import { MainMenu } from "@/constant/nav";
import { StatisticsMenu } from "@/constant/nav";
import { UserCircle, Menu, X, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Removed Dialog and Collapsible imports - using basic React state instead

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
export function HeaderComponent({
  loggedIn,
  logoutAction,
}: {
  loggedIn: boolean;
  logoutAction: React.ReactElement;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statisticsOpen, setStatisticsOpen] = useState(false);

  return (
    <header className="relative isolate z-10 border-b-2 border-gray-400">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        <div className="flex">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">
              The Council on East Asian Libraries (CEAL) Statistics
            </span>
            <img className="h-18 w-auto" src="/logo.png" alt="CEAL logo" />
          </Link>
        </div>
        {/* Mobile hamburger button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        {/* End of hamburger button */}

        <div className="hidden lg:flex lg:gap-x-12">
          <Link
            href="/"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Home
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 focus:outline-none">
              Statistics
              <ChevronDown
                className="h-5 w-5 flex-none text-gray-400"
                aria-hidden="true"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mx-auto grid max-w-7xl bg-white shadow-lg ring-1 ring-gray-900/5 p-6" align="start">
              <div className="grid grid-cols-4 gap-x-4 gap-y-6">
                {StatisticsMenu.map((item) => (
                  <DropdownMenuItem key={item.name} asChild className="cursor-pointer p-0 h-auto">
                    <Link href={item.href} className="group relative rounded-lg p-6 text-sm leading-6 hover:bg-gray-50 flex flex-col items-start no-underline">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white mb-4">
                        <item.icon
                          className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="font-semibold text-gray-900">{item.name}</div>
                      <p className="mt-1 text-gray-600">{item.description}</p>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {[...MainMenu].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:justify-end gap-x-4">
          <div className="flex flex-row gap-4">
            {!loggedIn ? (
              <Button href="/signin" variant="outline" color="white">
                Sign in
              </Button>
            ) : (
              <>
                <Link href="/admin">
                  <UserCircle className="h-10 w-10 text-gray-900" />
                </Link>
                <div
                  className="inline-flex justify-center rounded-lg py-2 px-3 text-sm font-semibold transition-colors 
                bg-gray-800 text-white hover:bg-gray-900 active:bg-gray-800 active:text-white/80"
                >
                  {logoutAction}
                </div>
              </>
            )}

            <Button href="/help">Help</Button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-10">
          <div className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">
                The Council on East Asian Libraries (CEAL) Statistics
              </span>
              <img className="h-18 w-auto" src="/logo.png" alt="CEAL logo" />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Link
                  href="/"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Home
                </Link>
                <div className="-mx-3">
                  <button 
                    onClick={() => setStatisticsOpen(!statisticsOpen)}
                    className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    Statistics
                    <ChevronDown
                      className={classNames(
                        statisticsOpen ? "rotate-180" : "",
                        "h-5 w-5 flex-none"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {statisticsOpen && (
                    <div className="mt-2 space-y-2">
                      {[...StatisticsMenu].map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50 no-underline"
                          >
                            {item.name}
                          </Link>
                        ))}
                    </div>
                  )}
                </div>

                {[...MainMenu].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                {!loggedIn ? (
                  <Link
                    href="/signin"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    Sign in
                  </Link>
                ) : (
                  <div className="flex flex-col gap-y-2 my-2">
                    <Link href="/admin" className="text-gray-900">My Account</Link>
                    {logoutAction}
                  </div>
                )}
                <Link href="/help">Help</Link>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
    </header>
  );
}
