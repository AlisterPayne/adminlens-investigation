export const metadata = {
  title: "Changelog - Mosaic",
  description: "Page description",
};

import Image from "next/image";

import PaginationClassic from "@/components/pagination-classic";
import User01 from "@/public/images/user-32-01.jpg";
import User02 from "@/public/images/user-32-02.jpg";
import User07 from "@/public/images/user-32-07.jpg";

export default function Roadmap() {
  return (
    <div className="relative h-full bg-white dark:bg-gray-900">
      {/* Page header */}
      <div className="border-b border-gray-200 px-4 py-8 sm:flex sm:items-center sm:justify-between sm:px-6 dark:border-gray-700/60">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Changelog</h1>
        </div>

        {/* Right: Actions */}
        <div className="grid grid-flow-col justify-start gap-2 sm:auto-cols-max sm:justify-end">
          {/* Add entry button */}
          <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
            Add Entry
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
        <div className="m-auto max-w-3xl">
          {/* Filters */}
          <div className="mb-2 xl:-translate-x-16 xl:pl-32">
            <ul className="-m-1 flex flex-wrap">
              <li className="m-1">
                <button className="inline-flex items-center justify-center rounded-full border border-transparent bg-gray-900 px-3 py-1 text-sm leading-5 font-medium text-white shadow-sm transition dark:bg-gray-100 dark:text-gray-800">
                  View All
                </button>
              </li>
              <li className="m-1">
                <button className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm leading-5 font-medium text-gray-500 shadow-sm transition hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600">
                  Announcements
                </button>
              </li>
              <li className="m-1">
                <button className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm leading-5 font-medium text-gray-500 shadow-sm transition hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600">
                  Bug Fix
                </button>
              </li>
              <li className="m-1">
                <button className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm leading-5 font-medium text-gray-500 shadow-sm transition hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600">
                  Product
                </button>
              </li>
              <li className="m-1">
                <button className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm leading-5 font-medium text-gray-500 shadow-sm transition hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600">
                  Exciting News
                </button>
              </li>
            </ul>
          </div>

          {/* Posts */}
          <div className="xl:-translate-x-16">
            {/* Post */}
            <article className="pt-6">
              <div className="xl:flex">
                <div className="w-32 shrink-0">
                  <div className="text-xs font-semibold text-gray-400 uppercase xl:leading-8 dark:text-gray-500">
                    8 July, 2024
                  </div>
                </div>
                <div className="grow border-b border-gray-200 pb-6 dark:border-gray-700/60">
                  <header>
                    <h2 className="mb-3 text-2xl font-bold text-gray-800 dark:text-gray-100">Released version 2.0</h2>
                    <div className="mb-4 flex flex-nowrap items-center space-x-2">
                      <div className="flex items-center">
                        <a className="mr-2 block shrink-0" href="#0">
                          <Image
                            className="box-content rounded-full border-2 border-white dark:border-gray-800"
                            src={User07}
                            width={32}
                            height={32}
                            alt="User 04"
                          />
                        </a>
                        <a className="block text-sm font-semibold text-gray-800 dark:text-gray-100" href="#0">
                          Simona Lürwer
                        </a>
                      </div>
                      <div className="text-gray-400 dark:text-gray-600">·</div>
                      <div>
                        <div className="inline-flex rounded-full bg-green-500/20 px-2.5 py-1 text-center text-xs font-medium text-green-700">
                          Product
                        </div>
                      </div>
                    </div>
                  </header>
                  <div className="space-y-3">
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                      nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <p>
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                      pariatur excepteur sint occaecat cupidatat non proident.
                    </p>
                  </div>
                </div>
              </div>
            </article>
            {/* Post */}
            <article className="pt-6">
              <div className="xl:flex">
                <div className="w-32 shrink-0">
                  <div className="text-xs font-semibold text-gray-400 uppercase xl:leading-8 dark:text-gray-500">
                    6 July, 2024
                  </div>
                </div>
                <div className="grow border-b border-gray-200 pb-6 dark:border-gray-700/60">
                  <header>
                    <h2 className="mb-3 text-2xl font-bold text-gray-800 dark:text-gray-100">
                      Feature Name is now public 🎉
                    </h2>
                    <div className="mb-4 flex flex-nowrap items-center space-x-2">
                      <div className="flex items-center">
                        <a className="mr-2 block shrink-0" href="#0">
                          <Image
                            className="box-content rounded-full border-2 border-white dark:border-gray-800"
                            src={User02}
                            width={32}
                            height={32}
                            alt="User 04"
                          />
                        </a>
                        <a className="block text-sm font-semibold text-gray-800 dark:text-gray-100" href="#0">
                          Danielle Cohen
                        </a>
                      </div>
                      <div className="text-gray-400 dark:text-gray-600">·</div>
                      <div>
                        <div className="inline-flex rounded-full bg-yellow-500/20 px-2.5 py-1 text-center text-xs font-medium text-yellow-700">
                          Announcement
                        </div>
                      </div>
                    </div>
                  </header>
                  <div className="space-y-3">
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                      nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <p>
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                      pariatur excepteur sint occaecat cupidatat non proident.
                    </p>
                  </div>
                </div>
              </div>
            </article>
            {/* Post */}
            <article className="pt-6">
              <div className="xl:flex">
                <div className="w-32 shrink-0">
                  <div className="text-xs font-semibold text-gray-400 uppercase xl:leading-8 dark:text-gray-500">
                    4 July, 2024
                  </div>
                </div>
                <div className="grow border-b border-gray-200 pb-6 dark:border-gray-700/60">
                  <header>
                    <h2 className="mb-3 text-2xl font-bold text-gray-800 dark:text-gray-100">
                      Bugs fixed, issues, and more
                    </h2>
                    <div className="mb-4 flex flex-nowrap items-center space-x-2">
                      <div className="flex items-center">
                        <a className="mr-2 block shrink-0" href="#0">
                          <Image
                            className="box-content rounded-full border-2 border-white dark:border-gray-800"
                            src={User01}
                            width={32}
                            height={32}
                            alt="User 04"
                          />
                        </a>
                        <a className="block text-sm font-semibold text-gray-800 dark:text-gray-100" href="#0">
                          Patrick Kumar
                        </a>
                      </div>
                      <div className="text-gray-400 dark:text-gray-600">·</div>
                      <div>
                        <div className="inline-flex rounded-full bg-red-500/20 px-2.5 py-1 text-center text-xs font-medium text-red-700">
                          Bug Fix
                        </div>
                      </div>
                    </div>
                  </header>
                  <div className="space-y-3">
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                      nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <p>
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                      pariatur excepteur sint occaecat cupidatat non proident.
                    </p>
                    <ul className="list-inside list-disc space-y-1">
                      <li>E-commerce: Better lorem ipsum generator.</li>
                      <li>Booking: Lorem ipsum post generator.</li>
                      <li>Retail: Better lorem ipsum generator.</li>
                      <li>Services: Better lorem ipsum generator.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </article>
            {/* Post */}
            <article className="pt-6">
              <div className="xl:flex">
                <div className="w-32 shrink-0">
                  <div className="text-xs font-semibold text-gray-400 uppercase xl:leading-8 dark:text-gray-500">
                    2 July, 2024
                  </div>
                </div>
                <div className="grow border-b border-gray-200 pb-6 dark:border-gray-700/60">
                  <header>
                    <h2 className="mb-3 text-2xl font-bold text-gray-800 dark:text-gray-100">Thanks, everyone 🙌</h2>
                    <div className="mb-4 flex flex-nowrap items-center space-x-2">
                      <div className="flex items-center">
                        <a className="mr-2 block shrink-0" href="#0">
                          <Image
                            className="box-content rounded-full border-2 border-white dark:border-gray-800"
                            src={User02}
                            width={32}
                            height={32}
                            alt="User 04"
                          />
                        </a>
                        <a className="block text-sm font-semibold text-gray-800 dark:text-gray-100" href="#0">
                          Danielle Cohen
                        </a>
                      </div>
                      <div className="text-gray-400 dark:text-gray-600">·</div>
                      <div>
                        <div className="inline-flex rounded-full bg-sky-500/20 px-2.5 py-1 text-center text-xs font-medium text-sky-700">
                          Exciting News
                        </div>
                      </div>
                    </div>
                  </header>
                  <div className="space-y-3">
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                      nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <p>
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                      pariatur excepteur sint occaecat cupidatat non proident.
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Pagination */}
          <div className="mt-6 xl:-translate-x-16 xl:pl-32">
            <PaginationClassic />
          </div>
        </div>
      </div>
    </div>
  );
}
