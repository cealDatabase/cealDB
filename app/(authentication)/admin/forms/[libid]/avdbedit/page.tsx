// app/(authentication)/admin/forms/[libid]/avdbedit/page.tsx
import { cookies } from "next/headers";
import db from "@/lib/db";
import { notFound } from "next/navigation";
import AvdbEditClient from "./AvdbEditClient";

type PageProps = {
  // 👇 in Next 15 these are async
  params: Promise<{ libid: string }>;
  searchParams: Promise<{ ids?: string; year?: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  // ✅ await both before accessing properties
  const { libid: libidStr } = await params;
  const sp = await searchParams;

  const cookieStore = await cookies();
  
  // Parse libid from URL params, but also check cookies for member users
  let libid: number;
  
  // If libidStr is "member" or not a valid number, get libid from cookies
  if (libidStr === "member" || isNaN(Number(libidStr))) {
    const libidFromCookie = cookieStore.get("libid")?.value;
    if (libidFromCookie) {
      libid = Number(libidFromCookie);
    } else {
      libid = NaN; // Will trigger notFound
    }
  } else {
    libid = Number(libidStr);
  }

  const year = Number(sp.year ?? NaN);
  const ids = (sp.ids ?? "")
    .split(",")
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n));

  // Debug logging to see what we're getting
  console.log("Debug avdbedit page:", {
    libidStr,
    libid,
    year,
    ids,
    searchParams: sp
  });

  if (!libid || !Number.isFinite(year) || ids.length === 0) {
    console.log("Returning notFound due to:", {
      libidValid: !!libid,
      yearValid: Number.isFinite(year),
      idsLength: ids.length
    });
    return notFound();
  }

  const rows = await db.list_AV.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      title: true,
      subtitle: true,
      cjk_title: true,
      romanized_title: true,
      description: true,
      notes: true,
      publisher: true,
      data_source: true,
      type: true,
      is_global: true,
      updated_at: true,
      List_AV_Counts: { where: { year }, select: { titles: true }, take: 1 },
      List_AV_Language: { select: { Language: { select: { short: true } } } },
    },
  });

  const data = rows.map((r) => ({
    id: r.id,
    title: r.title ?? "",
    subtitle: r.subtitle ?? "",
    cjk_title: r.cjk_title ?? "",
    romanized_title: r.romanized_title ?? "",
    description: r.description ?? "",
    notes: r.notes ?? "",
    publisher: r.publisher ?? "",
    data_source: r.data_source ?? "",
    type: r.type ?? "",
    counts: r.List_AV_Counts[0]?.titles ?? 0,
    language: r.List_AV_Language.map((x) => x.Language?.short).filter(
      Boolean
    ) as string[],
    is_global: !!r.is_global,
    subscribers: [], // satisfy listAV shape used by columns
    updated_at: r.updated_at.toISOString(),
  }));

  return <AvdbEditClient libid={libid} year={year} rows={data} />;
}
