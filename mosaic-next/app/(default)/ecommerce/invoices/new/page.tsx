import Link from "next/link";

export const metadata = {
  title: "Create Invoice - Mosaic",
  description: "Create a new invoice",
};

const lineItems = [
  { description: "Acme Plus — annual plan", qty: 1, price: "$99.00", amount: "$99.00" },
  { description: "Additional seats (×2)", qty: 2, price: "$15.00", amount: "$30.00" },
];

export default function CreateInvoice() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
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

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Create Invoice</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Fill in the document, then set delivery options.
        </p>
      </div>

      <form className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Invoice document */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2 dark:border-gray-700/60 dark:bg-gray-800">
          {/* Document header */}
          <div className="flex flex-col gap-6 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between dark:border-gray-700/60">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-linear-to-tr from-violet-500 to-sky-500" aria-hidden="true" />
                <span className="font-semibold text-gray-800 dark:text-gray-100">Acme Inc.</span>
              </div>
              <div className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                512 Steve Aoki Blvd
                <br />
                San Francisco, CA
              </div>
            </div>
            <div className="sm:text-right">
              <div className="text-2xl font-bold tracking-wide text-gray-800 dark:text-gray-100">INVOICE</div>
              <div className="mt-2 flex items-center gap-2 text-sm sm:justify-end">
                <span className="text-gray-500 dark:text-gray-400">No.</span>
                <input
                  className="form-input w-32 py-1 sm:text-right"
                  type="text"
                  name="invoice"
                  defaultValue="#000000"
                />
              </div>
            </div>
          </div>

          {/* Parties + dates */}
          <div className="grid grid-cols-1 gap-6 border-b border-gray-200 py-6 sm:grid-cols-3 dark:border-gray-700/60">
            <div>
              <div className="mb-2 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500">Bill to</div>
              <input
                className="form-input mb-2 w-full"
                type="text"
                name="customer"
                placeholder="Customer name"
                required
              />
              <input
                className="form-input w-full"
                type="email"
                name="customeremail"
                placeholder="billing@company.com"
              />
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500">Issued on</div>
              <input className="form-input w-full" type="date" name="issueddate" />
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500">Due on</div>
              <input className="form-input w-full" type="date" name="duedate" />
            </div>
          </div>

          {/* Items */}
          <div className="py-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold text-gray-400 uppercase dark:border-gray-700/60 dark:text-gray-500">
                  <th className="py-2 text-left font-semibold">Description</th>
                  <th className="w-16 py-2 text-center font-semibold">Qty</th>
                  <th className="w-24 py-2 text-right font-semibold">Price</th>
                  <th className="w-24 py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {lineItems.map((item) => (
                  <tr key={item.description}>
                    <td className="py-3 text-gray-800 dark:text-gray-100">{item.description}</td>
                    <td className="py-3 text-center text-gray-500 dark:text-gray-400">{item.qty}</td>
                    <td className="py-3 text-right text-gray-500 dark:text-gray-400">{item.price}</td>
                    <td className="py-3 text-right font-medium text-gray-800 dark:text-gray-100">{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <dl className="w-full space-y-2 text-sm sm:w-64">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Subtotal</dt>
                  <dd className="font-medium text-gray-800 dark:text-gray-100">$129.00</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Tax (0%)</dt>
                  <dd className="font-medium text-gray-800 dark:text-gray-100">$0.00</dd>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-gray-700/60">
                  <dt className="font-semibold text-gray-800 dark:text-gray-100">Total due</dt>
                  <dd className="text-lg font-bold text-gray-800 dark:text-gray-100">$129.00</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t border-gray-200 pt-6 dark:border-gray-700/60">
            <label
              className="mb-2 block text-xs font-semibold text-gray-400 uppercase dark:text-gray-500"
              htmlFor="notes"
            >
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              className="form-textarea w-full"
              rows={2}
              placeholder="Thanks for your business!"
            />
          </div>
        </div>

        {/* Settings sidebar */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:col-span-1">
          <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
            <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-100">Delivery options</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="status">
                  Status
                </label>
                <select id="status" name="status" className="form-select w-full" defaultValue="Due">
                  <option>Due</option>
                  <option>Paid</option>
                  <option>Overdue</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="type">
                  Type
                </label>
                <select id="type" name="type" className="form-select w-full" defaultValue="Subscription">
                  <option>Subscription</option>
                  <option>One-time</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="currency">
                  Currency
                </label>
                <select id="currency" name="currency" className="form-select w-full" defaultValue="USD ($)">
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn w-full bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
          >
            Send Invoice
          </button>
          <button
            type="button"
            className="btn w-full border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
          >
            Save as Draft
          </button>
          <Link
            href="/ecommerce/invoices"
            className="btn w-full border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
