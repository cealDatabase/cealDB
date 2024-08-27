import { Library_Year_Type } from "@/types/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function LibYearSingle({
  libyear,
}: {
  libyear: Library_Year_Type[];
}) {
  return (
    <main>
      <h1>{libyear[0].id}</h1>
      <h1>{libyear[0].Library.library_name}</h1>
      <div className="flex flex-auto">
        <span className="w-full text-wrap">
          {Object.entries(libyear[0].Electronic).toString()}
        </span>

        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">INV001</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Credit Card</TableCell>
              <TableCell className="text-right">$250.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <h1>{libyear[0].year}</h1>
    </main>
  );
}
