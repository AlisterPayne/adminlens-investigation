export const metadata = {
  title: "Cart 3 - Mosaic",
  description: "Page description",
};

import Image from "next/image";
import Link from "next/link";

import ProductImage01 from "@/public/images/related-product-01.jpg";
import ProductImage02 from "@/public/images/related-product-02.jpg";
import ProductImage03 from "@/public/images/related-product-03.jpg";

export default function Cart3() {
  return (
    <div className="lg:relative lg:flex">
      {/* Content */}
      <div className="px-4 py-8 sm:px-6 lg:grow lg:px-8 lg:pr-8 xl:pr-16 2xl:ml-[80px]">
        <div className="lg:mx-auto lg:max-w-[640px]">
          {/* Cart items */}
          <div className="mb-6 lg:mb-0">
            <div className="mb-3">
              <div className="flex space-x-2 text-sm font-medium text-gray-400 dark:text-gray-500">
                <span className="text-gray-500 dark:text-gray-400">Review</span>
                <span>-&gt;</span>
                <span className="text-gray-500 dark:text-gray-400">Payment</span>
                <span>-&gt;</span>
                <span className="text-violet-500">Confirm</span>
              </div>
            </div>
            <header className="mb-6">
              {/* Title */}
              <h1 className="mb-2 text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">
                Thank you for your order
              </h1>
              <p>
                You will soon receive a confirmation email with details of your order and a link to download the files.
              </p>
            </header>
            {/* Billing Information */}
            <div>
              <div className="mb-4 font-semibold text-gray-800 dark:text-gray-100">Billing Information</div>
              <form>
                <div className="space-y-4">
                  {/* 1st row */}
                  <div className="space-y-4 md:flex md:space-y-0 md:space-x-4">
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-medium" htmlFor="card-name">
                        Name
                      </label>
                      <input id="card-name" className="form-input w-full" type="text" defaultValue="Patrick" />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-medium" htmlFor="card-surname">
                        Surname
                      </label>
                      <input id="card-surname" className="form-input w-full" type="text" defaultValue="Sullivan" />
                    </div>
                  </div>
                  {/* 2nd row */}
                  <div className="space-y-4 md:flex md:space-y-0 md:space-x-4">
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-medium" htmlFor="card-address">
                        Address
                      </label>
                      <input id="card-address" className="form-input w-full" type="text" />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-medium" htmlFor="card-city">
                        Town/City
                      </label>
                      <input id="card-city" className="form-input w-full" type="text" />
                    </div>
                  </div>
                  {/* 3rd row */}
                  <div className="space-y-4 md:flex md:space-y-0 md:space-x-4">
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-medium" htmlFor="card-state">
                        State/Country
                      </label>
                      <input id="card-state" className="form-input w-full" type="text" />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-medium" htmlFor="card-country">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select id="card-country" className="form-select w-full">
                        <option>Italy</option>
                        <option>USA</option>
                        <option>United Kingdom</option>
                      </select>
                    </div>
                  </div>
                  {/* 4th row */}
                  <div className="space-y-4 md:flex md:space-y-0 md:space-x-4">
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-medium" htmlFor="card-postcode">
                        Postcode
                      </label>
                      <input id="card-postcode" className="form-input w-full" type="text" />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-medium" htmlFor="card-vat">
                        VAT ID
                      </label>
                      <input id="card-vat" className="form-input w-full" type="text" />
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      type="submit"
                      className="btn border-gray-200 bg-white text-gray-800 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
                    >
                      Download Invoice
                    </button>
                  </div>
                </div>
              </form>
            </div>
            {/* Divider */}
            <hr className="my-6 border-t border-gray-100 dark:border-gray-700/60" />
            {/* Billing footer */}
            <div className="rounded-sm border border-gray-200 bg-gray-50 p-4 dark:border-gray-700/60 dark:bg-gray-800/30">
              <div className="space-y-2 text-center md:flex md:items-center md:justify-between md:space-y-0 md:space-x-2 md:text-left">
                <div className="text-sm">
                  Enjoy a <span className="font-medium text-gray-800 dark:text-gray-100">20% OFF</span> discount on your
                  next order 🎉
                </div>
                <div className="relative inline-flex rounded-sm bg-green-500 px-3 py-1 text-center">
                  <div
                    className="absolute top-1/2 left-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-gray-800"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute top-1/2 right-0 h-3 w-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-gray-800"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium text-green-50 uppercase">XMAS22</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div>
        <div className="no-scrollbar border-t border-gray-200 bg-linear-to-r from-white/30 lg:sticky lg:top-16 lg:h-[calc(100dvh-64px)] lg:w-[320px] lg:shrink-0 lg:overflow-x-hidden lg:overflow-y-auto lg:border-t-0 lg:border-l xl:w-[352px] 2xl:w-[calc(352px+80px)] dark:border-gray-700/60 dark:from-gray-800/30">
          <div className="px-4 py-8 lg:px-8 2xl:px-12">
            <div className="mx-auto max-w-sm lg:max-w-none">
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Order Summary</h2>
              <div className="space-y-6">
                {/* Order Details */}
                <div>
                  <div className="mb-2 font-semibold text-gray-800 dark:text-gray-100">Order Details</div>
                  {/* Cart items */}
                  <ul>
                    {/* Cart item */}
                    <li className="flex items-center border-b border-gray-200 py-3 dark:border-gray-700/60">
                      <a className="mr-2 block shrink-0 xl:mr-4" href="#0">
                        <Image
                          className="w-16 xl:w-20"
                          src={ProductImage01}
                          width={200}
                          height={142}
                          alt="Product 01"
                        />
                      </a>
                      <div className="grow">
                        <a href="#0">
                          <h4 className="text-sm leading-tight font-medium text-gray-800 dark:text-gray-100">
                            The Complete Front-End Development Course!
                          </h4>
                        </a>
                      </div>
                      <div className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-100">$69</div>
                    </li>
                    {/* Cart item */}
                    <li className="flex items-center border-b border-gray-200 py-3 dark:border-gray-700/60">
                      <a className="mr-2 block shrink-0 xl:mr-4" href="#0">
                        <Image
                          className="w-16 xl:w-20"
                          src={ProductImage02}
                          width={200}
                          height={142}
                          alt="Product 02"
                        />
                      </a>
                      <div className="grow">
                        <a href="#0">
                          <h4 className="text-sm leading-tight font-medium text-gray-800 dark:text-gray-100">
                            Web Development Ultimate Course 2024
                          </h4>
                        </a>
                      </div>
                      <div className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-100">$69</div>
                    </li>
                    {/* Cart item */}
                    <li className="flex items-center border-b border-gray-200 py-3 dark:border-gray-700/60">
                      <a className="mr-2 block shrink-0 xl:mr-4" href="#0">
                        <Image
                          className="w-16 xl:w-20"
                          src={ProductImage03}
                          width={200}
                          height={142}
                          alt="Product 03"
                        />
                      </a>
                      <div className="grow">
                        <a href="#0">
                          <h4 className="text-sm leading-tight font-medium text-gray-800 dark:text-gray-100">
                            Full-Stack JavaScript Course!
                          </h4>
                        </a>
                      </div>
                      <div className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-100">$69</div>
                    </li>
                  </ul>
                  {/* Fees, discount and total */}
                  <ul>
                    <li className="flex items-center justify-between border-b border-gray-200 py-3 dark:border-gray-700/60">
                      <div className="text-sm">Subtotal</div>
                      <div className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-100">$205</div>
                    </li>
                    <li className="flex items-center justify-between border-b border-gray-200 py-3 dark:border-gray-700/60">
                      <div className="text-sm">Taxes</div>
                      <div className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-100">$48</div>
                    </li>
                    <li className="flex items-center justify-between border-b border-gray-200 py-3 dark:border-gray-700/60">
                      <div className="flex items-center">
                        <span className="mr-2 text-sm">Discount</span>
                        <span className="inline-flex rounded-full bg-gray-200 px-2.5 py-1 text-center text-xs font-medium whitespace-nowrap text-gray-500 uppercase dark:bg-gray-700 dark:text-gray-400">
                          XMAS22
                        </span>
                      </div>
                      <div className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-100">-$25</div>
                    </li>
                    <li className="flex items-center justify-between border-b border-gray-200 py-3 dark:border-gray-700/60">
                      <div className="text-sm">Total</div>
                      <div className="ml-2 text-sm font-medium text-green-600">$205</div>
                    </li>
                  </ul>
                </div>

                {/* Payment Details */}
                <div>
                  <div className="mb-4 font-semibold text-gray-800 dark:text-gray-100">Payment Details</div>
                  <div className="rounded-sm border border-gray-200 p-3 text-sm dark:border-gray-700/60">
                    <div className="flex items-center justify-between space-x-2">
                      {/* CC details */}
                      <div className="flex items-center">
                        {/* Mastercard icon */}
                        <svg className="mr-3 shrink-0" width="32" height="24" xmlns="http://www.w3.org/2000/svg">
                          <rect fill="#1F2937" width="32" height="24" rx="3" />
                          <ellipse fill="#E61C24" cx="12.522" cy="12" rx="5.565" ry="5.647" />
                          <ellipse fill="#F99F1B" cx="19.432" cy="12" rx="5.565" ry="5.647" />
                          <path
                            d="M15.977 7.578A5.667 5.667 0 0 0 13.867 12c0 1.724.777 3.353 2.11 4.422A5.667 5.667 0 0 0 18.087 12a5.667 5.667 0 0 0-2.11-4.422Z"
                            fill="#F26622"
                          />
                        </svg>
                        <div>
                          Ending with <span className="text-gray-800 dark:text-gray-100">2478</span>
                        </div>
                      </div>
                      {/* Expiry */}
                      <div className="ml-2 italic">Expires 12/23</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-4">
                    <Link
                      href="/ecommerce/pay"
                      className="btn w-full bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
                    >
                      View Your Order
                    </Link>
                  </div>
                  <div className="text-center text-xs text-gray-500 italic">
                    Should you ever change your mind, we offer a 14-day, no-questions-asked refund policy.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
