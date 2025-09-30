import { cookies } from "next/headers";
import { GetAVList } from "../components/getAVList";
import AVDataTableClient from "../components/avDataTableClient";
import { Container } from "@/components/Container";
import SelectYear from "../components/selectYear";
import { Suspense } from "react";
import SkeletonTableCard from "@/components/SkeletonTableCard";
import { SurveyBreadcrumb } from "@/components/SurveyBreadcrumb";

/** Helper to render the client table */
async function AVSinglePage(
  yearPassIn: number,
  roleIdPassIn: string | undefined,
  libid?: number,
  userRoles?: string[] | null
) {
  const tasks = (await GetAVList(yearPassIn)).sort((a, b) => a.id - b.id);
  return (
    <AVDataTableClient
      data={tasks}
      year={yearPassIn}
      roleIdPassIn={roleIdPassIn}
      libid={libid}
      userRoles={userRoles}
    />
  );
}

export default async function AVListPage(props: {
  params: Promise<{ year: string }>;
  searchParams?: Promise<{ libid?: string }>; // 👈 add searchParams
}) {
  const params = await props.params;
  const sp = (await props.searchParams) ?? {};

  const cookieStore = await cookies();
  const roleId = cookieStore.get("role")?.value;

  // Parse user roles for permission checking
  let userRoles: string[] | null = null;
  if (roleId) {
    try {
      // Role cookie can be JSON array or single value
      userRoles = roleId.startsWith('[') ? JSON.parse(roleId) : [roleId];
    } catch (error) {
      console.error('Error parsing role cookie:', error);
    }
  }

  // Prefer libid from query (?libid=56); fall back to cookie if you have one
  const libidFromQuery = sp.libid ? Number(sp.libid) : undefined;
  const libidFromCookie = cookieStore.get("library")?.value
    ? Number(cookieStore.get("library")!.value)
    : undefined;

  const libid = libidFromQuery ?? libidFromCookie;

  return (
    <main>
      <Container className='bg-white pb-12 max-w-full'>
          <SurveyBreadcrumb surveyType="avdb" year={params.year} />
        <div className='flex-1 flex-col px-8 py-4 md:flex'>
          <div className='space-y-2'>
            <h1 className='text-2xl font-bold tracking-tight text-start'>
              Audio/Visual Database by Subscription - {params.year}
            </h1>
            <p className='text-muted-foreground text-sm'>
              Please check the boxes next to each subscription your library has,
              for each language Chinese, Japanese, Korean, and Non-CJK. Data in
              this list is linked to Form 4: Holdings of Other Materials and
              Form 9: Electronic Resources. If you subscribe to a subset of one
              of these collections, click &quot;customize&quot;, and then enter
              the appropriate counts in each of the fields.
            </p>
          </div>

          <SelectYear yearCurrent={params.year} />

          <Suspense fallback={<SkeletonTableCard />}>
            {await AVSinglePage(Number(params.year), roleId, libid, userRoles)}
          </Suspense>
        </div>
      </Container>
    </main>
  );
}
