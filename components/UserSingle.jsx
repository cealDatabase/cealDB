// import Link from "next/link";

// export default function UserSingle({ user }) {
//   return (
//     <div className="relative flex min-h-screen flex-col items-center justify-center">
//       <h1 className="pt-4 pb-8 bg-gradient-to-r from-[#f9572a] to-[#ffc905] bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
//         {user.name}
//       </h1>
//       <div key={user.id} className="flex items-center justify-between py-3">
//         <div className="flex items-center space-x-4">
//           <div className="space-y-1">
//             <p className="font-medium leading-none">{user.id}</p>
//             <p className="font-medium leading-none">{user.firstName}</p>
//             <p className="font-medium leading-none">{user.lastName}</p>
//             <Link href={`mailto:${user.email}`}>{user.email}</Link>
//             <p className="font-medium leading-none">{user.positionTitle}</p>
//             <p className="text-sm text-gray-500">{user.libraryId}</p>
//             <p className="text-sm text-gray-500">{user.password}</p>
//             <p className="text-sm text-gray-500">{user.role}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
