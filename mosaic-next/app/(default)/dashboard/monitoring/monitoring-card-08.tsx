import Link from "next/link";

export default function MonitoringCard08() {
  return (
    <div className="col-span-full flex flex-col rounded-xl bg-white shadow-sm sm:col-span-6 dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Traffic by Region</h2>
      </header>
      <div className="grow p-3">
        <div className="flex h-full flex-col">
          {/* Card content */}
          <div className="grow">
            <ul className="flex justify-between space-x-2 px-2 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500">
              <li>Region</li>
              <li>Requests / min</li>
            </ul>

            <ul className="mt-3 mb-4 space-y-1 text-sm text-gray-800 dark:text-gray-100">
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "88%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>US East (N. Virginia)</div>
                  <div className="font-medium">6,240</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "72%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>EU West (Ireland)</div>
                  <div className="font-medium">5,120</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "58%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>US West (Oregon)</div>
                  <div className="font-medium">4,180</div>
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
                  <div>Asia Pacific (Tokyo)</div>
                  <div className="font-medium">3,020</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "34%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Asia Pacific (Singapore)</div>
                  <div className="font-medium">2,440</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "24%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>South America (São Paulo)</div>
                  <div className="font-medium">1,720</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "16%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Middle East (Bahrain)</div>
                  <div className="font-medium">1,140</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "10%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Africa (Cape Town)</div>
                  <div className="font-medium">680</div>
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
              Regional Report -&gt;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
