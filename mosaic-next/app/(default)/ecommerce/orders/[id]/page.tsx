import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getOrderById, orders } from "@/data/orders-data";

import { statusColor, typeIcon } from "../orders-properties";

export async function generateStaticParams() {
  return orders.map((order) => ({ id: String(order.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getOrderById(Number(id));
  return {
    title: order ? `Order ${order.order} - Mosaic` : "Order - Mosaic",
    description: "Order detail page",
  };
}

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getOrderById(Number(id));

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
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

      <div className="mb-8 rounded-xl bg-white shadow-sm dark:bg-gray-800">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <div className="mr-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <Image src={order.image} width={28} height={28} alt={order.order} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Order {order.order}</h1>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Placed on {order.date} by {order.customer}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`inline-flex rounded-full px-2.5 py-0.5 text-center font-medium ${statusColor(order.status)}`}
            >
              {order.status}
            </div>
            <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
              Manage Order
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-2 dark:bg-gray-800">
          <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-100">Order Summary</h2>
          <dl className="divide-y divide-gray-100 text-sm dark:divide-gray-700/60">
            <div className="flex justify-between py-3">
              <dt className="text-gray-500 dark:text-gray-400">Order number</dt>
              <dd className="font-medium text-gray-800 dark:text-gray-100">{order.order}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-gray-500 dark:text-gray-400">Items</dt>
              <dd className="font-medium text-gray-800 dark:text-gray-100">{order.items}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-gray-500 dark:text-gray-400">Payment type</dt>
              <dd className="flex items-center font-medium text-gray-800 dark:text-gray-100">
                {typeIcon(order.type)}
                {order.type}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-gray-500 dark:text-gray-400">Total</dt>
              <dd className="font-medium text-green-600">{order.total}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{order.description}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
          <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-100">Customer & Shipping</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Customer</dt>
              <dd className="font-medium text-gray-800 dark:text-gray-100">{order.customer}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Location</dt>
              <dd className="font-medium text-gray-800 dark:text-gray-100">{order.location}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Date</dt>
              <dd className="font-medium text-gray-800 dark:text-gray-100">{order.date}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
