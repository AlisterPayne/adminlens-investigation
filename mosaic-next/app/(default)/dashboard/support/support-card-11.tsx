export default function SupportCard11() {
  return (
    <div className="col-span-full rounded-xl bg-white shadow-sm dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Agent Activity</h2>
      </header>
      <div className="p-3">
        {/* Card content */}
        {/* "Today" group */}
        <div>
          <header className="rounded-xs bg-gray-50 p-2 text-xs font-semibold text-gray-400 uppercase dark:bg-gray-700/50 dark:text-gray-500">
            Today
          </header>
          <ul className="my-1">
            {/* Item */}
            <li className="flex px-2">
              <div className="my-2 mr-3 h-9 w-9 shrink-0 rounded-full bg-green-500">
                <svg className="h-9 w-9 fill-current text-white" viewBox="0 0 36 36">
                  <path d="M15 13v-3l-5 4 5 4v-3h8a1 1 0 000-2h-8zM21 21h-8a1 1 0 000 2h8v3l5-4-5-4v3z" />
                </svg>
              </div>
              <div className="flex grow items-center border-b border-gray-100 py-2 text-sm dark:border-gray-700/60">
                <div className="flex grow justify-between">
                  <div className="self-center">
                    <a
                      className="font-medium text-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white"
                      href="#0"
                    >
                      Alex Rivera
                    </a>{" "}
                    resolved ticket{" "}
                    <a
                      className="font-medium text-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white"
                      href="#0"
                    >
                      #TK-4808
                    </a>
                  </div>
                  <div className="ml-2 shrink-0 self-end">
                    <a
                      className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
                      href="#0"
                    >
                      View<span className="hidden sm:inline"> -&gt;</span>
                    </a>
                  </div>
                </div>
              </div>
            </li>
            {/* Item */}
            <li className="flex px-2">
              <div className="my-2 mr-3 h-9 w-9 shrink-0 rounded-full bg-violet-500">
                <svg className="h-9 w-9 fill-current text-white" viewBox="0 0 36 36">
                  <path d="M18 10c-4.4 0-8 3.1-8 7s3.6 7 8 7h.6l5.4 2v-4.4c1.2-1.2 2-2.8 2-4.6 0-3.9-3.6-7-8-7zm4 10.8v2.3L18.9 22H18c-3.3 0-6-2.2-6-5s2.7-5 6-5 6 2.2 6 5c0 2.2-2 3.8-2 3.8z" />
                </svg>
              </div>
              <div className="flex grow items-center border-b border-gray-100 py-2 text-sm dark:border-gray-700/60">
                <div className="flex grow justify-between">
                  <div className="self-center">
                    <a
                      className="font-medium text-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white"
                      href="#0"
                    >
                      Jamie Park
                    </a>{" "}
                    replied to{" "}
                    <a
                      className="font-medium text-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white"
                      href="#0"
                    >
                      #TK-4819
                    </a>
                  </div>
                  <div className="ml-2 shrink-0 self-end">
                    <a
                      className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
                      href="#0"
                    >
                      View<span className="hidden sm:inline"> -&gt;</span>
                    </a>
                  </div>
                </div>
              </div>
            </li>
            {/* Item */}
            <li className="flex px-2">
              <div className="my-2 mr-3 h-9 w-9 shrink-0 rounded-full bg-sky-500">
                <svg className="h-9 w-9 fill-current text-white" viewBox="0 0 36 36">
                  <path d="M23 11v2.085c-2.841.401-4.41 2.462-5.8 4.315-1.449 1.932-2.7 3.6-5.2 3.6h-1v2h1c3.5 0 5.253-2.338 6.8-4.4 1.449-1.932 2.7-3.6 5.2-3.6h3l-4-4zM15.406 16.455c.066-.087.125-.162.194-.254.314-.419.656-.872 1.033-1.33C15.475 13.802 14.038 13 12 13h-1v2h1c1.471 0 2.505.586 3.406 1.455zM24 21c-1.471 0-2.505-.586-3.406-1.455-.066.087-.125.162-.194.254-.316.422-.656.873-1.028 1.328.959.878 2.108 1.573 3.628 1.788V25l4-4h-3z" />
                </svg>
              </div>
              <div className="flex grow items-center py-2 text-sm">
                <div className="flex grow justify-between">
                  <div className="self-center">
                    <a
                      className="font-medium text-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white"
                      href="#0"
                    >
                      Chris Nolan
                    </a>{" "}
                    escalated{" "}
                    <a
                      className="font-medium text-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white"
                      href="#0"
                    >
                      #TK-4816
                    </a>{" "}
                    to Tier 2
                  </div>
                  <div className="ml-2 shrink-0 self-end">
                    <a
                      className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
                      href="#0"
                    >
                      View<span className="hidden sm:inline"> -&gt;</span>
                    </a>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        {/* "Yesterday" group */}
        <div>
          <header className="rounded-xs bg-gray-50 p-2 text-xs font-semibold text-gray-400 uppercase dark:bg-gray-700/50 dark:text-gray-500">
            Yesterday
          </header>
          <ul className="my-1">
            {/* Item */}
            <li className="flex px-2">
              <div className="my-2 mr-3 h-9 w-9 shrink-0 rounded-full bg-green-500">
                <svg className="h-9 w-9 fill-current text-white" viewBox="0 0 36 36">
                  <path d="M15 13v-3l-5 4 5 4v-3h8a1 1 0 000-2h-8zM21 21h-8a1 1 0 000 2h8v3l5-4-5-4v3z" />
                </svg>
              </div>
              <div className="flex grow items-center border-b border-gray-100 py-2 text-sm dark:border-gray-700/60">
                <div className="flex grow justify-between">
                  <div className="self-center">
                    <a
                      className="font-medium text-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white"
                      href="#0"
                    >
                      Morgan Lee
                    </a>{" "}
                    closed ticket{" "}
                    <a
                      className="font-medium text-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white"
                      href="#0"
                    >
                      #TK-4795
                    </a>
                  </div>
                  <div className="ml-2 shrink-0 self-end">
                    <a
                      className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
                      href="#0"
                    >
                      View<span className="hidden sm:inline"> -&gt;</span>
                    </a>
                  </div>
                </div>
              </div>
            </li>
            {/* Item */}
            <li className="flex px-2">
              <div className="my-2 mr-3 h-9 w-9 shrink-0 rounded-full bg-red-500">
                <svg className="h-9 w-9 fill-current text-white" viewBox="0 0 36 36">
                  <path d="M25 24H11a1 1 0 01-1-1v-5h2v4h12v-4h2v5a1 1 0 01-1 1zM14 13h8v2h-8z" />
                </svg>
              </div>
              <div className="flex grow items-center py-2 text-sm">
                <div className="flex grow justify-between">
                  <div className="self-center">
                    <a
                      className="font-medium text-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white"
                      href="#0"
                    >
                      Alex Rivera
                    </a>{" "}
                    merged duplicate tickets{" "}
                    <a
                      className="font-medium text-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white"
                      href="#0"
                    >
                      #TK-4788
                    </a>{" "}
                    and{" "}
                    <a
                      className="font-medium text-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white"
                      href="#0"
                    >
                      #TK-4789
                    </a>
                  </div>
                  <div className="ml-2 shrink-0 self-end">
                    <a
                      className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
                      href="#0"
                    >
                      View<span className="hidden sm:inline"> -&gt;</span>
                    </a>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
