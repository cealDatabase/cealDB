import { cookies } from "next/headers";
import { GetAVList } from "../components/getAVList";
import AVDataTableClient from "../components/avDataTableClient";
import { Container } from "@/components/Container";
import SelectYear from "../components/selectYear";
import { Suspense } from "react";
import SkeletonTableCard from "@/components/SkeletonTableCard";

async function AVSinglePage(yearPassIn: number, roleIdPassIn: string | undefined) {
  const tasks = (await GetAVList(yearPassIn)).sort((a, b) => a.id - b.id);
  return <AVDataTableClient data={tasks} year={yearPassIn} roleIdPassIn={roleIdPassIn}/>;
}

export default async function AVListPage(
    props: {
        params: Promise<{ year: string }>;
    }
) {
    const params = await props.params;
    const cookieStore = await cookies();
    const roleId = cookieStore.get("role")?.value;
    console.log("roleId", roleId);

    return (
        <main>
            <Container className="bg-white p-12 max-w-full">

                <div className="flex-1 flex-col p-8 md:flex">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Audio/Visual Database by Subscription - {params.year}</h2>
                        <p className="text-muted-foreground text-sm">
                            Please check the boxes next to each subscription your library has, for
                            each language Chinese, Japanese, Korean, and Non-CJK. Data in this
                            list is linked to Form 4: Holdings of Other Materials and Form 9:
                            Electronic Resources. If you subscribe to a subset of one of these
                            collections, click "customize", and then enter the appropriate counts
                            in each of the fields.
                        </p>
                    </div>
                    <SelectYear yearCurrent={params.year} />
                    <Suspense fallback={<SkeletonTableCard />}>
                        {await AVSinglePage(Number(params.year), roleId)}
                    </Suspense>
                </div>
            </Container>
        </main>
    )
}