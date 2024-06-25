
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
                  <p>{library.library_name}</p>
                  <p>{library.plibibliographic}</p>
                  <p>{library.pliestablishedyear}</p>
                </li>
              </>
            ))}
        </ul>
      </div>
    );
  }