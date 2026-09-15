import EditMenu from "@/components/edit-menu-card";

export default function FintechCard02() {
  return (
    <div className="col-span-full flex flex-col rounded-xl bg-linear-[225deg,var(--color-gray-800),var(--color-gray-900)] shadow-sm xl:col-span-4">
      <header className="flex items-center border-b border-gray-700/60 px-5 py-4">
        <h2 className="font-semibold text-gray-200">Active Cards</h2>
      </header>
      <div className="flex h-full flex-col px-5 py-6">
        {/* CC container */}
        <div className="relative mx-auto w-full max-w-sm rounded-2xl bg-gray-700/50 p-2.5">
          {/* Credit Card */}
          <div className="relative aspect-7/4 overflow-hidden rounded-xl bg-linear-to-tr from-gray-900 to-gray-800 p-5">
            <div className="relative flex h-full flex-col justify-between">
              {/* Logo on card */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
              >
                <defs>
                  <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="icon1-b">
                    <stop stopColor="#B7ACFF" offset="0%" />
                    <stop stopColor="#E6E1FF" offset="100%" />
                  </linearGradient>
                  <linearGradient x1="50%" y1="24.537%" x2="50%" y2="100%" id="icon1-c">
                    <stop stopColor="#4634B1" offset="0%" />
                    <stop stopColor="#4634B1" stopOpacity="0" offset="100%" />
                  </linearGradient>
                  <path id="icon1-a" d="M16 0l16 32-16-5-16 5z" />
                </defs>
                <g transform="rotate(90 16 16)" fill="none" fillRule="evenodd">
                  <mask id="icon1-d" fill="#fff">
                    <use xlinkHref="#icon1-a" />
                  </mask>
                  <use fill="url(#icon1-b)" xlinkHref="#icon1-a" />
                  <path fill="url(#icon1-c)" mask="url(#icon1-d)" d="M16-6h20v38H16z" />
                </g>
              </svg>
              {/* Card number */}
              <div className="flex justify-between text-lg font-bold tracking-widest text-gray-200 drop-shadow-md">
                <span>****</span>
                <span>****</span>
                <span>****</span>
                <span>7328</span>
              </div>
              {/* Card footer */}
              <div className="relative z-10 mb-0.5 flex items-center justify-between">
                {/* Card expiration */}
                <div className="space-x-3 text-sm font-bold tracking-widest text-gray-200 drop-shadow-md">
                  <span>EXP 12/24</span>
                  <span>CVC ***</span>
                </div>
              </div>
              {/* Mastercard logo */}
              <svg className="absolute right-0 bottom-0" width="48" height="28" viewBox="0 0 48 28">
                <circle fill="#F0BB33" cx="34" cy="14" r="14" fillOpacity=".8" />
                <circle fill="#FF5656" cx="14" cy="14" r="14" fillOpacity=".8" />
              </svg>
            </div>
          </div>
          {/* Options button */}
          <div className="absolute top-0 right-0">
            <EditMenu align="right" />
          </div>
        </div>
        {/* Details */}
        <div className="mt-3 flex grow flex-col justify-center">
          <div className="mb-3 text-xs font-semibold text-gray-500 uppercase">Details</div>
          <div className="space-y-2">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <div className="text-gray-300">Payment Limits</div>
                <div className="text-gray-400 italic">
                  $780,00 <span className="text-gray-500 dark:text-gray-400">/</span> $1,500.00
                </div>
              </div>
              <div className="relative h-2 w-full rounded-sm bg-gray-600">
                <div
                  className="absolute inset-0 rounded-full bg-green-400"
                  aria-hidden="true"
                  style={{ width: "50%" }}
                />
              </div>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <div className="text-gray-300">ATM Limits</div>
                <div className="text-gray-400 italic">
                  $179,00 <span className="text-gray-500 dark:text-gray-400">/</span> $1,000.00
                </div>
              </div>
              <div className="relative h-2 w-full rounded-sm bg-gray-600">
                <div
                  className="absolute inset-0 rounded-full bg-green-400"
                  aria-hidden="true"
                  style={{ width: "35%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
