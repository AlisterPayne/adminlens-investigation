import Link from "next/link";

export default function CrmCard07() {
  return (
    <div className="col-span-full flex flex-col rounded-xl bg-white shadow-sm sm:col-span-6 dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Sales Rep Leaderboard</h2>
      </header>
      <div className="grow p-3">
        <div className="flex h-full flex-col">
          {/* Card content */}
          <div className="grow">
            <ul className="flex justify-between space-x-2 px-2 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500">
              <li>Rep</li>
              <li>Revenue</li>
            </ul>

            <ul className="mt-3 mb-4 space-y-1 text-sm text-gray-800 dark:text-gray-100">
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "92%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Sarah Chen</div>
                  <div className="font-medium">$284K</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "78%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Marcus Webb</div>
                  <div className="font-medium">$241K</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "68%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Elena Rodriguez</div>
                  <div className="font-medium">$210K</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "54%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>James Okonkwo</div>
                  <div className="font-medium">$167K</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "42%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Priya Sharma</div>
                  <div className="font-medium">$130K</div>
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
              Full Leaderboard -&gt;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
