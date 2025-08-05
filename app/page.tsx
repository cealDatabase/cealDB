"use client";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import Link from "next/link";
export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <main>
      <Container>
        <div className="overflow-hidden">
          <div className="gap-x-14 my-16 lg:flex lg:items-center">
            <div className="relative w-full ">
              <h1 className="text-4xl text-left font-bold tracking-tight sm:text-6xl">
                Welcome to CEAL Statistics Database
              </h1>
              <div className="mt-6 text-lg leading-6 text-gray-600 sm:max-w-md lg:max-w-none">
                <p className="">
                  For new users of this database, please click{" "}
                  <Link href="/help">here</Link> for more information.
                </p>
                <p className="">
                  Certain data, such as tables with derived statistical data,
                  can only be accessed by members. Please{" "}
                  <Link href="help">contact us</Link> for information about
                  membership.
                </p>
              </div>
              <div className="mt-10 flex items-center gap-x-6">
                <Button href="/started" className="bg-red-400 hover:bg-red-600">Get started</Button>
                <Link
                  href="/libraries"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Libraries <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            <div className="mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
              <div className="ml-auto w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36 xl:order-none xl:pt-80">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1614849963640-9cc74b2a826f?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt=""
                    className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                </div>
              </div>
              <div className="mr-auto w-44 flex-none space-y-8 sm:mr-0 sm:pt-52 lg:pt-36">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=2515&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt=""
                    className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                </div>
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1506555191898-a76bacf004ca?q=80&w=2339&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt=""
                    className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                </div>
              </div>
              <div className="w-44 flex-none space-y-8 pt-32 sm:pt-0">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1707762890671-52ef6d6f51e7?q=80&w=2050&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt=""
                    className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                </div>
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1622493812833-dc6e69371f82?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt=""
                    className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
