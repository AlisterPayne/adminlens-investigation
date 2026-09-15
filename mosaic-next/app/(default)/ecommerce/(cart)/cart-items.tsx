import Image from "next/image";
import Link from "next/link";

import Related01 from "@/public/images/related-product-01.jpg";
import Related02 from "@/public/images/related-product-02.jpg";
import Related03 from "@/public/images/related-product-03.jpg";

export default function CartItems() {
  return (
    <>
      <ul>
        {/* Cart item */}
        <li className="items-center border-b border-gray-200 py-6 sm:flex dark:border-gray-700/60">
          <a className="mr-5 mb-4 block shrink-0 sm:mb-0 md:w-32 xl:w-auto" href="#0">
            <Image className="rounded-xs" src={Related01} width={200} height={142} alt="Product 01" />
          </a>
          <div className="grow">
            <a href="#0">
              <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-gray-100">
                The Complete Front-End Development Course!
              </h3>
            </a>
            <div className="mb-2 text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut.
            </div>
            {/* Product meta */}
            <div className="flex flex-wrap items-center justify-between">
              {/* Rating and price */}
              <div className="mr-2 flex flex-wrap items-center space-x-2">
                {/* Rating */}
                <div className="flex items-center space-x-2">
                  {/* Stars */}
                  <div className="flex space-x-1">
                    <button>
                      <span className="sr-only">1 star</span>
                      <svg className="fill-current text-yellow-500" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                      </svg>
                    </button>
                    <button>
                      <span className="sr-only">2 stars</span>
                      <svg className="fill-current text-yellow-500" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                      </svg>
                    </button>
                    <button>
                      <span className="sr-only">3 stars</span>
                      <svg className="fill-current text-yellow-500" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                      </svg>
                    </button>
                    <button>
                      <span className="sr-only">4 stars</span>
                      <svg className="fill-current text-yellow-500" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                      </svg>
                    </button>
                    <button>
                      <span className="sr-only">5 stars</span>
                      <svg
                        className="fill-current text-gray-300 dark:text-gray-600"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                      >
                        <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                      </svg>
                    </button>
                  </div>
                  {/* Rate */}
                  <div className="inline-flex text-sm font-medium text-yellow-600">4.2</div>
                </div>
                <div className="text-gray-400 dark:text-gray-600">·</div>
                {/* Price */}
                <div>
                  <div className="inline-flex rounded-full bg-green-500/20 px-2 py-0.5 text-center text-sm font-medium text-green-700">
                    $89.00
                  </div>
                </div>
              </div>
              <button className="text-sm underline hover:no-underline">Remove</button>
            </div>
          </div>
        </li>
        {/* Cart item */}
        <li className="items-center border-b border-gray-200 py-6 sm:flex dark:border-gray-700/60">
          <a className="mr-5 mb-4 block shrink-0 sm:mb-0 md:w-32 xl:w-auto" href="#0">
            <Image className="rounded-xs" src={Related02} width={200} height={142} alt="Product 02" />
          </a>
          <div className="grow">
            <a href="#0">
              <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-gray-100">
                Web Development Ultimate Course 2024
              </h3>
            </a>
            <div className="mb-2 text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut.
            </div>
            {/* Product meta */}
            <div className="flex flex-wrap items-center justify-between">
              {/* Rating and price */}
              <div className="mr-2 flex flex-wrap items-center space-x-2">
                {/* Rating */}
                <div className="flex items-center space-x-2">
                  {/* Stars */}
                  <div className="flex space-x-1">
                    <button>
                      <span className="sr-only">1 star</span>
                      <svg className="fill-current text-yellow-500" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                      </svg>
                    </button>
                    <button>
                      <span className="sr-only">2 stars</span>
                      <svg className="fill-current text-yellow-500" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                      </svg>
                    </button>
                    <button>
                      <span className="sr-only">3 stars</span>
                      <svg className="fill-current text-yellow-500" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                      </svg>
                    </button>
                    <button>
                      <span className="sr-only">4 stars</span>
                      <svg className="fill-current text-yellow-500" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                      </svg>
                    </button>
                    <button>
                      <span className="sr-only">5 stars</span>
                      <svg
                        className="fill-current text-gray-300 dark:text-gray-600"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                      >
                        <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                      </svg>
                    </button>
                  </div>
                  {/* Rate */}
                  <div className="inline-flex text-sm font-medium text-yellow-600">4.2</div>
                </div>
                <div className="text-gray-400 dark:text-gray-600">·</div>
                {/* Price */}
                <div>
                  <div className="inline-flex rounded-full bg-green-500/20 px-2 py-0.5 text-center text-sm font-medium text-green-700">
                    $89.00
                  </div>
                </div>
              </div>
              <button className="text-sm underline hover:no-underline">Remove</button>
            </div>
          </div>
        </li>
        {/* Cart item */}
        <li className="items-center border-b border-gray-200 py-6 sm:flex dark:border-gray-700/60">
          <a className="mr-5 mb-4 block shrink-0 sm:mb-0 md:w-32 xl:w-auto" href="#0">
            <Image className="rounded-xs" src={Related03} width={200} height={142} alt="Product 03" />
          </a>
          <div className="grow">
            <a href="#0">
              <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-gray-100">
                Full-Stack JavaScript Course!
              </h3>
            </a>
            <div className="mb-2 text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut.
            </div>
            {/* Product meta */}
            <div className="flex flex-wrap items-center justify-between">
              {/* Rating and price */}
              <div className="mr-2 flex flex-wrap items-center space-x-2">
                {/* Rating */}
                <div className="flex items-center space-x-2">
                  {/* Stars */}
                  <div className="flex space-x-1">
                    <button>
                      <span className="sr-only">1 star</span>
                      <svg className="fill-current text-yellow-500" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                      </svg>
                    </button>
                    <button>
                      <span className="sr-only">2 stars</span>
                      <svg className="fill-current text-yellow-500" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                      </svg>
                    </button>
                    <button>
                      <span className="sr-only">3 stars</span>
                      <svg className="fill-current text-yellow-500" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                      </svg>
                    </button>
                    <button>
                      <span className="sr-only">4 stars</span>
                      <svg className="fill-current text-yellow-500" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                      </svg>
                    </button>
                    <button>
                      <span className="sr-only">5 stars</span>
                      <svg
                        className="fill-current text-gray-300 dark:text-gray-600"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                      >
                        <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                      </svg>
                    </button>
                  </div>
                  {/* Rate */}
                  <div className="inline-flex text-sm font-medium text-yellow-600">4.2</div>
                </div>
                <div className="text-gray-400 dark:text-gray-600">·</div>
                {/* Price */}
                <div>
                  <div className="inline-flex rounded-full bg-green-500/20 px-2 py-0.5 text-center text-sm font-medium text-green-700">
                    $89.00
                  </div>
                </div>
              </div>
              <button className="text-sm underline hover:no-underline">Remove</button>
            </div>
          </div>
        </li>
      </ul>

      <div className="mt-6">
        <Link
          className="text-sm font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
          href="/ecommerce/shop"
        >
          &lt;- Back To Shopping
        </Link>
      </div>
    </>
  );
}
