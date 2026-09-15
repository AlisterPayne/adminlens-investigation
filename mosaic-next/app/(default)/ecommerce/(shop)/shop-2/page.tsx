export const metadata = {
  title: "Shop 2 - Mosaic",
  description: "Page description",
};

import PaginationClassic from "@/components/pagination-classic";

import ShopCards07 from "../shop-cards-07";
import ShopSidebar from "../shop-sidebar";

export default function Shop2() {
  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-5">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">
          Find the right product for you
        </h1>
      </div>

      {/* Page content */}
      <div className="mt-9 flex flex-col space-y-10 sm:flex-row sm:space-y-0 sm:space-x-6 md:flex-col md:space-y-10 md:space-x-0 xl:flex-row xl:space-y-0 xl:space-x-6">
        {/* Sidebar */}
        <ShopSidebar />

        {/* Content */}
        <div>
          {/* Filters */}
          <div className="mb-5">
            <ul className="-m-1 flex flex-wrap">
              <li className="m-1">
                <button className="inline-flex items-center justify-center rounded-full border border-transparent bg-gray-900 px-3 py-1 text-sm leading-5 font-medium text-white shadow-sm transition dark:bg-gray-100 dark:text-gray-800">
                  View All
                </button>
              </li>
              <li className="m-1">
                <button className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm leading-5 font-medium text-gray-500 shadow-sm transition hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600">
                  Featured
                </button>
              </li>
              <li className="m-1">
                <button className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm leading-5 font-medium text-gray-500 shadow-sm transition hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600">
                  Newest
                </button>
              </li>
              <li className="m-1">
                <button className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm leading-5 font-medium text-gray-500 shadow-sm transition hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600">
                  Price - Low To High
                </button>
              </li>
              <li className="m-1">
                <button className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm leading-5 font-medium text-gray-500 shadow-sm transition hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600">
                  Price - High to Low
                </button>
              </li>
            </ul>
          </div>

          <div className="mb-4 text-sm text-gray-500 italic dark:text-gray-400">67.975 Items</div>

          {/* Cards 1 (Video Courses) */}
          <div>
            <div className="grid grid-cols-12 gap-6">
              <ShopCards07 />
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6">
            <PaginationClassic />
          </div>
        </div>
      </div>
    </div>
  );
}
