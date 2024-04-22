import { getRegionById } from "@/data/fetchPrisma";
import Link from "next/link";

async function getRegionDetailById({ regionId }) {
  const regionItem = await getRegionById(regionIdId);
  return <RegionSingle region={regionItem} />;
}

export default function RegionSingle({ region }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <h1 className="pt-4 pb-8 bg-gradient-to-r from-[#f9572a] to-[#ffc905] bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
        {region.name}
      </h1>

      <p>{region.id}</p>
      <h2>{region.name}</h2>
    </div>
  );
}
