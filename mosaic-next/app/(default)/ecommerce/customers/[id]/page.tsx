import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { customers, getCustomerById } from "@/data/customers-data";

export async function generateStaticParams() {
  return customers.map((customer) => ({ id: String(customer.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = getCustomerById(Number(id));
  return {
    title: customer ? `${customer.name} - Mosaic` : "Customer - Mosaic",
    description: "Customer detail page",
  };
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
      <div className="mb-1 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500">{label}</div>
      <div className={`text-2xl font-bold ${accent ?? "text-gray-800 dark:text-gray-100"}`}>{value}</div>
    </div>
  );
}

export default async function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = getCustomerById(Number(id));

  if (!customer) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <div className="mb-6">
        <Link
          className="btn-sm border-gray-200 bg-white px-3 text-gray-600 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
          href="/ecommerce/customers"
        >
          <svg className="mr-2 fill-current text-gray-400 dark:text-gray-500" width="7" height="12" viewBox="0 0 7 12">
            <path d="M5.4 10.6 1.8 7l3.6-3.6L4 2 0 6l4 4z" />
          </svg>
          <span>Back to Customers</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 rounded-xl bg-white shadow-sm dark:bg-gray-800">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <div className="mr-4 h-16 w-16 shrink-0">
              <Image className="rounded-full" src={customer.image} width={64} height={64} alt={customer.name} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{customer.name}</h1>
                {customer.fav && (
                  <svg className="shrink-0 fill-current text-yellow-500" width="16" height="16" viewBox="0 0 16 16">
                    <path d="M8 0L6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934h-6L8 0z" />
                  </svg>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</div>
              <div className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{customer.location}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              className="btn border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
              href={`mailto:${customer.email}`}
            >
              Send Email
            </a>
            <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
              Edit Customer
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total spent" value={customer.spent} accent="text-green-600" />
        <StatCard label="Orders" value={customer.orders} />
        <StatCard label="Refunds" value={customer.refunds === "-" ? "0" : customer.refunds} />
        <StatCard label="Last order" value={customer.lastOrder} accent="text-sky-600" />
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-2 dark:bg-gray-800">
          <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-100">Customer Information</h2>
          <dl className="divide-y divide-gray-100 text-sm dark:divide-gray-700/60">
            <div className="flex justify-between py-3">
              <dt className="text-gray-500 dark:text-gray-400">Full name</dt>
              <dd className="font-medium text-gray-800 dark:text-gray-100">{customer.name}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-gray-500 dark:text-gray-400">Email</dt>
              <dd className="font-medium text-gray-800 dark:text-gray-100">{customer.email}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-gray-500 dark:text-gray-400">Location</dt>
              <dd className="font-medium text-gray-800 dark:text-gray-100">{customer.location}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-gray-500 dark:text-gray-400">Last order</dt>
              <dd className="font-medium text-sky-600">{customer.lastOrder}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
          <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-100">Quick Actions</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link className="font-medium text-violet-500 hover:text-violet-600" href="/ecommerce/orders">
                View orders →
              </Link>
            </li>
            <li>
              <Link className="font-medium text-violet-500 hover:text-violet-600" href="/ecommerce/invoices">
                View invoices →
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
