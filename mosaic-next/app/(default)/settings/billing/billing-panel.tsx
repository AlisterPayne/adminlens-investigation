export default function BillingPanel() {
  return (
    <div className="grow">
      {/* Panel body */}
      <div className="space-y-6 p-6">
        <div>
          <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-100">Billing & Invoices</h2>
          <div className="text-sm">
            This workspace's Basic Plan is set to <strong className="font-medium">$34</strong> per month and will renew
            on <strong className="font-medium">July 9, 2024</strong>.
          </div>
        </div>

        {/* Billing Information */}
        <section>
          <h3 className="mb-1 text-xl leading-snug font-bold text-gray-800 dark:text-gray-100">Billing Information</h3>
          <ul>
            <li className="border-b border-gray-200 py-3 md:flex md:items-center md:justify-between dark:border-gray-700/60">
              {/* Left */}
              <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Payment Method</div>
              {/* Right */}
              <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="mr-3">Mastercard ending 9282</span>
                <a className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400" href="#0">
                  Edit
                </a>
              </div>
            </li>
            <li className="border-b border-gray-200 py-3 md:flex md:items-center md:justify-between dark:border-gray-700/60">
              {/* Left */}
              <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Billing Interval</div>
              {/* Right */}
              <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="mr-3">Annually</span>
                <a className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400" href="#0">
                  Edit
                </a>
              </div>
            </li>
            <li className="border-b border-gray-200 py-3 md:flex md:items-center md:justify-between dark:border-gray-700/60">
              {/* Left */}
              <div className="text-sm font-medium text-gray-800 dark:text-gray-100">VAT/GST Number</div>
              {/* Right */}
              <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="mr-3">UK849700927</span>
                <a className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400" href="#0">
                  Edit
                </a>
              </div>
            </li>
            <li className="border-b border-gray-200 py-3 md:flex md:items-center md:justify-between dark:border-gray-700/60">
              {/* Left */}
              <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Your Address</div>
              {/* Right */}
              <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="mr-3">34 Savoy Street, London, UK, 24E8X</span>
                <a className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400" href="#0">
                  Edit
                </a>
              </div>
            </li>
            <li className="border-b border-gray-200 py-3 md:flex md:items-center md:justify-between dark:border-gray-700/60">
              {/* Left */}
              <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Billing Address</div>
              {/* Right */}
              <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="mr-3">hello@cruip.com</span>
                <a className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400" href="#0">
                  Edit
                </a>
              </div>
            </li>
          </ul>
        </section>

        {/* Invoices */}
        <section>
          <h3 className="mb-1 text-xl leading-snug font-bold text-gray-800 dark:text-gray-100">Invoices</h3>
          {/* Table */}
          <table className="w-full table-auto dark:text-gray-400">
            {/* Table header */}
            <thead className="text-xs text-gray-400 uppercase dark:text-gray-500">
              <tr className="md:flex-no-wrap flex flex-wrap md:table-row">
                <th className="block w-full py-2 md:table-cell md:w-auto">
                  <div className="text-left font-semibold">Year</div>
                </th>
                <th className="hidden w-full py-2 md:table-cell md:w-auto">
                  <div className="text-left font-semibold">Plan</div>
                </th>
                <th className="hidden w-full py-2 md:table-cell md:w-auto">
                  <div className="text-left font-semibold">Amount</div>
                </th>
                <th className="hidden w-full py-2 md:table-cell md:w-auto">
                  <div className="text-right font-semibold"></div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm">
              {/* Row */}
              <tr className="md:flex-no-wrap flex flex-wrap border-b border-gray-200 py-2 md:table-row md:py-0 dark:border-gray-700/60">
                <td className="block w-full py-0.5 md:table-cell md:w-auto md:py-2">
                  <div className="text-left font-medium text-gray-800 dark:text-gray-100">2024</div>
                </td>
                <td className="block w-full py-0.5 md:table-cell md:w-auto md:py-2">
                  <div className="text-left">Basic Plan - Annualy</div>
                </td>
                <td className="block w-full py-0.5 md:table-cell md:w-auto md:py-2">
                  <div className="text-left font-medium">$349.00</div>
                </td>
                <td className="block w-full py-0.5 md:table-cell md:w-auto md:py-2">
                  <div className="flex items-center text-right md:justify-end">
                    <a
                      className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
                      href="#0"
                    >
                      HTML
                    </a>
                    <span className="mx-2 block h-4 w-px bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
                    <a
                      className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
                      href="#0"
                    >
                      PDF
                    </a>
                  </div>
                </td>
              </tr>
              {/* Row */}
              <tr className="md:flex-no-wrap flex flex-wrap border-b border-gray-200 py-2 md:table-row md:py-0 dark:border-gray-700/60">
                <td className="block w-full py-0.5 md:table-cell md:w-auto md:py-2">
                  <div className="text-left font-medium text-gray-800 dark:text-gray-100">2024</div>
                </td>
                <td className="block w-full py-0.5 md:table-cell md:w-auto md:py-2">
                  <div className="text-left">Basic Plan - Annualy</div>
                </td>
                <td className="block w-full py-0.5 md:table-cell md:w-auto md:py-2">
                  <div className="text-left font-medium">$349.00</div>
                </td>
                <td className="block w-full py-0.5 md:table-cell md:w-auto md:py-2">
                  <div className="flex items-center text-right md:justify-end">
                    <a
                      className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
                      href="#0"
                    >
                      HTML
                    </a>
                    <span className="mx-2 block h-4 w-px bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
                    <a
                      className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
                      href="#0"
                    >
                      PDF
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      {/* Panel footer */}
      <footer>
        <div className="flex flex-col border-t border-gray-200 px-6 py-5 dark:border-gray-700/60">
          <div className="flex self-end">
            <button className="btn border-gray-200 text-gray-800 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600">
              Cancel
            </button>
            <button className="btn ml-3 bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
              Save Changes
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
