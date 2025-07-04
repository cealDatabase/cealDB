"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { Button } from "@/components/Button";
import { MainMenu } from "@/constant/nav";
import { StatisticsMenu } from "@/constant/nav";
import CEALMainWebButton from "@/components/CEALMainWebButton";
import { UserCircleIcon } from "@heroicons/react/24/solid";

import {
  Dialog,
  DialogPanel,
  Disclosure,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Transition,
} from "@headlessui/react";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export function HeaderComponent({
  loggedIn,
  logoutAction,
}: {
  loggedIn: boolean;
  logoutAction: any;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative isolate z-10 border-b-2 border-gray-400">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">
              The Council on East Asian Libraries (CEAL) Statistics
            </span>
            <img className="h-18 w-auto" src="/logo.png" alt="CEAL logo" />
          </a>
        </div>
        {/* Mobile hamburger button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        {/* End of hamburger button */}

        <PopoverGroup className="hidden lg:flex lg:gap-x-12">
          <Link
            href="/"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Home
          </Link>
          <Popover>
            <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900">
              Statistics
              <ChevronDownIcon
                className="h-5 w-5 flex-none text-gray-400"
                aria-hidden="true"
              />
            </PopoverButton>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 -translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 -translate-y-1"
            >
              <PopoverPanel className="absolute inset-x-0 top-0 -z-10 bg-white pt-14 shadow-lg ring-1 ring-gray-900/5">
                <div className="mx-auto grid max-w-7xl grid-cols-4 gap-x-4 px-6 py-10 lg:px-8 xl:gap-x-8">
                  {StatisticsMenu.map((item) => (
                    <div
                      key={item.name}
                      className="group relative rounded-lg p-6 text-sm leading-6 hover:bg-gray-50"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                        <item.icon
                          className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                          aria-hidden="true"
                        />
                      </div>
                      <Link
                        href={item.href}
                        className="mt-6 block font-semibold text-gray-900"
                      >
                        {item.name}
                        <span className="absolute inset-0" />
                      </Link>
                      <p className="mt-1 text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </PopoverPanel>
            </Transition>
          </Popover>

          {[...MainMenu].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </PopoverGroup>

        <div className="hidden lg:flex lg:justify-end gap-x-4">
          <div className="flex flex-row gap-4">
            {!loggedIn ? (
              <Button href="/signin" variant="outline" color="white">
                Sign in
              </Button>
            ) : (
              <>
                <Link href="/admin">
                  <UserCircleIcon className="h-10 w-10 text-gray-900" />
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
          <div>
            <CEALMainWebButton />
          </div>
        </div>
      </nav>

      <Dialog
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">
                The Council on East Asian Libraries (CEAL) Statistics
              </span>
              <img className="h-18 w-auto" src="/logo.png" alt="CEAL logo" />
            </a>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
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
                <Disclosure as="div" className="-mx-3">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                        Statistics
                        <ChevronDownIcon
                          className={classNames(
                            open ? "rotate-180" : "",
                            "h-5 w-5 flex-none"
                          )}
                          aria-hidden="true"
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="mt-2 space-y-2">
                        {[...StatisticsMenu].map((item) => (
                          <Disclosure.Button
                            key={item.name}
                            as="a"
                            className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 hover:bg-gray-50"
                          >
                            <Link href={item.href} className=" text-gray-900">
                              {item.name}
                            </Link>
                          </Disclosure.Button>
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>

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
                <div className="my-4">
                <CEALMainWebButton />
                </div>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
