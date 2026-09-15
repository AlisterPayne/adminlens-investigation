"use client";

import Link from "next/link";
import { useState } from "react";

interface LineItem {
  id: number;
  name: string;
  qty: number;
  price: number;
}

const currency = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function OrderBuilder() {
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, name: "Acme Plus subscription", qty: 1, price: 49 },
    { id: 2, name: "Onboarding add-on", qty: 2, price: 20 },
  ]);
  const [shipping, setShipping] = useState(0);
  const [taxRate, setTaxRate] = useState(10);

  const addItem = () => setItems((prev) => [...prev, { id: Date.now(), name: "", qty: 1, price: 0 }]);

  const removeItem = (id: number) => setItems((prev) => prev.filter((item) => item.id !== id));

  const updateItem = (id: number, patch: Partial<LineItem>) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const tax = (subtotal * taxRate) / 100;
  const total = subtotal + tax + shipping;

  return (
    <form className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      {/* Main column */}
      <div className="space-y-6 lg:col-span-2">
        {/* Order details */}
        <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
          <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-100">Order details</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="customer">
                Customer <span className="text-red-500">*</span>
              </label>
              <input
                id="customer"
                name="customer"
                className="form-input w-full"
                type="text"
                placeholder="Jane Doe"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="date">
                Order date
              </label>
              <input id="date" name="date" className="form-input w-full" type="date" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="status">
                Status
              </label>
              <select id="status" name="status" className="form-select w-full" defaultValue="Pending">
                <option>Pending</option>
                <option>Approved</option>
                <option>Refunded</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="type">
                Payment type
              </label>
              <select id="type" name="type" className="form-select w-full" defaultValue="One-time">
                <option>One-time</option>
                <option>Subscription</option>
              </select>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="rounded-xl bg-white shadow-sm dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Line items</h2>
            <button
              type="button"
              onClick={addItem}
              className="btn-sm bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
            >
              <svg className="mr-1 shrink-0 fill-current" width="14" height="14" viewBox="0 0 16 16">
                <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
              </svg>
              Add item
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {items.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No items yet. Use “Add item” to get started.
              </div>
            )}
            {items.map((item) => (
              <div key={item.id} className="flex flex-wrap items-end gap-3 px-5 py-4">
                <div className="min-w-[10rem] grow">
                  <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Item</label>
                  <input
                    className="form-input w-full"
                    type="text"
                    placeholder="Product name"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, { name: e.target.value })}
                  />
                </div>
                <div className="w-20">
                  <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Qty</label>
                  <input
                    className="form-input w-full"
                    type="number"
                    min={1}
                    value={item.qty}
                    onChange={(e) => updateItem(item.id, { qty: Math.max(1, Number(e.target.value)) })}
                  />
                </div>
                <div className="w-28">
                  <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Unit price</label>
                  <input
                    className="form-input w-full"
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(item.id, { price: Math.max(0, Number(e.target.value)) })}
                  />
                </div>
                <div className="w-24 text-right">
                  <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Amount</div>
                  <div className="flex h-9 items-center justify-end font-medium text-gray-800 dark:text-gray-100">
                    {currency(item.qty * item.price)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="mb-1 rounded-full text-red-500 hover:text-red-600"
                >
                  <span className="sr-only">Remove item</span>
                  <svg className="h-8 w-8 fill-current" viewBox="0 0 32 32">
                    <path d="M13 15h2v6h-2zM17 15h2v6h-2z" />
                    <path d="M20 9c0-.6-.4-1-1-1h-6c-.6 0-1 .4-1 1v2H8v2h1v10c0 .6.4 1 1 1h12c.6 0 1-.4 1-1V13h1v-2h-4V9zm-6 1h4v1h-4v-1zm7 3v9H11v-9h10z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary sidebar */}
      <div className="space-y-4 lg:sticky lg:top-24 lg:col-span-1">
        <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
          <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-100">Order summary</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">{currency(subtotal)}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Shipping</span>
              <div className="relative w-24">
                <span className="absolute top-1/2 left-2 -translate-y-1/2 text-sm text-gray-400">$</span>
                <input
                  className="form-input w-full py-1 pl-5 text-right"
                  type="number"
                  min={0}
                  step="0.01"
                  value={shipping}
                  onChange={(e) => setShipping(Math.max(0, Number(e.target.value)))}
                />
              </div>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Tax</span>
              <div className="relative w-24">
                <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm text-gray-400">%</span>
                <input
                  className="form-input w-full py-1 pr-5 text-right"
                  type="number"
                  min={0}
                  value={taxRate}
                  onChange={(e) => setTaxRate(Math.max(0, Number(e.target.value)))}
                />
              </div>
            </li>
            <li className="flex justify-between border-t border-gray-100 pt-3 dark:border-gray-700/60">
              <span className="font-semibold text-gray-800 dark:text-gray-100">Total</span>
              <span className="text-lg font-bold text-green-600">{currency(total)}</span>
            </li>
          </ul>
        </div>

        <button
          type="submit"
          className="btn w-full bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
        >
          Save Order
        </button>
        <Link
          href="/ecommerce/orders"
          className="btn w-full border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
