export const metadata = {
  title: "Breadcrumb - Mosaic",
  description: "Page description",
};

export default function BreadcrumbLibrary() {
  return (
    <div className="relative h-full bg-white dark:bg-gray-900">
      <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Breadcrumb</h1>
        </div>

        <div>
          {/* Components */}
          <div className="mt-8 space-y-8">
            {/* With Slashes */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">With Slashes</h2>
              <div className="rounded-lg bg-gray-100 px-6 py-8 dark:bg-gray-800/50">
                <div className="text-center">
                  {/* Start */}
                  <ul className="inline-flex flex-wrap text-sm font-medium">
                    <li className="after:px-2 after:text-gray-400 after:content-['/'] last:after:hidden dark:after:text-gray-600">
                      <a
                        className="text-gray-500 hover:text-violet-500 dark:text-gray-400 dark:hover:text-violet-500"
                        href="#0"
                      >
                        Home
                      </a>
                    </li>
                    <li className="after:px-2 after:text-gray-400 after:content-['/'] last:after:hidden dark:after:text-gray-600">
                      <a
                        className="text-gray-500 hover:text-violet-500 dark:text-gray-400 dark:hover:text-violet-500"
                        href="#0"
                      >
                        Settings
                      </a>
                    </li>
                    <li className="after:px-2 after:text-gray-400 after:content-['/'] last:after:hidden dark:after:text-gray-600">
                      <a
                        className="text-gray-500 hover:text-violet-500 dark:text-gray-400 dark:hover:text-violet-500"
                        href="#0"
                      >
                        Notifications
                      </a>
                    </li>
                  </ul>
                  {/* End */}
                </div>
              </div>
            </div>

            {/* With Dots */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">With Dots</h2>
              <div className="rounded-lg bg-gray-100 px-6 py-8 dark:bg-gray-800/50">
                <div className="text-center">
                  {/* Start */}
                  <ul className="inline-flex flex-wrap text-sm font-medium">
                    <li className="after:px-2 after:text-gray-400 after:content-['·'] last:after:hidden dark:after:text-gray-600">
                      <a
                        className="text-gray-500 hover:text-violet-500 dark:text-gray-400 dark:hover:text-violet-500"
                        href="#0"
                      >
                        Home
                      </a>
                    </li>
                    <li className="after:px-2 after:text-gray-400 after:content-['·'] last:after:hidden dark:after:text-gray-600">
                      <a
                        className="text-gray-500 hover:text-violet-500 dark:text-gray-400 dark:hover:text-violet-500"
                        href="#0"
                      >
                        Settings
                      </a>
                    </li>
                    <li className="after:px-2 after:text-gray-400 after:content-['·'] last:after:hidden dark:after:text-gray-600">
                      <a
                        className="text-gray-500 hover:text-violet-500 dark:text-gray-400 dark:hover:text-violet-500"
                        href="#0"
                      >
                        Notifications
                      </a>
                    </li>
                  </ul>
                  {/* End */}
                </div>
              </div>
            </div>

            {/* With Chevrons */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">With Chevrons</h2>
              <div className="rounded-lg bg-gray-100 px-6 py-8 dark:bg-gray-800/50">
                <div className="text-center">
                  {/* Start */}
                  <ul className="inline-flex flex-wrap text-sm font-medium">
                    <li className="flex items-center">
                      <a
                        className="text-gray-500 hover:text-violet-500 dark:text-gray-400 dark:hover:text-violet-500"
                        href="#0"
                      >
                        Home
                      </a>
                      <svg
                        className="mx-3 fill-current text-gray-400 dark:text-gray-600"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                      >
                        <path d="M6.6 13.4L5.2 12l4-4-4-4 1.4-1.4L12 8z" />
                      </svg>
                    </li>
                    <li className="flex items-center">
                      <a
                        className="text-gray-500 hover:text-violet-500 dark:text-gray-400 dark:hover:text-violet-500"
                        href="#0"
                      >
                        Settings
                      </a>
                      <svg
                        className="mx-3 fill-current text-gray-400 dark:text-gray-600"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                      >
                        <path d="M6.6 13.4L5.2 12l4-4-4-4 1.4-1.4L12 8z" />
                      </svg>
                    </li>
                    <li className="flex items-center">
                      <a
                        className="text-gray-500 hover:text-violet-500 dark:text-gray-400 dark:hover:text-violet-500"
                        href="#0"
                      >
                        Notifications
                      </a>
                    </li>
                  </ul>
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
