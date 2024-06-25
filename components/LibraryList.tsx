
import { getAllLibraries} from "@/data/fetchPrisma";

export default async function LibraryList() {
    const libraries = await getAllLibraries();
  
    return (
      <div>
        <ul>
          {libraries &&
            libraries.map((library) => (
              <>
                <li key={library.id}>
                  <p>{library.name}</p>
                  <p>{library.bibliographic[0]}</p>
                  <p>{library.establishedAt}</p>
                </li>
              </>
            ))}
        </ul>
      </div>
    );
  }