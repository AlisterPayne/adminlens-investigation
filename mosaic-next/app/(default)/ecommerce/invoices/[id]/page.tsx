import Link from "next/link";
import { notFound } from "next/navigation";

import { getInvoiceById, invoices } from "@/data/invoices-data";

import { statusColor, totalColor, typeIcon } from "../invoices-properties";

export async function generateStaticParams() {
  return invoices.map((invoice) => ({ id: String(invoice.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = getInvoiceById(Number(id));
  return {
    title: invoice ? `Invoice ${invoice.invoice} - Mosaic` : "Invoice - Mosaic",
    description: "Invoice detail page",
  };
}

export default async function InvoiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = getInvoiceById(Number(id));

  if (!invoice) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          className="btn-sm border-gray-200 bg-white px-3 text-gray-600 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
          href="/ecommerce/invoices"
        >
          <svg className="mr-2 fill-current text-gray-400 dark:text-gray-500" width="7" height="12" viewBox="0 0 7 12">
            <path d="M5.4 10.6 1.8 7l3.6-3.6L4 2 0 6l4 4z" />
          </svg>
          <span>Back to Invoices</span>
        </Link>
      </div>

      <div className="mb-8 rounded-xl bg-white shadow-sm dark:bg-gray-800">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Invoice {invoice.invoice}</h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">Billed to {invoice.customer}</div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`inline-flex rounded-full px-2.5 py-0.5 text-center font-medium ${statusColor(invoice.status)}`}
            >
              {invoice.status}
            </div>
            <button className="btn border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600">
              Download PDF
            </button>
            <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
              Send Invoice
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-2 dark:bg-gray-800">
          <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-100">Invoice Details</h2>
          <dl className="divide-y divide-gray-100 text-sm dark:divide-gray-700/60">
            <div className="flex justify-between py-3">
              <dt className="text-gray-500 dark:text-gray-400">Invoice number</dt>
              <dd className="font-medium text-gray-800 dark:text-gray-100">{invoice.invoice}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-gray-500 dark:text-gray-400">Type</dt>
              <dd className="flex items-center font-medium text-gray-800 dark:text-gray-100">
                {typeIcon(invoice.type)}
                {invoice.type}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-gray-500 dark:text-gray-400">Issued on</dt>
              <dd className="font-medium text-gray-800 dark:text-gray-100">{invoice.issueddate}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-gray-500 dark:text-gray-400">Paid on</dt>
              <dd className="font-medium text-gray-800 dark:text-gray-100">{invoice.paiddate}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-gray-500 dark:text-gray-400">Total due</dt>
              <dd className={`font-medium ${totalColor(invoice.status)}`}>{invoice.total}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
          <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-100">Billed To</h2>
          <div className="text-sm">
            <div className="font-medium text-gray-800 dark:text-gray-100">{invoice.customer}</div>
            <div className="mt-1 text-gray-500 dark:text-gray-400">Status: {invoice.status}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
