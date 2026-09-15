import Link from "next/link";

import OrderBuilder from "./order-builder";

export const metadata = {
  title: "Add Order - Mosaic",
  description: "Add a new order",
};

export default function AddOrder() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <div className="mb-6">
        <Link
          className="btn-sm border-gray-200 bg-white px-3 text-gray-600 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
          href="/ecommerce/orders"
        >
          <svg className="mr-2 fill-current text-gray-400 dark:text-gray-500" width="7" height="12" viewBox="0 0 7 12">
            <path d="M5.4 10.6 1.8 7l3.6-3.6L4 2 0 6l4 4z" />
          </svg>
          <span>Back to Orders</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Add Order</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Build the order line by line and review the totals.
        </p>
      </div>

      <OrderBuilder />
    </div>
  );
}
