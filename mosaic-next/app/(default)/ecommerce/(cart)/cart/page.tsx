export const metadata = {
  title: "Cart - Mosaic",
  description: "Page description",
};

import CartItems from "../cart-items";

export default function Cart() {
  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col lg:flex-row lg:space-x-8 xl:space-x-16">
        {/* Cart items */}
        <div className="mb-6 lg:mb-0">
          <div className="mb-3">
            <div className="flex space-x-2 text-sm font-medium text-gray-400 dark:text-gray-500">
              <span className="text-violet-500">Review</span>
              <span>-&gt;</span>
              <span className="text-gray-500 dark:text-gray-400">Payment</span>
              <span>-&gt;</span>
              <span className="text-gray-500 dark:text-gray-400">Confirm</span>
            </div>
          </div>
          <header className="mb-2">
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Shopping Cart (3)</h1>
          </header>

          {/* Cart items */}
          <CartItems />
        </div>

        {/* Sidebar */}
        <div>
          <div className="rounded-xl bg-white p-5 shadow-sm lg:w-[18rem] xl:w-[20rem] dark:bg-gray-800">
            <div className="mb-2 font-semibold text-gray-800 dark:text-gray-100">Order Summary</div>
            {/* Order details */}
            <ul className="mb-4">
              <li className="flex w-full justify-between border-b border-gray-200 py-3 text-sm dark:border-gray-700/60">
                <div>Products & Subscriptions</div>
                <div className="font-medium text-gray-800 dark:text-gray-100">$205</div>
              </li>
              <li className="flex w-full justify-between border-b border-gray-200 py-3 text-sm dark:border-gray-700/60">
                <div>Shipping</div>
                <div className="font-medium text-gray-800 dark:text-gray-100">-</div>
              </li>
              <li className="flex w-full justify-between border-b border-gray-200 py-3 text-sm dark:border-gray-700/60">
                <div>Taxes</div>
                <div className="font-medium text-gray-800 dark:text-gray-100">$48</div>
              </li>
              <li className="flex w-full justify-between border-b border-gray-200 py-3 text-sm dark:border-gray-700/60">
                <div>Total due (including taxes)</div>
                <div className="font-medium text-green-600">$253</div>
              </li>
            </ul>
            {/* Promo box */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <label className="mb-1 block text-sm font-medium" htmlFor="promo">
                  Promo Code
                </label>
                <div className="text-sm text-gray-400 italic dark:text-gray-500">optional</div>
              </div>
              <input id="promo" className="form-input mb-2 w-full" type="text" />
              <button
                className="btn w-full bg-gray-900 text-gray-100 hover:bg-gray-800 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-white disabled:text-gray-300 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white dark:disabled:border-gray-700 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
                disabled
              >
                Apply Code
              </button>
            </div>
            <div className="mb-4">
              <button className="btn w-full bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                Buy Now - $253.00
              </button>
            </div>
            <div className="text-center text-xs text-gray-500 italic">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do{" "}
              <a className="underline hover:no-underline" href="#0">
                Terms
              </a>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
