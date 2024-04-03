import prisma from '@/lib/prisma'
import Link from 'next/link'
import { timeAgo } from '@/lib/utils'
import RefreshButton from './refresh-button'

export default async function Table() {
  const libraries = await prisma.library.findMany()
  console.log({libraries})

  return (
    <div className="bg-white/30 p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-xl mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Recent Libraries</h2>
        </div>
        <RefreshButton />
      </div>
      <div className="divide-y divide-gray-900/5">
        {libraries.map((library) => (
          <div
            key={library.id}
            className="flex items-center justify-between py-3"
          >
            <div className="flex items-center space-x-4">
              <div className="space-y-1">
                <p className="font-medium leading-none">{library.id}</p>
                <p className="font-medium leading-none">{library.name}</p>
                <p className="font-medium leading-none">{library.libraryNumber}</p>
                <p className="font-medium leading-none">Is law library?{" "}{library.isLawLibrary? "Yes":"No"}</p>
                <p className="font-medium leading-none">Is medical library? {" "}{library.isMedLibrary? "Yes": "No"}</p>
                <Link className="font-medium leading-none" href={`${library.libHomePage}`}>{library.libHomePage}</Link><br/>
                <Link className="text-sm text-gray-500" href={`${library.onlineCatalogPage}`}>{library.onlineCatalogPage}</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
