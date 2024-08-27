import { Container } from "@/components/Container";
import LibYearSingle from "@/components/LibYearSingle";
import { getLibYearByLibIdAndYear } from "@/data/fetchPrisma";
import { Library_Year_Type } from "@/types/types";

// Get Library Type
async function getLibYear({ id, year }: { id: number; year: number }) {
  const libYearItem = await getLibYearByLibIdAndYear(id, year);
  console.log(libYearItem);
  return (
    <LibYearSingle libyear={libYearItem as unknown as Library_Year_Type[]} />
  );
}

const five = 5;
const twoFive = 2017;

const page = () => {
  return (
    <Container>
      here
      <div>{getLibYear({ id: five, year: twoFive })}</div>
    </Container>
  );
};

export default page;
