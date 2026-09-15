export default function EcommerceCard10() {
  return (
    <div className="col-span-full rounded-xl bg-white shadow-sm dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Recent Orders</h2>
      </header>
      <div className="p-3">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto dark:text-gray-300">
            {/* Table header */}
            <thead className="rounded-xs bg-gray-50 text-xs text-gray-400 uppercase dark:bg-gray-700/50 dark:text-gray-500">
              <tr>
                <th className="p-2">
                  <div className="text-left font-semibold">Order</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">Customer</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">Total</div>
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
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">#ORD-7842</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Sarah Mitchell</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$142.50</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Jan 4, 2025</div>
                </td>
                <td className="p-2">
                  <div className="text-center">
                    <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-700">
                      Completed
                    </span>
                  </div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">#ORD-7841</div>
                </td>
                <td className="p-2">
                  <div className="text-center">James Chen</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$89.99</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Jan 4, 2025</div>
                </td>
                <td className="p-2">
                  <div className="text-center">
                    <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-xs font-medium text-sky-700">
                      Shipped
                    </span>
                  </div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">#ORD-7840</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Emily Rodriguez</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$234.00</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Jan 3, 2025</div>
                </td>
                <td className="p-2">
                  <div className="text-center">
                    <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-700">
                      Processing
                    </span>
                  </div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">#ORD-7839</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Michael Park</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$67.25</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Jan 3, 2025</div>
                </td>
                <td className="p-2">
                  <div className="text-center">
                    <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-700">
                      Completed
                    </span>
                  </div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">#ORD-7838</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Lisa Thompson</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$178.40</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Jan 2, 2025</div>
                </td>
                <td className="p-2">
                  <div className="text-center">
                    <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-xs font-medium text-sky-700">
                      Shipped
                    </span>
                  </div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">#ORD-7837</div>
                </td>
                <td className="p-2">
                  <div className="text-center">David Wilson</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$54.99</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Jan 2, 2025</div>
                </td>
                <td className="p-2">
                  <div className="text-center">
                    <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-700">
                      Cancelled
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
