export const metadata = {
  title: "Dropdown - Mosaic",
  description: "Page description",
};

import DateSelect from "@/components/date-select";
import Datepicker from "@/components/datepicker";
import DropdownFilter from "@/components/dropdown-filter";
import DropdownFull from "@/components/dropdown-full";
import DropdownHelp from "@/components/dropdown-help";
import DropdownNotifications from "@/components/dropdown-notifications";
import DropdownProfile from "@/components/dropdown-profile";
import DropdownSwitch from "@/components/dropdown-switch";
import EditMenu from "@/components/edit-menu";

export default function DropdownLibrary() {
  return (
    <div className="relative h-full bg-white dark:bg-gray-900">
      <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Dropdown</h1>
        </div>

        <div>
          {/* Components */}
          <div className="mt-8 mb-80 space-y-8">
            {/* Classic Dropdown */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Classic Dropdown</h2>
              {/* Start */}
              <DateSelect />
              {/* End */}
            </div>

            {/* Full-width Dropdown */}
            <div className="w-80">
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Full-width Dropdown</h2>
              <DropdownFull />
            </div>

            {/* Filter */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Filter</h2>
              <DropdownFilter />
            </div>

            {/* Profile */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Profile</h2>
              <DropdownProfile />
            </div>

            {/* Switch Account */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Switch Account</h2>
              <DropdownSwitch />
            </div>

            {/* Notification */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Notification</h2>
              <DropdownNotifications />
            </div>

            {/* Help Center */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Help Center</h2>
              <DropdownHelp />
            </div>

            {/* Quick Selection */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Quick Selection</h2>
              <EditMenu />
            </div>

            {/* Datepicker (built with React Day Picker) */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">
                Datepicker (built with{" "}
                <a
                  className="underline hover:no-underline"
                  href="https://daypicker.dev"
                  target="_blank"
                  rel="noreferrer"
                >
                  React Day Picker
                </a>
                )
              </h2>
              <Datepicker />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
