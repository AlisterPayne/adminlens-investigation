export const metadata = {
  title: "Alert - Mosaic",
  description: "Page description",
};

import Banners01 from "./banners-01";
import Banners02 from "./banners-02";
import Notifications from "./notifications";
import Toasts01 from "./toasts-01";
import Toasts02 from "./toasts-02";
import Toasts03 from "./toasts-03";

export default function AlertLibrary() {
  return (
    <div className="relative h-full bg-white dark:bg-gray-900">
      <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Alert & Banner</h1>
        </div>

        <div>
          {/* Components */}
          <div className="mt-8 space-y-8">
            {/* Banner */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Banner</h2>
              <Banners01 />
            </div>

            {/* Banner 2 */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Banner 2</h2>
              <Banners02 />
            </div>

            {/* Toast */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Toast</h2>
              <Toasts01 />
            </div>

            {/* Toast 2 */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Toast 2</h2>
              <Toasts02 />
            </div>

            {/* Toast 3 */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Toast 3</h2>
              <Toasts03 />
            </div>

            {/* Notifications */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Notifications</h2>
              <Notifications />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
