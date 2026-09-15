export default function MarketingCard10() {
  return (
    <div className="col-span-full rounded-xl bg-white shadow-sm dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Top Campaigns</h2>
      </header>
      <div className="p-3">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto dark:text-gray-300">
            {/* Table header */}
            <thead className="rounded-xs bg-gray-50 text-xs text-gray-400 uppercase dark:bg-gray-700/50 dark:text-gray-500">
              <tr>
                <th className="p-2">
                  <div className="text-left font-semibold">Campaign</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">Channel</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">Spend</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">Conversions</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">ROAS</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="divide-y divide-gray-100 text-sm font-medium dark:divide-gray-700/60">
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Spring Product Launch</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Paid Search</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$12,400</div>
                </td>
                <td className="p-2">
                  <div className="text-center">420</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">5.2x</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Brand Awareness Q1</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Social</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$9,800</div>
                </td>
                <td className="p-2">
                  <div className="text-center">318</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">4.8x</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Newsletter #12 Promo</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Email</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$4,200</div>
                </td>
                <td className="p-2">
                  <div className="text-center">186</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">6.1x</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Retargeting — Cart Abandoners</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Display</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$7,600</div>
                </td>
                <td className="p-2">
                  <div className="text-center">142</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">3.9x</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Partner Referral Drive</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Referral</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$3,100</div>
                </td>
                <td className="p-2">
                  <div className="text-center">98</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">4.4x</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Holiday Flash Sale</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Affiliate</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-green-500">$2,800</div>
                </td>
                <td className="p-2">
                  <div className="text-center">84</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">3.6x</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
