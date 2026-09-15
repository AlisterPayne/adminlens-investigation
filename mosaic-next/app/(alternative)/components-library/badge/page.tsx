export const metadata = {
  title: "Badge - Mosaic",
  description: "Page description",
};

export default function BadgeLibrary() {
  return (
    <div className="relative h-full bg-white dark:bg-gray-900">
      <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Badge</h1>
        </div>

        <div>
          {/* Components */}
          <div className="mt-8 space-y-8">
            {/* Basic Small */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Basic Small</h2>
              <div className="-m-1.5 flex flex-wrap items-center">
                <div className="m-1.5">
                  {/* Start */}
                  <div className="btn-xs rounded-full bg-violet-500/20 px-2.5 py-1 text-xs text-violet-600 shadow-none">
                    Working on
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="inline-flex rounded-full bg-sky-500/20 px-2.5 py-1 text-center text-xs font-medium text-sky-700">
                    Exciting news
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="inline-flex rounded-full bg-green-500/20 px-2.5 py-1 text-center text-xs font-medium text-green-700">
                    Product
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="inline-flex rounded-full bg-yellow-500/20 px-2.5 py-1 text-center text-xs font-medium text-yellow-700">
                    Announcement
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="inline-flex rounded-full bg-red-500/20 px-2.5 py-1 text-center text-xs font-medium text-red-700">
                    Bug Fix
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="inline-flex rounded-full bg-blue-500/20 px-2.5 py-1 text-center text-xs font-medium text-blue-600">
                    Customer Stories
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="inline-flex rounded-full bg-gray-400/20 px-2.5 py-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                    All Stories
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="inline-flex rounded-full bg-gray-700 px-2.5 py-1 text-center text-xs font-medium text-gray-100 dark:bg-gray-200 dark:text-gray-600">
                    All Stories
                  </div>
                  {/* End */}
                </div>
              </div>
            </div>

            {/* Basic Large */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Basic Large</h2>
              <div className="-m-1.5 flex flex-wrap items-center">
                <div className="m-1.5">
                  {/* Start */}
                  <div className="inline-flex rounded-full bg-violet-500/20 px-2.5 py-1 text-center text-sm font-medium text-violet-600">
                    Working on
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="inline-flex rounded-full bg-sky-500/20 px-2.5 py-1 text-center text-sm font-medium text-sky-700">
                    Exciting news
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="inline-flex rounded-full bg-green-500/20 px-2.5 py-1 text-center text-sm font-medium text-green-700">
                    Product
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="inline-flex rounded-full bg-yellow-500/20 px-2.5 py-1 text-center text-sm font-medium text-yellow-700">
                    Announcement
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="inline-flex rounded-full bg-red-500/20 px-2.5 py-1 text-center text-sm font-medium text-red-700">
                    Bug Fix
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="inline-flex rounded-full bg-blue-500/20 px-2.5 py-1 text-center text-sm font-medium text-blue-600">
                    Customer Stories
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="inline-flex rounded-full bg-gray-400/20 px-2.5 py-1 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    All Stories
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="inline-flex rounded-full bg-gray-700 px-2.5 py-1 text-center text-sm font-medium text-gray-100 dark:bg-gray-200 dark:text-gray-600">
                    All Stories
                  </div>
                  {/* End */}
                </div>
              </div>
            </div>

            {/* Basic with Icon */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Basic with Icon</h2>
              <div className="-m-1.5 flex flex-wrap items-center">
                <div className="m-1.5">
                  {/* Start */}
                  <div className="inline-flex items-center rounded-full bg-gray-900/60 px-2 py-0.5 text-center text-xs font-medium text-gray-100">
                    <svg className="mr-1 h-3 w-3 shrink-0 fill-current text-yellow-500" viewBox="0 0 12 12">
                      <path d="M11.953 4.29a.5.5 0 00-.454-.292H6.14L6.984.62A.5.5 0 006.12.173l-6 7a.5.5 0 00.379.825h5.359l-.844 3.38a.5.5 0 00.864.445l6-7a.5.5 0 00.075-.534z" />
                    </svg>
                    <span>Special Offer</span>
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="inline-flex items-center rounded-full bg-gray-900/60 px-2 py-0.5 text-center text-sm font-medium text-gray-100">
                    <svg className="mr-1 h-3 w-3 shrink-0 fill-current text-yellow-500" viewBox="0 0 12 12">
                      <path d="M11.953 4.29a.5.5 0 00-.454-.292H6.14L6.984.62A.5.5 0 006.12.173l-6 7a.5.5 0 00.379.825h5.359l-.844 3.38a.5.5 0 00.864.445l6-7a.5.5 0 00.075-.534z" />
                    </svg>
                    <span>Special Offer</span>
                  </div>
                  {/* End */}
                </div>
              </div>
            </div>

            {/* Basic for Charts */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Basic for Charts</h2>
              <div className="-m-1.5 flex flex-wrap items-center">
                <div className="m-1.5">
                  {/* Start */}
                  <div className="rounded-full bg-green-500/20 px-1.5 text-sm font-medium text-green-700">+29%</div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="rounded-full bg-red-500/20 px-1.5 text-sm font-medium text-red-700">-14%</div>
                  {/* End */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
