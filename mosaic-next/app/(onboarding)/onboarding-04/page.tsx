export const metadata = {
  title: "Company information - Mosaic",
  description: "Page description",
};

import Link from "next/link";

import OnboardingHeader from "../onboarding-header";
import OnboardingImage from "../onboarding-image";
import OnboardingProgress from "../onboarding-progress";

export default function Onboarding04() {
  return (
    <main className="bg-white dark:bg-gray-900">
      <div className="relative flex">
        {/* Content */}
        <div className="w-full md:w-1/2">
          <div className="flex h-full min-h-[100dvh] flex-col after:flex-1">
            <div className="flex-1">
              <OnboardingHeader />
              <OnboardingProgress step={4} />
            </div>

            <div className="px-4 py-8">
              <div className="mx-auto max-w-md">
                <div className="text-center">
                  <svg className="mb-6 inline-flex h-16 w-16 fill-current" viewBox="0 0 64 64">
                    <circle className="text-green-500/20" cx="32" cy="32" r="32" />
                    <path
                      className="text-green-700"
                      d="M37.22 26.375a1 1 0 1 1 1.56 1.25l-8 10a1 1 0 0 1-1.487.082l-4-4a1 1 0 0 1 1.414-1.414l3.21 3.21 7.302-9.128Z"
                    />
                  </svg>
                  <h1 className="mb-8 text-3xl font-bold text-gray-800 dark:text-gray-100">
                    Nice to have you, Acme Inc. 🙌
                  </h1>
                  <Link
                    className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
                    href="/dashboard"
                  >
                    Go To Dashboard -&gt;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <OnboardingImage />
      </div>
    </main>
  );
}
