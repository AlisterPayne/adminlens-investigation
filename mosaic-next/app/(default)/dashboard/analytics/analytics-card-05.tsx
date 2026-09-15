import Link from "next/link";

export default function AnalyticsCard05() {
  return (
    <div className="col-span-full flex flex-col rounded-xl bg-white shadow-sm sm:col-span-6 xl:col-span-4 dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Top Channels</h2>
      </header>
      <div className="grow p-3">
        <div className="flex h-full flex-col">
          {/* Card content */}
          <div className="grow">
            <ul className="flex justify-between space-x-2 px-2 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500">
              <li>Source</li>
              <li>Visitors</li>
            </ul>

            <ul className="mt-3 mb-4 space-y-1 text-sm text-gray-800 dark:text-gray-100">
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "82%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Google</div>
                  <div className="font-medium">4.7K</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "70%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Indiehackers.com</div>
                  <div className="font-medium">4.2K</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "60%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>DuckDuckGo</div>
                  <div className="font-medium">3.4K</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "44%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Hacker News</div>
                  <div className="font-medium">3.1K</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "40%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Github.com</div>
                  <div className="font-medium">2.2K</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "30%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Madewithvuejs.com</div>
                  <div className="font-medium">1.7K</div>
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
                  <div>Producthunt.com</div>
                  <div className="font-medium">924</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "12%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Dev.to</div>
                  <div className="font-medium">696</div>
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
              Channels Report -&gt;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
