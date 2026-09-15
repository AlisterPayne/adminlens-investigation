export const metadata = {
  title: "Product - Mosaic",
  description: "Page description",
};

import Image from "next/image";
import Link from "next/link";

import ProductImage from "@/public/images/product-image.jpg";
import Related01 from "@/public/images/related-product-01.jpg";
import Related02 from "@/public/images/related-product-02.jpg";
import Related03 from "@/public/images/related-product-03.jpg";
import User03 from "@/public/images/user-32-03.jpg";
import User04 from "@/public/images/user-32-04.jpg";
import User05 from "@/public/images/user-32-05.jpg";
import User07 from "@/public/images/user-32-07.jpg";

export default function Product() {
  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col lg:flex-row lg:space-x-8 xl:space-x-16">
        {/* Content */}
        <div>
          <div className="mb-3">
            <Link
              className="text-sm font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
              href="/ecommerce/shop/"
            >
              &lt;- Back To Listing
            </Link>
          </div>
          <header className="mb-4">
            {/* Title */}
            <h1 className="mb-2 text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">
              Front-End Learning: Hands-On HTML & CSS In Real Web Apps
            </h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua ut enim ad minim veniam.
            </p>
          </header>

          {/* Meta */}
          <div className="mb-6 space-y-3 sm:flex sm:items-center sm:justify-between sm:space-y-0">
            {/* Author */}
            <div className="flex items-center sm:mr-4">
              <a className="mr-2 block shrink-0" href="#0">
                <Image className="rounded-full" src={User07} width={32} height={32} alt="User 04" />
              </a>
              <a className="block text-sm font-semibold whitespace-nowrap text-gray-800 dark:text-gray-100" href="#0">
                Simona Lürwer
              </a>
            </div>
            {/* Right side */}
            <div className="flex flex-wrap items-center space-x-4 sm:justify-end">
              {/* Tag */}
              <div className="inline-flex items-center rounded-full bg-gray-900/60 px-2 py-0.5 text-center text-xs font-medium text-gray-100 dark:bg-gray-800/60 dark:text-gray-300">
                <svg className="mr-1 h-3 w-3 shrink-0 fill-current text-yellow-500" viewBox="0 0 12 12">
                  <path d="M11.953 4.29a.5.5 0 00-.454-.292H6.14L6.984.62A.5.5 0 006.12.173l-6 7a.5.5 0 00.379.825h5.359l-.844 3.38a.5.5 0 00.864.445l6-7a.5.5 0 00.075-.534z" />
                </svg>
                <span>Special Offer</span>
              </div>
              {/* Rating */}
              <div className="mr-2 flex items-center space-x-2">
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
            </div>
          </div>

          {/* Image */}
          <figure className="mb-6">
            <Image className="w-full rounded-xs" src={ProductImage} width="640" height="360" alt="Product" />
          </figure>

          {/* Product content */}
          <div>
            <h2 className="mb-2 text-xl leading-snug font-bold text-gray-800 dark:text-gray-100">Overview</h2>
            <p className="mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua u t enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat.
            </p>
            <p className="mb-6">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
              laborum.
            </p>
            <ul className="mb-6 list-inside list-disc space-y-1">
              <li>E-commerce: Better lorem ipsum generator.</li>
              <li>Booking: Lorem ipsum post generator.</li>
              <li>Retail: Better lorem ipsum generator.</li>
              <li>Services: Better lorem ipsum generator.</li>
            </ul>
            <blockquote className="mb-6 italic">
              “Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
              laborum.”
            </blockquote>
          </div>

          <hr className="my-6 border-t border-gray-100 dark:border-gray-700/60" />

          {/* Reviews */}
          <div>
            <h2 className="mb-2 text-xl leading-snug font-bold text-gray-800 dark:text-gray-100">
              Featured Reviews (44)
            </h2>
            <ul className="my-6 space-y-5">
              {/* Review */}
              <li>
                <div className="mb-2 flex items-center">
                  <Image className="mr-3 h-8 w-8 rounded-full" src={User07} width={32} height={32} alt="User 07" />
                  <div>
                    <div className="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-100">Danielle Mark</div>
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
                      <div className="inline-flex text-sm font-medium text-yellow-600">4.6</div>
                    </div>
                  </div>
                </div>
                <div className="text-sm italic">
                  “Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                  et dolore magna aliqua. Ut enim ad minim veniam.”
                </div>
              </li>
              {/* Review */}
              <li>
                <div className="mb-2 flex items-center">
                  <Image className="mr-3 h-8 w-8 rounded-full" src={User05} width={32} height={32} alt="User 05" />
                  <div>
                    <div className="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-100">Marija Urkjulz</div>
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
                          <svg className="fill-current text-yellow-500" width="16" height="16" viewBox="0 0 16 16">
                            <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                          </svg>
                        </button>
                      </div>
                      {/* Rate */}
                      <div className="inline-flex text-sm font-medium text-yellow-600">4.9</div>
                    </div>
                  </div>
                </div>
                <div className="text-sm italic">
                  “Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                  et dolore magna aliqua. Ut enim ad minim veniam.”
                </div>
              </li>
              {/* Review */}
              <li>
                <div className="mb-2 flex items-center">
                  <Image className="mr-3 h-8 w-8 rounded-full" src={User03} width={32} height={32} alt="User 03" />
                  <div>
                    <div className="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-100">Rodrigo Pantoja</div>
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
                      <div className="inline-flex text-sm font-medium text-yellow-600">4.4</div>
                    </div>
                  </div>
                </div>
                <div className="text-sm italic">
                  “Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                  et dolore magna aliqua. Ut enim ad minim veniam.”
                </div>
              </li>
              {/* Review */}
              <li>
                <div className="mb-2 flex items-center">
                  <Image className="mr-3 h-8 w-8 rounded-full" src={User04} width={32} height={32} alt="User 04" />
                  <div>
                    <div className="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-100">Juan Johnson</div>
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
                          <svg className="fill-current text-yellow-500" width="16" height="16" viewBox="0 0 16 16">
                            <path d="M10 5.934L8 0 6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934z" />
                          </svg>
                        </button>
                      </div>
                      {/* Rate */}
                      <div className="inline-flex text-sm font-medium text-yellow-600">4.9</div>
                    </div>
                  </div>
                </div>
                <div className="text-sm italic">
                  “Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                  et dolore magna aliqua. Ut enim ad minim veniam.”
                </div>
              </li>
            </ul>
            {/* Load More */}
            <div className="text-center">
              <button className="btn border-gray-200 bg-white text-gray-800 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600">
                Load More Reviews
              </button>
            </div>
          </div>

          <hr className="my-6 border-t border-gray-100 dark:border-gray-700/60" />

          {/* Related */}
          <div>
            <h2 className="mb-2 text-xl leading-snug font-bold text-gray-800 dark:text-gray-100">
              Frequently Bought Together
            </h2>
            <ul className="my-6 space-y-8 sm:space-y-5">
              {/* Related item */}
              <li className="items-center sm:flex">
                <a className="mr-5 mb-4 block shrink-0 sm:mb-0 md:w-32 xl:w-auto" href="#0">
                  <Image className="rounded-xs" src={Related01} width="200" height="142" alt="Product 01" />
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
                  {/* Rating and price */}
                  <div className="flex flex-wrap items-center space-x-2">
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
                </div>
              </li>
              {/* Related item */}
              <li className="items-center sm:flex">
                <a className="mr-5 mb-4 block shrink-0 sm:mb-0 md:w-32 xl:w-auto" href="#0">
                  <Image className="rounded-xs" src={Related02} width="200" height="142" alt="Product 02" />
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
                  {/* Rating and price */}
                  <div className="flex flex-wrap items-center space-x-2">
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
                </div>
              </li>
              {/* Related item */}
              <li className="items-center sm:flex">
                <a className="mr-5 mb-4 block shrink-0 sm:mb-0 md:w-32 xl:w-auto" href="#0">
                  <Image className="rounded-xs" src={Related03} width="200" height="142" alt="Product 03" />
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
                  {/* Rating and price */}
                  <div className="flex flex-wrap items-center space-x-2">
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
                </div>
              </li>
            </ul>
            {/* Load More */}
            <div className="text-center">
              <button className="btn border-gray-200 bg-white text-gray-800 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600">
                Load More Stuff
              </button>
            </div>
          </div>

          <hr className="my-6 border-t border-gray-100 dark:border-gray-700/60" />
        </div>

        {/* Sidebar */}
        <div>
          <div className="rounded-xl bg-white p-5 shadow-sm lg:w-[18rem] xl:w-[20rem] dark:bg-gray-800">
            <div className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">Select a Package</div>
            <ul className="mb-4 space-y-2 sm:flex sm:space-y-0 sm:space-x-2 lg:flex-col lg:space-y-2 lg:space-x-0">
              <li>
                <button className="h-full w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-gray-600">
                  <div className="mb-0.5 flex flex-wrap items-center justify-between">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">Essential</span>
                    <span className="font-medium text-green-600">$39.00</span>
                  </div>
                  <div className="text-sm">Lorem ipsum dolor sit amet elit sed do eiusmod.</div>
                </button>
              </li>
              <li>
                <button className="h-full w-full rounded-lg border-2 border-violet-400 bg-white px-4 py-3 text-left shadow-sm transition dark:border-violet-500 dark:bg-gray-800">
                  <div className="mb-0.5 flex flex-wrap items-center justify-between">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                      Premium <span className="align-top text-xs text-violet-500 italic">Best Value</span>
                    </span>
                    <span className="font-medium text-green-600">$69.00</span>
                  </div>
                  <div className="text-sm">Lorem ipsum dolor sit amet elit sed do eiusmod.</div>
                </button>
              </li>
              <li>
                <button className="h-full w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-gray-600">
                  <div className="mb-0.5 flex flex-wrap items-center justify-between">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">Complete</span>
                    <span className="font-medium text-green-600">$89.00</span>
                  </div>
                  <div className="text-sm">Lorem ipsum dolor sit amet elit sed do eiusmod.</div>
                </button>
              </li>
            </ul>
            <div className="mb-4">
              <a
                className="btn w-full bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
                href="#0"
              >
                Buy Now - $69.00
              </a>
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
