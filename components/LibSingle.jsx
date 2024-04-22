import { getLibraryById } from "@/data/fetchPrisma";
import Link from "next/link";

async function searchById({ searchId }) {
  const libraryIem = await getLibraryById(searchId);
  return <LibSingle libraries={libraryIem} />;
}

export default function LibSingle({ libraries }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <h1 className="pt-4 pb-8 bg-gradient-to-r from-[#f9572a] to-[#ffc905] bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
        {libraries.name}
      </h1>

      <p>{libraries.id}</p>
      <h2>{libraries.name}</h2>

      {libraries.libHomePage && (
        <h3>
          <Link href={libraries.libHomePage}>{libraries.libHomePage}</Link>
        </h3>
      )}

      <h3>{libraries.libraryNumber}</h3>
    </div>
  );
}
