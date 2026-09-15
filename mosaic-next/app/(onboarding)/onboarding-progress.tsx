import Link from "next/link";

export default function OnboardingProgress({ step = 1 }: { step?: number }) {
  return (
    <div className="px-4 pt-12 pb-8">
      <div className="mx-auto w-full max-w-md">
        <div className="relative">
          <div
            className="absolute top-1/2 left-0 -mt-px h-0.5 w-full bg-gray-200 dark:bg-gray-700/60"
            aria-hidden="true"
          ></div>
          <ul className="relative flex w-full justify-between">
            <li>
              <Link
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${step >= 1 ? "bg-violet-500 text-white" : "bg-white text-gray-500 dark:bg-gray-900 dark:text-gray-400"}`}
                href="/onboarding-01"
              >
                1
              </Link>
            </li>
            <li>
              <Link
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${step >= 2 ? "bg-violet-500 text-white" : "bg-white text-gray-500 dark:bg-gray-900 dark:text-gray-400"}`}
                href="/onboarding-02"
              >
                2
              </Link>
            </li>
            <li>
              <Link
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${step >= 3 ? "bg-violet-500 text-white" : "bg-white text-gray-500 dark:bg-gray-900 dark:text-gray-400"}`}
                href="/onboarding-03"
              >
                3
              </Link>
            </li>
            <li>
              <Link
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${step >= 4 ? "bg-violet-500 text-white" : "bg-white text-gray-500 dark:bg-gray-900 dark:text-gray-400"}`}
                href="/onboarding-04"
              >
                4
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
