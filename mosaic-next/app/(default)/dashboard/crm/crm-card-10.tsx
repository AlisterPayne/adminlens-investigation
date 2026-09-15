export default function CrmCard10() {
  return (
    <div className="col-span-full rounded-xl bg-white shadow-sm dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Recent Deals</h2>
      </header>
      <div className="p-3">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto dark:text-gray-300">
            {/* Table header */}
            <thead className="rounded-xs bg-gray-50 text-xs text-gray-400 uppercase dark:bg-gray-700/50 dark:text-gray-500">
              <tr>
                <th className="p-2">
                  <div className="text-left font-semibold">Company</div>
                </th>
                <th className="p-2">
                  <div className="text-left font-semibold">Owner</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">Value</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">Stage</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">Close Date</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="divide-y divide-gray-100 text-sm font-medium dark:divide-gray-700/60">
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Acme Corp</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Sarah Chen</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$48,500</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">Proposal</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Mar 28, 2025</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Globex Industries</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Marcus Webb</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$72,000</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">Won</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Mar 24, 2025</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Stark Systems</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Elena Rodriguez</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$31,200</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-violet-500">Qualified</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Apr 02, 2025</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Wayne Enterprises</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">James Okonkwo</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$95,800</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">Proposal</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Apr 10, 2025</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Initech LLC</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Priya Sharma</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$18,400</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-gray-500">Lead</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Apr 15, 2025</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
