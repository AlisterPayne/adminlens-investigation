export default function SupportCard10() {
  return (
    <div className="col-span-full rounded-xl bg-white shadow-sm dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Recent Tickets</h2>
      </header>
      <div className="p-3">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto dark:text-gray-300">
            {/* Table header */}
            <thead className="rounded-xs bg-gray-50 text-xs text-gray-400 uppercase dark:bg-gray-700/50 dark:text-gray-500">
              <tr>
                <th className="p-2">
                  <div className="text-left font-semibold">Ticket</div>
                </th>
                <th className="p-2">
                  <div className="text-left font-semibold">Customer</div>
                </th>
                <th className="p-2">
                  <div className="text-left font-semibold">Subject</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">Agent</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">Status</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="divide-y divide-gray-100 text-sm font-medium dark:divide-gray-700/60">
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">#TK-4821</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Sarah Chen</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Unable to reset password</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Alex Rivera</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">Open</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">#TK-4819</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Marcus Webb</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Invoice discrepancy on March billing</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Jamie Park</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-violet-500">In Progress</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">#TK-4816</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Elena Vasquez</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">API integration returning 403 errors</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Chris Nolan</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-violet-500">In Progress</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">#TK-4812</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">David Okonkwo</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Request to upgrade plan to Enterprise</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Morgan Lee</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">Resolved</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">#TK-4808</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Priya Sharma</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Dashboard widgets not loading</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Alex Rivera</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">Resolved</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
