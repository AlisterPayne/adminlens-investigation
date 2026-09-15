export const metadata = {
  title: "Pay - Mosaic",
  description: "Page description",
};

import Link from "next/link";

import Logo from "@/components/ui/logo";

import PayForm from "./pay-form";

export default function Pay() {
  return (
    <>
      <header className="bg-white dark:bg-gray-900">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between border-gray-200 lg:border-b dark:border-gray-700/60">
            {/* Logo */}
            <Logo />

            <Link
              className="rounded-fullbg-gray-400/20 block text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              href="/ecommerce/cart"
            >
              <span className="sr-only">Back</span>
              <svg width="32" height="32" viewBox="0 0 32 32">
                <path
                  className="fill-current"
                  d="M15.95 14.536l4.242-4.243a1 1 0 111.415 1.414l-4.243 4.243 4.243 4.242a1 1 0 11-1.415 1.415l-4.242-4.243-4.243 4.243a1 1 0 01-1.414-1.415l4.243-4.242-4.243-4.243a1 1 0 011.414-1.414l4.243 4.243z"
                />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <PayForm />
    </>
  );
}
