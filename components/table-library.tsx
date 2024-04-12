import { getAllLibraries } from "@/data/fetchPrisma";

export default async function Table() {
  const libraries = await getAllLibraries();

  return (
    <>
      <div className="bg-white/30 p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Recent Libraries</h2>
          </div>
        </div>
        <div className="divide-y divide-gray-900/5">
          {libraries
            ? libraries.map((library) => (
                <div key={library.id}>{library.name}</div>
              ))
            : "no data"}
        </div>
      </div>
    </>
  );
}
