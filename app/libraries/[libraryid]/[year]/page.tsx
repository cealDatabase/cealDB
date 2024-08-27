import { Container } from "@/components/Container";
import LibYearSingle from "@/components/LibYearSingle";
import { getLibYearByLibIdAndYear } from "@/data/fetchPrisma";
import { Library_Year_Type } from "@/types/types";

// Get Library Type
async function getLibYear({ id, year }: { id: number; year: number }) {
  const libYearItem = await getLibYearByLibIdAndYear(id, year);
  // console.log(libYearItem);
  return (
    <LibYearSingle libyear={libYearItem as unknown as Library_Year_Type[]} />
  );
}

export default async function LibraryYearPage({
  params,
}: {
  params: { libraryid: string; year: string };
}) {
  const libId = params.libraryid;
  const year = params.year;
  return (
    <Container>
      <div>{getLibYear({ id: Number(libId), year: Number(year) })}</div>
    </Container>
  );
}
