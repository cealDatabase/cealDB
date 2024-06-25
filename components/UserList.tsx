import { getAllUsers } from "@/data/fetchPrisma";

export default async function UserList() {
  const users = await getAllUsers();

  return (
    <div className="bg-white/70 p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-xl mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <h2>Recent Users</h2>
        </div>
      </div>
      <div className="divide-y divide-gray-900/5">
        {users &&
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between py-3"
            >
              <div className="flex items-center space-x-4">
                <div className="space-y-1">
                  <p className="font-medium leading-none">{user.id}</p>
                  <p className="font-medium leading-none">{user.firstname}</p>
                  <p className="font-medium leading-none">{user.lastname}</p>
                  <p className="font-medium leading-none">{user.username}</p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
