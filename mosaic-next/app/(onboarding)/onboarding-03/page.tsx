export const metadata = {
  title: "Company information - Mosaic",
  description: "Page description",
};

import Link from "next/link";

import OnboardingHeader from "../onboarding-header";
import OnboardingImage from "../onboarding-image";
import OnboardingProgress from "../onboarding-progress";

export default function Onboarding03() {
  return (
    <main className="bg-white dark:bg-gray-900">
      <div className="relative flex">
        {/* Content */}
        <div className="w-full md:w-1/2">
          <div className="flex h-full min-h-[100dvh] flex-col after:flex-1">
            <div className="flex-1">
              <OnboardingHeader />
              <OnboardingProgress step={3} />
            </div>

            <div className="px-4 py-8">
              <div className="mx-auto max-w-md">
                <h1 className="mb-6 text-3xl font-bold text-gray-800 dark:text-gray-100">Company information</h1>
                {/* htmlForm */}
                <form>
                  <div className="mb-8 space-y-4">
                    {/* Company Name */}
                    <div>
                      <label className="mb-1 block text-sm font-medium" htmlFor="company-name">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input id="company-name" className="form-input w-full" type="text" />
                    </div>
                    {/* City and Postal Code */}
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <label className="mb-1 block text-sm font-medium" htmlFor="city">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input id="city" className="form-input w-full" type="text" />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block text-sm font-medium" htmlFor="postal-code">
                          Postal Code <span className="text-red-500">*</span>
                        </label>
                        <input id="postal-code" className="form-input w-full" type="text" />
                      </div>
                    </div>
                    {/* Street Address */}
                    <div>
                      <label className="mb-1 block text-sm font-medium" htmlFor="street">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input id="street" className="form-input w-full" type="text" />
                    </div>
                    {/* Country */}
                    <div>
                      <label className="mb-1 block text-sm font-medium" htmlFor="country">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select id="country" className="form-select w-full">
                        <option>USA</option>
                        <option>Italy</option>
                        <option>United Kingdom</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Link className="text-sm underline hover:no-underline" href="/onboarding-02">
                      &lt;- Back
                    </Link>
                    <Link
                      className="btn ml-auto bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
                      href="/onboarding-04"
                    >
                      Next Step -&gt;
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <OnboardingImage />
      </div>
    </main>
  );
}
