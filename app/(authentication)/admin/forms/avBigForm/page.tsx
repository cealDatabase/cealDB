import { getAVListIdByLanguageId, getAVListByAVId } from "@/data/fetchPrisma"

import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { Container } from "@/components/Container"
import { List_AV_Type, Library_Year_Type, LibraryYear_ListAVType, SingleListAVCountsType, SingleListAVLanguageType } from "@/types/types"

// Simulate a database read for tasks.
async function getTasks() {

    const AVListCompo = async ({ languageId }: { languageId: number }) => {
        const avIdlist = await getAVListIdByLanguageId(languageId);
        if (!avIdlist) {
            return [];
        }
        const avLists = await Promise.all(avIdlist.map(async (object) => {
            const avlist = await getAVListByAVId(object.listav_id);
            return avlist as unknown as List_AV_Type[];
        }));
        return avLists.flat();
    }

    //   const data = await fs.readFile(
    //     path.join(process.cwd(), "app/(authentication)/admin/forms/tasks/data/tasks.json")
    //   )

    const data = await AVListCompo({ languageId: 1 });
    if (!data) {
        return [];
    }

    console.log(data.toString());

    const tasks = JSON.parse(data.toString())
    return tasks.parse(tasks)
}

export default async function TaskPage() {
    const tasks = await getTasks()

    return (
        <main>
            <Container className="bg-white p-12">
                <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
                    <div className="flex items-center justify-between space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
                        <p className="text-muted-foreground">
                            Here&apos;s a list of your tasks for this month!
                        </p>
                    </div>
                    <DataTable data={tasks} columns={columns} />
                </div>
            </Container>
        </main>
    )
}