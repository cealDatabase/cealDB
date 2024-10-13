
import { Container } from "@/components/Container"
import { Payment, columns } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<Payment[]> {
    // Fetch data from your API here.
    return [
        {
            id: "728ed52f",
            amount: 100,
            status: "pending",
            email: "m@example.com",
        },
        {
            id: "489e1d42",
            amount: 125,
            status: "processing",
            email: "example@gmail.com",
        },
        {
            id: "a1b2c3d4",
            amount: 150,
            status: "success",
            email: "user1@example.com",
        },
        {
            id: "e5f6g7h8",
            amount: 200,
            status: "failed",
            email: "user2@example.com",
        },
        {
            id: "i9j0k1l2",
            amount: 175,
            status: "pending",
            email: "user3@example.com",
        },
        {
            id: "m3n4o5p6",
            amount: 300,
            status: "success",
            email: "user4@example.com",
        },
        {
            id: "q7r8s9t0",
            amount: 225,
            status: "processing",
            email: "user5@example.com",
        }
    ]
}

export default async function DemoPage() {
    const data = await getData()

    return (
        <Container>
            <div className="w-full max-w-4xl mx-auto">
                <DataTable columns={columns} data={data} />
            </div>
        </Container>
    )
}
