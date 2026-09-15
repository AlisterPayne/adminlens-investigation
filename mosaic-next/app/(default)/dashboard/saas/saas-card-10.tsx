export default function SaasCard10() {
  return (
    <div className="col-span-full rounded-xl bg-white shadow-sm dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Recent Signups</h2>
      </header>
      <div className="p-3">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto dark:text-gray-300">
            {/* Table header */}
            <thead className="rounded-xs bg-gray-50 text-xs text-gray-400 uppercase dark:bg-gray-700/50 dark:text-gray-500">
              <tr>
                <th className="p-2">
                  <div className="text-left font-semibold">Customer</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">Plan</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">MRR</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">Date</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">Status</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="divide-y divide-gray-100 text-sm font-medium dark:divide-gray-700/60">
              <tr>
                <td className="p-2">
                  <div className="flex items-center">
                    <div className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500 text-xs font-bold text-white sm:mr-3">
                      AC
                    </div>
                    <div className="text-gray-800 dark:text-gray-100">Acme Corp</div>
                  </div>
                </td>
                <td className="p-2">
                  <div className="text-center">Enterprise</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$2,400</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Jan 28, 2025</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">Active</div>
                </td>
              </tr>
              <tr>
                <td className="p-2">
                  <div className="flex items-center">
                    <div className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white sm:mr-3">
                      BL
                    </div>
                    <div className="text-gray-800 dark:text-gray-100">Bright Labs</div>
                  </div>
                </td>
                <td className="p-2">
                  <div className="text-center">Pro</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$149</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Jan 27, 2025</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">Trial</div>
                </td>
              </tr>
              <tr>
                <td className="p-2">
                  <div className="flex items-center">
                    <div className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white sm:mr-3">
                      NF
                    </div>
                    <div className="text-gray-800 dark:text-gray-100">Northwind Finance</div>
                  </div>
                </td>
                <td className="p-2">
                  <div className="text-center">Enterprise</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$3,200</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Jan 26, 2025</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">Active</div>
                </td>
              </tr>
              <tr>
                <td className="p-2">
                  <div className="flex items-center">
                    <div className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500 text-xs font-bold text-white sm:mr-3">
                      JD
                    </div>
                    <div className="text-gray-800 dark:text-gray-100">Jane Doe</div>
                  </div>
                </td>
                <td className="p-2">
                  <div className="text-center">Pro</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$79</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Jan 25, 2025</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">Trial</div>
                </td>
              </tr>
              <tr>
                <td className="p-2">
                  <div className="flex items-center">
                    <div className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-400 text-xs font-bold text-white sm:mr-3">
                      SC
                    </div>
                    <div className="text-gray-800 dark:text-gray-100">Startup Co</div>
                  </div>
                </td>
                <td className="p-2">
                  <div className="text-center">Free</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-gray-500">$0</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Jan 24, 2025</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">Active</div>
                </td>
              </tr>
              <tr>
                <td className="p-2">
                  <div className="flex items-center">
                    <div className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white sm:mr-3">
                      PX
                    </div>
                    <div className="text-gray-800 dark:text-gray-100">Pixelworks Inc</div>
                  </div>
                </td>
                <td className="p-2">
                  <div className="text-center">Pro</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$149</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Jan 23, 2025</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-red-500">Past Due</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
