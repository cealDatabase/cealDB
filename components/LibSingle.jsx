import { getLibraryById } from "@/data/fetchPrisma";
import { SingleLibraryType } from "@/types/types";
import Link from "next/link";

async function searchById({ searchId }) {
  const libraryIem = await getLibraryById(searchId);
  return <LibSingle libraries={libraryIem} />;
}

export default function LibSingle({libraries}) 
{
  return (
    <>
      <p>{libraries.id}</p>
      <h2>{libraries.name}</h2>
      
      {libraries.libHomePage && (
        <h3>
          <Link href={libraries.libHomePage}>{libraries.libHomePage}</Link>
        </h3>
      )}
      
      <h3>{libraries.libraryNumber}</h3>
    </>
  );
}
