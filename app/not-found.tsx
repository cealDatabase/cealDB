"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/Button";
import Link from "next/link";
import "./globals.css";

export default function NotFound() {
  const pathname = usePathname();
  return (
    <main>
      <h1 className="max-w-4xl">Page Not Found at {pathname}</h1>
      <Button>
        <Link href="/">Home Page</Link>
      </Button>
    </main>
  );
}