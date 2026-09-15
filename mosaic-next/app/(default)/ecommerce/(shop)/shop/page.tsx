export const metadata = {
  title: "Shop - Mosaic",
  description: "Page description",
};

import ShopCards01 from "../shop-cards-01";
import ShopCards02 from "../shop-cards-02";
import ShopCards03 from "../shop-cards-03";
import ShopCards04 from "../shop-cards-04";
import ShopCards05 from "../shop-cards-05";
import ShopCards06 from "../shop-cards-06";

export default function Shop() {
  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-5">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">
          Find the right product for you
        </h1>
      </div>

      {/* Search form */}
      <div className="mb-5 max-w-xl">
        <form className="relative">
          <label htmlFor="app-search" className="sr-only">
            Search
          </label>
          <input id="app-search" className="form-input w-full bg-white py-3 pl-9 dark:bg-gray-800" type="search" />
          <button className="group absolute inset-0 right-auto" type="submit" aria-label="Search">
            <svg
              className="mr-2 ml-3 shrink-0 fill-current text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
              <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700/60">
        <ul className="no-scrollbar -mx-4 flex flex-nowrap overflow-x-scroll text-sm font-medium sm:-mx-6 lg:-mx-8">
          <li className="mr-6 pb-3 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
            <a className="whitespace-nowrap text-violet-500" href="#0">
              View All
            </a>
          </li>
          <li className="mr-6 pb-3 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
            <a
              className="whitespace-nowrap text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              href="#0"
            >
              Courses
            </a>
          </li>
          <li className="mr-6 pb-3 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
            <a
              className="whitespace-nowrap text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              href="#0"
            >
              Digital Goods
            </a>
          </li>
          <li className="mr-6 pb-3 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
            <a
              className="whitespace-nowrap text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              href="#0"
            >
              Online Events
            </a>
          </li>
          <li className="mr-6 pb-3 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
            <a
              className="whitespace-nowrap text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              href="#0"
            >
              Crowdfunding
            </a>
          </li>
        </ul>
      </div>

      {/* Page content */}
      <div>
        {/* Cards 1 (Video Courses) */}
        <div className="mt-8">
          <h2 className="mb-5 text-xl leading-snug font-bold text-gray-800 dark:text-gray-100">Video Courses</h2>
          <div className="grid grid-cols-12 gap-6">
            <ShopCards01 />
          </div>
        </div>

        {/* Cards 2 (Digital Goods) */}
        <div className="mt-8">
          <h2 className="mb-5 text-xl leading-snug font-bold text-gray-800 dark:text-gray-100">Digital Goods</h2>
          <div className="grid grid-cols-12 gap-6">
            <ShopCards02 />
          </div>
        </div>

        {/* Cards 3 (Online Events) */}
        <div className="mt-8">
          <h2 className="mb-5 text-xl leading-snug font-bold text-gray-800 dark:text-gray-100">Online Events</h2>
          <div className="grid grid-cols-12 gap-6">
            <ShopCards03 />
          </div>
        </div>

        {/* Cards 4 (Crowdfunding) */}
        <div className="mt-8">
          <h2 className="mb-5 text-xl leading-snug font-bold text-gray-800 dark:text-gray-100">Crowdfunding</h2>
          <div className="grid grid-cols-12 gap-6">
            <ShopCards04 />
          </div>
        </div>

        {/* Cards 5 (Popular Categories) */}
        <div className="mt-8">
          <h2 className="mb-5 text-xl leading-snug font-bold text-gray-800 dark:text-gray-100">Popular Categories</h2>
          <div className="grid grid-cols-12 gap-6">
            <ShopCards05 />
          </div>
        </div>

        {/* Cards 6 (Trending Now) */}
        <div className="mt-8">
          <h2 className="mb-5 text-xl leading-snug font-bold text-gray-800 dark:text-gray-100">Trending Now</h2>
          <div className="grid grid-cols-12 gap-6">
            <ShopCards06 />
          </div>
        </div>
      </div>
    </div>
  );
}
