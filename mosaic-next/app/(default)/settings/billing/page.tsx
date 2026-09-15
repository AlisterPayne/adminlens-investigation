export const metadata = {
  title: "Billing Settings - Mosaic",
  description: "Page description",
};

import SettingsSidebar from "../settings-sidebar";
import BillingPanel from "./billing-panel";

export default function BillingSettings() {
  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Account Settings</h1>
      </div>

      {/* Content */}
      <div className="mb-8 rounded-xl bg-white shadow-sm dark:bg-gray-800">
        <div className="flex flex-col md:-mr-px md:flex-row">
          <SettingsSidebar />
          <BillingPanel />
        </div>
      </div>
    </div>
  );
}
