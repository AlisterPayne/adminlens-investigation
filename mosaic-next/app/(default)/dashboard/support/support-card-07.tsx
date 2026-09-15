import Link from "next/link";

export default function SupportCard07() {
  return (
    <div className="col-span-full flex flex-col rounded-xl bg-white shadow-sm sm:col-span-6 dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">CSAT by Channel</h2>
      </header>
      <div className="grow p-3">
        <div className="flex h-full flex-col">
          {/* Card content */}
          <div className="grow">
            <ul className="flex justify-between space-x-2 px-2 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500">
              <li>Channel</li>
              <li>Score</li>
            </ul>

            <ul className="mt-3 mb-4 space-y-1 text-sm text-gray-800 dark:text-gray-100">
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "96%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Live Chat</div>
                  <div className="font-medium">4.8</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "92%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Email</div>
                  <div className="font-medium">4.6</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "88%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Phone</div>
                  <div className="font-medium">4.4</div>
                </div>
              </li>
              {/* Item */}
              <li className="relative px-2 py-1">
                <div
                  className="absolute inset-0 rounded-r bg-violet-100 dark:bg-violet-500/20"
                  aria-hidden="true"
                  style={{ width: "84%" }}
                ></div>
                <div className="relative flex justify-between space-x-2">
                  <div>Help Center</div>
                  <div className="font-medium">4.2</div>
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
                  <div>Social Media</div>
                  <div className="font-medium">3.9</div>
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
                  <div>In-App Widget</div>
                  <div className="font-medium">3.6</div>
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
              CSAT Report -&gt;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
