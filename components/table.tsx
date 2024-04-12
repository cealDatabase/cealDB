import { db } from '@/lib/db'
import { timeAgo } from '@/lib/utils'
import RefreshButton from './refresh-button'

export default async function Table() {
  const users = await db.user.findMany()
  console.log({users})

  return (
    <div className="bg-white/30 p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-xl mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Recent Users</h2>
        </div>
        <RefreshButton />
      </div>
      <div className="divide-y divide-gray-900/5">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between py-3"
          >
            <div className="flex items-center space-x-4">
              <div className="space-y-1">
                <p className="font-medium leading-none">{user.id}</p>
                <p className="font-medium leading-none">{user.firstName}</p>
                <p className="font-medium leading-none">{user.lastName}</p>
                <p className="font-medium leading-none">{user.email}</p>
                <p className="font-medium leading-none">{user.positionTitle}</p>
                <p className="text-sm text-gray-500">{user.libraryId}</p>
                <p className="text-sm text-gray-500">{user.password}</p>
                <p className="text-sm text-gray-500">{user.role}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">{timeAgo(user.updatedAt)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
