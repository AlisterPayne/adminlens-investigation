export const metadata = {
  title: "Tabs - Mosaic",
  description: "Page description",
};

export default function TabsLibrary() {
  return (
    <div className="relative h-full bg-white dark:bg-gray-900">
      <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Tabs</h1>
        </div>

        <div>
          {/* Components */}
          <div className="mt-8 space-y-8">
            {/* Simple */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Simple</h2>
              {/* Start */}
              <div className="mb-8 border-b border-gray-200 dark:border-gray-700/60">
                <ul className="no-scrollbar -mx-4 flex flex-nowrap overflow-x-scroll text-sm font-medium sm:-mx-6 lg:-mx-8">
                  <li className="mr-6 pb-3 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
                    <a className="whitespace-nowrap text-violet-500" href="#0">
                      Account
                    </a>
                  </li>
                  <li className="mr-6 pb-3 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
                    <a
                      className="whitespace-nowrap text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                      href="#0"
                    >
                      Notifications
                    </a>
                  </li>
                  <li className="mr-6 pb-3 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
                    <a
                      className="whitespace-nowrap text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                      href="#0"
                    >
                      Integrations
                    </a>
                  </li>
                  <li className="mr-6 pb-3 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
                    <a
                      className="whitespace-nowrap text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                      href="#0"
                    >
                      Plans
                    </a>
                  </li>
                  <li className="mr-6 pb-3 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
                    <a
                      className="whitespace-nowrap text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                      href="#0"
                    >
                      Billing
                    </a>
                  </li>
                </ul>
              </div>
              {/* End */}
            </div>

            {/* With Underline */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">With Underline</h2>
              {/* Start */}
              <div className="relative mb-8">
                <div className="absolute bottom-0 h-px w-full bg-gray-200 dark:bg-gray-700/60" aria-hidden="true"></div>
                <ul className="no-scrollbar relative -mx-4 flex flex-nowrap overflow-x-scroll text-sm font-medium sm:-mx-6 lg:-mx-8">
                  <li className="mr-6 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
                    <a className="block border-b-2 border-violet-500 pb-3 whitespace-nowrap text-violet-500" href="#0">
                      Account
                    </a>
                  </li>
                  <li className="mr-6 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
                    <a
                      className="block pb-3 whitespace-nowrap text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                      href="#0"
                    >
                      Notifications
                    </a>
                  </li>
                  <li className="mr-6 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
                    <a
                      className="block pb-3 whitespace-nowrap text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                      href="#0"
                    >
                      Integrations
                    </a>
                  </li>
                  <li className="mr-6 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
                    <a
                      className="block pb-3 whitespace-nowrap text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                      href="#0"
                    >
                      Plans
                    </a>
                  </li>
                  <li className="mr-6 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
                    <a
                      className="block pb-3 whitespace-nowrap text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                      href="#0"
                    >
                      Billing
                    </a>
                  </li>
                </ul>
              </div>
              {/* End */}
            </div>

            {/* With Icons */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">With Icons</h2>
              {/* Start */}
              <div className="mb-8 border-b border-gray-200 dark:border-gray-700/60">
                <ul className="no-scrollbar -mx-4 flex flex-nowrap overflow-x-scroll text-sm font-medium sm:-mx-6 lg:-mx-8">
                  <li className="mr-6 pb-3 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
                    <a className="flex items-center whitespace-nowrap text-violet-500" href="#0">
                      <svg className="mr-2 shrink-0 fill-current" width="16" height="16" viewBox=" 0 0 16 16">
                        <path d="M8 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-5.143 7.91a1 1 0 1 1-1.714-1.033A7.996 7.996 0 0 1 8 10a7.996 7.996 0 0 1 6.857 3.877 1 1 0 1 1-1.714 1.032A5.996 5.996 0 0 0 8 12a5.996 5.996 0 0 0-5.143 2.91Z" />
                      </svg>
                      <span>Account</span>
                    </a>
                  </li>
                  <li className="mr-6 pb-3 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
                    <a
                      className="flex items-center whitespace-nowrap text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                      href="#0"
                    >
                      <svg
                        className="mr-2 shrink-0 fill-current text-gray-400 dark:text-gray-500"
                        width="16"
                        height="16"
                        viewBox=" 0 0 16 16"
                      >
                        <path d="m9 12.614 4.806 1.374a.15.15 0 0 0 .174-.21L8.133 2.082a.15.15 0 0 0-.268 0L2.02 13.777a.149.149 0 0 0 .174.21L7 12.614V9a1 1 0 1 1 2 0v3.614Zm-1 1.794-5.257 1.503c-1.798.514-3.35-1.355-2.513-3.028L6.076 1.188c.791-1.584 3.052-1.584 3.845 0l5.848 11.695c.836 1.672-.714 3.54-2.512 3.028L8 14.408Z" />
                      </svg>
                      <span>Notifications</span>
                    </a>
                  </li>
                  <li className="mr-6 pb-3 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
                    <a
                      className="flex items-center whitespace-nowrap text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                      href="#0"
                    >
                      <svg
                        className="mr-2 shrink-0 fill-current text-gray-400 dark:text-gray-500"
                        width="16"
                        height="16"
                        viewBox=" 0 0 16 16"
                      >
                        <path d="M8 3.414V6a1 1 0 1 1-2 0V1a1 1 0 0 1 1-1h5a1 1 0 0 1 0 2H9.414l6.293 6.293a1 1 0 1 1-1.414 1.414L8 3.414Zm0 9.172V10a1 1 0 1 1 2 0v5a1 1 0 0 1-1 1H4a1 1 0 0 1 0-2h2.586L.293 7.707a1 1 0 0 1 1.414-1.414L8 12.586Z" />
                      </svg>
                      <span>Integrations</span>
                    </a>
                  </li>
                  <li className="mr-6 pb-3 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
                    <a
                      className="flex items-center whitespace-nowrap text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                      href="#0"
                    >
                      <svg
                        className="mr-2 shrink-0 fill-current text-gray-400 dark:text-gray-500"
                        width="16"
                        height="16"
                        viewBox=" 0 0 16 16"
                      >
                        <path d="M5 9a1 1 0 1 1 0-2h6a1 1 0 0 1 0 2H5ZM1 4a1 1 0 1 1 0-2h14a1 1 0 0 1 0 2H1Zm0 10a1 1 0 0 1 0-2h14a1 1 0 0 1 0 2H1Z" />
                      </svg>
                      <span>Plans</span>
                    </a>
                  </li>
                  <li className="mr-6 pb-3 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
                    <a
                      className="flex items-center whitespace-nowrap text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                      href="#0"
                    >
                      <svg
                        className="mr-2 shrink-0 fill-current text-gray-400 dark:text-gray-500"
                        width="16"
                        height="16"
                        viewBox=" 0 0 16 16"
                      >
                        <path d="M0 4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4Zm2 0v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Zm9 1a1 1 0 0 1 0 2H5a1 1 0 1 1 0-2h6Zm0 4a1 1 0 0 1 0 2H5a1 1 0 1 1 0-2h6Z" />
                      </svg>
                      <span>Billing</span>
                    </a>
                  </li>
                </ul>
              </div>
              {/* End */}
            </div>

            {/* With Container */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">With Container</h2>
              {/* Start */}
              <ul className="-m-1 flex flex-wrap">
                <li className="m-1">
                  <button className="inline-flex items-center justify-center rounded-full border border-transparent bg-gray-900 px-3 py-1 text-sm leading-5 font-medium text-white shadow-sm transition dark:bg-gray-100 dark:text-gray-800">
                    Account
                  </button>
                </li>
                <li className="m-1">
                  <button className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm leading-5 font-medium text-gray-500 shadow-sm transition hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600">
                    Notifications
                  </button>
                </li>
                <li className="m-1">
                  <button className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm leading-5 font-medium text-gray-500 shadow-sm transition hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600">
                    Integrations
                  </button>
                </li>
                <li className="m-1">
                  <button className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm leading-5 font-medium text-gray-500 shadow-sm transition hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600">
                    Plans
                  </button>
                </li>
                <li className="m-1">
                  <button className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm leading-5 font-medium text-gray-500 shadow-sm transition hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600">
                    Billing
                  </button>
                </li>
              </ul>
              {/* End */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
