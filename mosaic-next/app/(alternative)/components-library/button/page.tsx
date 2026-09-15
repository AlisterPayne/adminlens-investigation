export const metadata = {
  title: "Button - Mosaic",
  description: "Page description",
};

export default function ButtonLibrary() {
  return (
    <div className="relative h-full bg-white dark:bg-gray-900">
      <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Button</h1>
        </div>

        <div>
          {/* Components */}
          <div className="mt-8 space-y-8">
            {/* Appearances */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Appearances</h2>
              <div className="-m-1.5 flex flex-wrap items-center">
                <div className="m-1.5">
                  {/* Start */}
                  <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                    Primary
                  </button>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <button className="btn border-gray-200 bg-white text-gray-800 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600">
                    Secondary
                  </button>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <button className="btn border-gray-200 bg-white text-violet-500 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-gray-600">
                    Tertiary
                  </button>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <button className="btn bg-red-500 text-white hover:bg-red-600">Danger</button>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <button className="btn border-gray-200 bg-white text-red-500 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-gray-600">
                    Danger
                  </button>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <button className="btn bg-green-500 text-white hover:bg-green-600">Success</button>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <button className="btn border-gray-200 bg-white text-green-500 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-gray-600">
                    Success
                  </button>
                  {/* End */}
                </div>
              </div>
            </div>

            {/* States */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">States</h2>
              <div className="-m-1.5 flex flex-wrap items-center">
                <div className="m-1.5">
                  {/* Start */}
                  <button
                    className="btn w-full bg-gray-900 text-gray-100 hover:bg-gray-800 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-white disabled:text-gray-300 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white dark:disabled:border-gray-700 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                    disabled
                  >
                    Disabled
                  </button>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <button
                    className="btn w-full bg-gray-900 text-gray-100 hover:bg-gray-800 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-white disabled:text-gray-300 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white dark:disabled:border-gray-700 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                    disabled
                  >
                    <svg className="shrink-0 animate-spin fill-current" width="16" height="16" viewBox="0 0 16 16">
                      <path d="M8 16a7.928 7.928 0 01-3.428-.77l.857-1.807A6.006 6.006 0 0014 8c0-3.309-2.691-6-6-6a6.006 6.006 0 00-5.422 8.572l-1.806.859A7.929 7.929 0 010 8c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
                    </svg>
                    <span className="ml-2">Loading</span>
                  </button>
                  {/* End */}
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Sizes</h2>
              <div className="-m-1.5 flex flex-wrap items-center">
                <div className="m-1.5">
                  {/* Start */}
                  <button className="btn-xs bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                    Button
                  </button>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <button className="btn-sm bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                    Button
                  </button>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                    Button
                  </button>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <button className="btn-lg bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                    Button
                  </button>
                  {/* End */}
                </div>
              </div>
            </div>

            {/* Buttons with an Icon */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Buttons with an Icon</h2>
              <div className="-m-1.5 flex flex-wrap items-center">
                <div className="m-1.5">
                  {/* Start */}
                  <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                    <svg className="shrink-0 fill-current text-gray-400" width="16" height="16" viewBox="0 0 16 16">
                      <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                    </svg>
                    <span className="ml-2">Add Event</span>
                  </button>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <button className="btn border-gray-200 bg-white text-gray-800 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600">
                    <svg
                      className="shrink-0 fill-current text-gray-400 dark:text-gray-500"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                    >
                      <path d="M11.7.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM4.6 14H2v-2.6l6-6L10.6 8l-6 6zM12 6.6L9.4 4 11 2.4 13.6 5 12 6.6z" />
                    </svg>
                    <span className="ml-2">Edit Content</span>
                  </button>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <button className="btn border-gray-200 bg-white text-red-500 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-gray-600">
                    <svg className="shrink-0 fill-current" width="16" height="16" viewBox="0 0 16 16">
                      <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
                    </svg>
                    <span className="ml-2">Delete</span>
                  </button>
                  {/* End */}
                </div>
              </div>
            </div>

            {/* Icon Buttons */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Icon Buttons</h2>
              <div className="-m-1.5 flex flex-wrap items-center">
                <div className="m-1.5">
                  {/* Start */}
                  <button className="btn border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-gray-600">
                    <svg
                      className="shrink-0 fill-current text-gray-400 dark:text-gray-500"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                    >
                      <path d="M11.7.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM4.6 14H2v-2.6l6-6L10.6 8l-6 6zM12 6.6L9.4 4 11 2.4 13.6 5 12 6.6z" />
                    </svg>
                  </button>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <button className="btn border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-gray-600">
                    <svg className="shrink-0 fill-current text-red-500" width="16" height="16" viewBox="0 0 16 16">
                      <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
                    </svg>
                  </button>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <button className="btn border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-gray-600">
                    <svg className="shrink-0 fill-current text-violet-500" width="16" height="16" viewBox="0 0 16 16">
                      <path d="M14.3 2.3L5 11.6 1.7 8.3c-.4-.4-1-.4-1.4 0-.4.4-.4 1 0 1.4l4 4c.2.2.4.3.7.3.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0z" />
                    </svg>
                  </button>
                  {/* End */}
                </div>
              </div>
            </div>

            {/* Button Groups */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Button Groups</h2>
              <div className="-m-1.5 flex flex-wrap items-center">
                <div className="m-1.5">
                  {/* Start */}
                  <div className="flex flex-wrap -space-x-px">
                    <button className="btn rounded-none border-gray-200 bg-white text-violet-500 first:rounded-l-lg last:rounded-r-lg dark:border-gray-700/60 dark:bg-gray-800">
                      Weekly
                    </button>
                    <button className="btn rounded-none border-gray-200 bg-white text-gray-600 first:rounded-l-lg last:rounded-r-lg hover:bg-gray-50 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-900">
                      Monthly
                    </button>
                    <button className="btn rounded-none border-gray-200 bg-white text-gray-600 first:rounded-l-lg last:rounded-r-lg hover:bg-gray-50 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-900">
                      Yearly
                    </button>
                  </div>
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
