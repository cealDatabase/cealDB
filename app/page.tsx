import Link from "next/link";
import { Suspense } from "react";
import UserList from "@/components/UserList";
import TablePlaceholder from "@/components/RenderPlaceholder";
import ExpandingArrow from "@/components/expanding-arrow";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main>
      <h1 className="pt-4 pb-8 bg-gradient-to-r from-[#f9572a] to-[#ffc905] bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
        CEAL Statistics Database
      </h1>
      <Suspense fallback={<TablePlaceholder />}>
        <UserList />
      </Suspense>
      <p className="font-light text-gray-600 w-full max-w-lg text-center mt-6">
        <Link
          href="https://vercel.com/postgres"
          className="font-medium underline underline-offset-4 hover:text-black transition-colors"
        >
          Vercel Postgres
        </Link>{" "}
        demo with{" "}
        <Link
          href="https://prisma.io"
          className="font-medium underline underline-offset-4 hover:text-black transition-colors"
        >
          Prisma
        </Link>{" "}
        as the ORM. <br /> Built with{" "}
        <Link
          href="https://nextjs.org/docs"
          className="font-medium underline underline-offset-4 hover:text-black transition-colors"
        >
          Next.js App Router
        </Link>
        .
      </p>

    </main>
  );
}
