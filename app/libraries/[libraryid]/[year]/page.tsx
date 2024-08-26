import { Container } from "@/components/Container";
import { getLibYearByLibIdAndYear } from "@/data/fetchPrisma";

// Get Library Type
async function getLibYear({ id, year }: { id: number; year: number }) {
  const typeItem = await getLibYearByLibIdAndYear(5, 2025);
  console.log(typeItem?.toString());
  return <LibYear id />;
}

const page = () => {
  return (
    <Container>
      here
      <getLibYear />
    </Container>
  );
};

export default page;
