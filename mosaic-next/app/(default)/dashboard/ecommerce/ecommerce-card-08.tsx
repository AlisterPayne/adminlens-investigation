import Link from "next/link";

export default function EcommerceCard08() {
  return (
    <div className="col-span-full flex flex-col rounded-xl bg-white shadow-sm sm:col-span-6 xl:col-span-4 dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Traffic Sources</h2>
      </header>
      <div className="grow p-3">
        <div className="flex h-full flex-col">
          {/* Card content */}
          <div className="grow">
            <ul className="flex justify-between space-x-2 px-2 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500">
              <li>Source</li>
              <li>Sessions</li>
            </ul>

            <ul className="mt-3 mb-4 space-y-1 text-sm text-gray-800 dark:text-gray-100">
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "38%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Direct</div>
                  <div className="font-medium">38.2K</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "32%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Organic</div>
                  <div className="font-medium">32.1K</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "18%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Social</div>
                  <div className="font-medium">18.4K</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "8%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Referral</div>
                  <div className="font-medium">8.6K</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "3%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Email</div>
                  <div className="font-medium">2.7K</div>
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
              Traffic Report -&gt;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
