import db from "@/lib/db";

export default async function DebugLibrariesPage() {
  // Get all libraries
  const libraries = await db.library.findMany({
    select: {
      id: true,
      library_name: true,
    },
    orderBy: { id: 'asc' }
  });

  // Get all Library_Year records for 2025
  const libraryYears2025 = await db.library_Year.findMany({
    where: { year: 2025 },
    include: {
      LibraryYear_ListAV: {
        include: {
          List_AV: {
            select: { id: true, title: true }
          }
        }
      }
    }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Libraries & Subscriptions</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">All Libraries:</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {libraries.map(lib => (
              <div key={lib.id} className="bg-white p-2 rounded shadow-sm">
                <strong>ID {lib.id}:</strong> {lib.library_name || 'Unknown Name'}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-green-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">2025 Subscriptions by Library:</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {libraryYears2025.map(libYear => (
              <div key={libYear.id} className="bg-white p-3 rounded shadow-sm">
                <div className="font-medium mb-2">
                  Library ID {libYear.library}: {libYear.LibraryYear_ListAV.length} subscriptions
                </div>
                {libYear.LibraryYear_ListAV.length > 0 && (
                  <div className="text-sm space-y-1">
                    {libYear.LibraryYear_ListAV.map(sub => (
                      <div key={sub.listav_id} className="text-gray-700">
                        • AV {sub.listav_id}: {sub.List_AV.title?.substring(0, 50) || 'No title'}...
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-yellow-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Quick Links:</h2>
        <div className="space-y-2">
          {libraries.slice(0, 5).map(lib => (
            <div key={lib.id}>
              <a 
                href={`/admin/forms/${lib.id}/avdbedit`} 
                className="text-blue-600 hover:underline mr-4"
              >
                View Library {lib.id} subscriptions
              </a>
              <span className="text-gray-600">({lib.library_name || 'Unknown'})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
