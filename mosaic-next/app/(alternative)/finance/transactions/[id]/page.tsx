import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getTransactionById, transactions } from "@/data/transactions-data";

import { amountColor, statusColor } from "../transactions-properties";

export async function generateStaticParams() {
  return transactions.map((transaction) => ({ id: String(transaction.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transaction = getTransactionById(Number(id));
  return {
    title: transaction ? `${transaction.name} - Mosaic` : "Transaction - Mosaic",
    description: "Transaction detail page",
  };
}

export default async function TransactionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transaction = getTransactionById(Number(id));

  if (!transaction) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          className="btn-sm border-gray-200 bg-white px-3 text-gray-600 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
          href="/finance/transactions"
        >
          <svg className="mr-2 fill-current text-gray-400 dark:text-gray-500" width="7" height="12" viewBox="0 0 7 12">
            <path d="M5.4 10.6 1.8 7l3.6-3.6L4 2 0 6l4 4z" />
          </svg>
          <span>Back to Transactions</span>
        </Link>
      </div>

      <div className="mb-8 rounded-xl bg-white shadow-sm dark:bg-gray-800">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <div className="mr-4 h-14 w-14 shrink-0">
              <Image className="rounded-full" src={transaction.image} width={56} height={56} alt={transaction.name} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{transaction.name}</h1>
              <div className="text-sm text-gray-500 dark:text-gray-400">Transaction on {transaction.date}</div>
            </div>
          </div>
          <div className={`text-3xl font-bold ${amountColor(transaction.amount)}`}>{transaction.amount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-2 dark:bg-gray-800">
          <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-100">Transaction Details</h2>
          <dl className="divide-y divide-gray-100 text-sm dark:divide-gray-700/60">
            <div className="flex justify-between py-3">
              <dt className="text-gray-500 dark:text-gray-400">Counterparty</dt>
              <dd className="font-medium text-gray-800 dark:text-gray-100">{transaction.name}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-gray-500 dark:text-gray-400">Payment date</dt>
              <dd className="font-medium text-gray-800 dark:text-gray-100">{transaction.date}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-gray-500 dark:text-gray-400">Status</dt>
              <dd>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-center text-xs font-medium ${statusColor(transaction.status)}`}
                >
                  {transaction.status}
                </span>
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-gray-500 dark:text-gray-400">Amount</dt>
              <dd className={`font-medium ${amountColor(transaction.amount)}`}>{transaction.amount}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
          <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-100">Actions</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <button className="font-medium text-violet-500 hover:text-violet-600">Download receipt</button>
            </li>
            <li>
              <button className="font-medium text-violet-500 hover:text-violet-600">Report an issue</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
