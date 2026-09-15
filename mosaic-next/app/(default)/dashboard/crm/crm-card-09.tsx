import Link from "next/link";

export default function CrmCard09() {
  return (
    <div className="col-span-full flex flex-col rounded-xl bg-white shadow-sm sm:col-span-6 dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Lead Conversion Funnel</h2>
      </header>
      <div className="grow p-3">
        <div className="flex h-full flex-col">
          {/* Card content */}
          <div className="grow">
            <ul className="flex justify-between space-x-2 px-2 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500">
              <li>Stage</li>
              <li>Count</li>
            </ul>

            <ul className="mt-3 mb-4 space-y-1 text-sm text-gray-800 dark:text-gray-100">
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-sky-100 dark:bg-sky-500/20"
                  aria-hidden="true"
                  style={{ width: "100%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Visits</div>
                  <div className="font-medium">12.4K</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-sky-100 dark:bg-sky-500/20"
                  aria-hidden="true"
                  style={{ width: "62%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Leads</div>
                  <div className="font-medium">7.7K</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "38%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>MQL</div>
                  <div className="font-medium">4.7K</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "22%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>SQL</div>
                  <div className="font-medium">2.7K</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-green-100 dark:bg-green-500/20"
                  aria-hidden="true"
                  style={{ width: "12%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Won</div>
                  <div className="font-medium">1.5K</div>
                </div>
              </li>
            </ul>
          </div>
          {/* Card footer */}
          <div className="border-t border-gray-100 pt-4 pb-1 text-center dark:border-gray-700/60">
            <Link
              className="text-sm font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
              href="#0"
            >
              Funnel Report -&gt;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
