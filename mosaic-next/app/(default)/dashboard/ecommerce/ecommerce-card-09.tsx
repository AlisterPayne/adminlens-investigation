export default function EcommerceCard09() {
  return (
    <div className="col-span-full rounded-xl bg-white shadow-sm dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Top Products</h2>
      </header>
      <div className="p-3">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto dark:text-gray-300">
            {/* Table header */}
            <thead className="rounded-xs bg-gray-50 text-xs text-gray-400 uppercase dark:bg-gray-700/50 dark:text-gray-500">
              <tr>
                <th className="p-2">
                  <div className="text-left font-semibold">Product</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">Sales</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">Revenue</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">Stock</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">Conversion</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="divide-y divide-gray-100 text-sm font-medium dark:divide-gray-700/60">
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Wireless Earbuds Pro</div>
                </td>
                <td className="p-2">
                  <div className="text-center">1,842</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$128,940</div>
                </td>
                <td className="p-2">
                  <div className="text-center">248</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">6.2%</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Smart Watch Series 5</div>
                </td>
                <td className="p-2">
                  <div className="text-center">1,524</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$106,680</div>
                </td>
                <td className="p-2">
                  <div className="text-center">186</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">5.8%</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Organic Cotton Hoodie</div>
                </td>
                <td className="p-2">
                  <div className="text-center">1,318</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$65,900</div>
                </td>
                <td className="p-2">
                  <div className="text-center">412</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">4.9%</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Ceramic Pour-Over Set</div>
                </td>
                <td className="p-2">
                  <div className="text-center">986</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$44,370</div>
                </td>
                <td className="p-2">
                  <div className="text-center">94</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">4.4%</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Leather Crossbody Bag</div>
                </td>
                <td className="p-2">
                  <div className="text-center">874</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$52,440</div>
                </td>
                <td className="p-2">
                  <div className="text-center">156</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">4.1%</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Desk Lamp LED</div>
                </td>
                <td className="p-2">
                  <div className="text-center">742</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$29,680</div>
                </td>
                <td className="p-2">
                  <div className="text-center">318</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">3.8%</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
