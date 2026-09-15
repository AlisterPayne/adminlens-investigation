import Image from "next/image";
import Link from "next/link";

import EditMenu from "@/components/edit-menu";
import PaginationNumeric from "@/components/pagination-numeric";
import SearchForm from "@/components/search-form";
import { users } from "@/data/users-data";

export const metadata = {
  title: "Users List - Mosaic",
  description: "Page description",
};

function statusColor(status: string): string {
  switch (status) {
    case "Active":
      return "bg-green-500/20 text-green-700";
    case "Pending":
      return "bg-yellow-500/20 text-yellow-700";
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400";
  }
}

export default function UsersList() {
  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Acme Inc.</h1>
        </div>

        {/* Right: Actions */}
        <div className="grid grid-flow-col justify-start gap-2 sm:auto-cols-max sm:justify-end">
          {/* Search form */}
          <SearchForm />
          {/* Add member button */}
          <Link
            href="/community/add-user"
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
          >
            <svg className="xs:hidden shrink-0 fill-current" width="16" height="16" viewBox="0 0 16 16">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
            <span className="max-xs:sr-only">Add Member</span>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="relative rounded-xl bg-white shadow-sm dark:bg-gray-800">
        <header className="px-5 py-4">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">
            All Members <span className="font-medium text-gray-400 dark:text-gray-500">{users.length}</span>
          </h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full table-auto dark:text-gray-300">
            {/* Table header */}
            <thead className="border-t border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase dark:border-gray-700/60 dark:bg-gray-900/20 dark:text-gray-400">
              <tr>
                <th className="px-2 py-3 text-left whitespace-nowrap first:pl-5 last:pr-5">
                  <div className="font-semibold">Name</div>
                </th>
                <th className="px-2 py-3 text-left whitespace-nowrap first:pl-5 last:pr-5">
                  <div className="font-semibold">Role</div>
                </th>
                <th className="px-2 py-3 text-left whitespace-nowrap first:pl-5 last:pr-5">
                  <div className="font-semibold">Location</div>
                </th>
                <th className="px-2 py-3 text-left whitespace-nowrap first:pl-5 last:pr-5">
                  <div className="font-semibold">Status</div>
                </th>
                <th className="px-2 py-3 text-right whitespace-nowrap first:pl-5 last:pr-5">
                  <span className="sr-only">Menu</span>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="divide-y divide-gray-100 text-sm dark:divide-gray-700/60">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-2 py-3 whitespace-nowrap first:pl-5 last:pr-5">
                    <div className="flex items-center">
                      <Link className="mr-2 block h-10 w-10 shrink-0 sm:mr-3" href={user.link}>
                        <Image className="rounded-full" src={user.image} width={40} height={40} alt={user.name} />
                      </Link>
                      <div>
                        <Link
                          className="font-medium text-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white"
                          href={user.link}
                        >
                          {user.name}
                        </Link>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap first:pl-5 last:pr-5">
                    <div className="text-left">{user.role}</div>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap first:pl-5 last:pr-5">
                    <div className="text-left text-lg">{user.location}</div>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap first:pl-5 last:pr-5">
                    <div
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-center font-medium ${statusColor(user.status)}`}
                    >
                      {user.status}
                    </div>
                  </td>
                  <td className="w-px px-2 py-3 whitespace-nowrap first:pl-5 last:pr-5">
                    <div className="flex items-center justify-end">
                      <EditMenu align="right" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-8">
        <PaginationNumeric />
      </div>
    </div>
  );
}
