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
      <h2>
        {libyear[0].Library.library_name}, {libyear[0].year}
      </h2>
      {/* {Object.entries(libyear[0].Library).toString()} */}
      {/* {Object.entries(libyear[0].Electronic).toString()} */}
      <Table>
        <TableCaption>
          <p>
            (*1): Beginning from year 2008, electronic books volumes are
            calculated separately, and this row refers to physical volumes. For
            years before 2008, this row refers to all volumes held in the
            institution.
          </p>
          <p>
            (*2): For year between 1994 and 1998, "Other Materials" includes
            microfilm reels, microfilm fiches, microform, computer files and
            CDs, audiovisual, and materials not classified otherwise. Year
            before 1994, only microfilm reels, microfilm fiches, microform are
            included.
          </p>
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]"> </TableHead>
            <TableHead className="w-[20%]"> </TableHead>
            <TableHead>CHN</TableHead>
            <TableHead>JPN</TableHead>
            <TableHead>KOR</TableHead>
            <TableHead>Non-CJK</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Grand Total Materials</TableCell>
            <TableCell className="font-medium">Total (w/o ebooks)</TableCell>
            <TableCell>0</TableCell>
            <TableCell>0</TableCell>
            <TableCell>0</TableCell>
            <TableCell>0</TableCell>
            <TableCell className="text-right">0</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium"></TableCell>
            <TableCell className="font-medium">Total (w/ ebooks)</TableCell>
            <TableCell>0</TableCell>
            <TableCell>0</TableCell>
            <TableCell>0</TableCell>
            <TableCell>0</TableCell>
            <TableCell className="text-right">0</TableCell>
          </TableRow>
        </TableBody>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]"> </TableHead>
            <TableHead className="w-[20%]"> </TableHead>
            <TableHead>CHN</TableHead>
            <TableHead>JPN</TableHead>
            <TableHead>KOR</TableHead>
            <TableHead>Non-CJK</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium flex justify-between">
              <span>Fiscal Support</span> <span>Appropriations</span>
            </TableCell>
            <TableCell>Monographic</TableCell>
            <TableCell>$0</TableCell>
            <TableCell>$0</TableCell>
            <TableCell>$0</TableCell>
            <TableCell>$0</TableCell>
            <TableCell className="text-right">$0</TableCell>
          </TableRow>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Serials</TableCell>
            <TableCell>$0</TableCell>
            <TableCell>$0</TableCell>
            <TableCell>$0</TableCell>
            <TableCell>$0</TableCell>
            <TableCell className="text-right">$0</TableCell>
          </TableRow>
          function: {libyear[0].Electronic.etotal_expenditure_grandtotal}
        </TableBody>
      </Table>
    </main>
  );
}
