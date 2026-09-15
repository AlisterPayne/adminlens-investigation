export const metadata = {
  title: "Roadmap - Mosaic",
  description: "Page description",
};

import Image from "next/image";

import User01 from "@/public/images/user-28-01.jpg";
import User02 from "@/public/images/user-28-02.jpg";
import User03 from "@/public/images/user-28-03.jpg";
import User05 from "@/public/images/user-28-05.jpg";
import User06 from "@/public/images/user-28-06.jpg";
import User08 from "@/public/images/user-28-08.jpg";
import User09 from "@/public/images/user-28-09.jpg";

export default function Roadmap() {
  return (
    <div className="relative h-full bg-white dark:bg-gray-900">
      {/* Page header */}
      <div className="border-b border-gray-200 px-4 py-8 sm:flex sm:items-center sm:justify-between sm:px-6 dark:border-gray-700/60">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Roadmap</h1>
        </div>

        {/* Right: Actions */}
        <div className="grid grid-flow-col justify-start gap-2 sm:auto-cols-max sm:justify-end">
          {/* Add event button */}
          <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
            Add Event
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
        <div className="m-auto max-w-3xl">
          {/* Posts */}
          <div className="xl:-translate-x-16">
            {/* Post */}
            <article className="pt-6">
              <div className="xl:flex">
                <div className="w-32 shrink-0">
                  <h2 className="mb-4 text-xl leading-snug font-bold text-gray-800 xl:mb-0 xl:leading-7 dark:text-gray-100">
                    2024 Q1
                  </h2>
                </div>
                <div className="grow border-b border-gray-200 pb-6 dark:border-gray-700/60">
                  <header>
                    <div className="mb-6 flex flex-nowrap items-center space-x-2">
                      {/* Avatars */}
                      <div className="-ml-px flex shrink-0 -space-x-3">
                        <a className="block" href="#0">
                          <Image
                            className="box-content rounded-full border-2 border-white dark:border-gray-800"
                            src={User05}
                            width={28}
                            height={28}
                            alt="User 05"
                          />
                        </a>
                        <a className="block" href="#0">
                          <Image
                            className="box-content rounded-full border-2 border-white dark:border-gray-800"
                            src={User08}
                            width={28}
                            height={28}
                            alt="User 08"
                          />
                        </a>
                        <a className="block" href="#0">
                          <Image
                            className="box-content rounded-full border-2 border-white dark:border-gray-800"
                            src={User09}
                            width={28}
                            height={28}
                            alt="User 09"
                          />
                        </a>
                        <a className="block" href="#0">
                          <Image
                            className="box-content rounded-full border-2 border-white dark:border-gray-800"
                            src={User06}
                            width={28}
                            height={28}
                            alt="User 06"
                          />
                        </a>
                      </div>
                      <div className="text-gray-400 dark:text-gray-600">·</div>
                      <div>
                        <div className="inline-flex rounded-full bg-green-500/20 px-2.5 py-1 text-center text-xs font-medium text-green-700">
                          Completed
                        </div>
                      </div>
                    </div>
                  </header>
                  {/* List */}
                  <ul className="-my-2">
                    {/* List item */}
                    <li className="relative py-2">
                      <div className="mb-1 flex items-center">
                        <div
                          className="absolute left-0 ml-2.5 h-full w-0.5 -translate-x-1/2 translate-y-3 self-start bg-gray-200 dark:bg-gray-700"
                          aria-hidden="true"
                        ></div>
                        <div className="absolute left-0 rounded-full bg-violet-500" aria-hidden="true">
                          <svg className="fill-current text-white" width="20" height="20" viewBox="0 0 20 20">
                            <path d="M14.4 8.4L13 7l-4 4-2-2-1.4 1.4L9 13.8z" />
                          </svg>
                        </div>
                        <h3 className="pl-9 text-lg font-bold text-gray-800 dark:text-gray-100">
                          Product V1 - Early Access
                        </h3>
                      </div>
                      <div className="pl-9">
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                        pariatur.
                      </div>
                    </li>
                    {/* List item */}
                    <li className="relative py-2">
                      <div className="mb-1 flex items-center">
                        <div
                          className="absolute left-0 ml-2.5 h-full w-0.5 -translate-x-1/2 translate-y-3 self-start bg-gray-200 dark:bg-gray-700"
                          aria-hidden="true"
                        ></div>
                        <div className="absolute left-0 rounded-full bg-violet-500" aria-hidden="true">
                          <svg className="fill-current text-white" width="20" height="20" viewBox="0 0 20 20">
                            <path d="M14.4 8.4L13 7l-4 4-2-2-1.4 1.4L9 13.8z" />
                          </svg>
                        </div>
                        <h3 className="pl-9 text-lg font-bold text-gray-800 dark:text-gray-100">Web3 Compatibility</h3>
                      </div>
                      <div className="pl-9">
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                        pariatur.
                      </div>
                    </li>
                    {/* List item */}
                    <li className="relative py-2">
                      <div className="mb-1 flex items-center">
                        <div
                          className="absolute left-0 ml-2.5 h-full w-0.5 -translate-x-1/2 translate-y-3 self-start bg-gray-200 dark:bg-gray-700"
                          aria-hidden="true"
                        ></div>
                        <div className="absolute left-0 rounded-full bg-violet-500" aria-hidden="true">
                          <svg className="fill-current text-white" width="20" height="20" viewBox="0 0 20 20">
                            <path d="M14.4 8.4L13 7l-4 4-2-2-1.4 1.4L9 13.8z" />
                          </svg>
                        </div>
                        <h3 className="pl-9 text-lg font-bold text-gray-800 dark:text-gray-100">
                          Proof-of-Funds Compliance Key
                        </h3>
                      </div>
                      <div className="pl-9">
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                        pariatur.
                      </div>
                    </li>
                    {/* List item */}
                    <li className="relative py-2">
                      <div className="mb-1 flex items-center">
                        <div className="absolute left-0 rounded-full bg-violet-500" aria-hidden="true">
                          <svg className="fill-current text-white" width="20" height="20" viewBox="0 0 20 20">
                            <path d="M14.4 8.4L13 7l-4 4-2-2-1.4 1.4L9 13.8z" />
                          </svg>
                        </div>
                        <h3 className="pl-9 text-lg font-bold text-gray-800 dark:text-gray-100">
                          Activity Feed Integration
                        </h3>
                      </div>
                      <div className="pl-9">
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                        pariatur.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </article>

            {/* Post */}
            <article className="pt-6">
              <div className="xl:flex">
                <div className="w-32 shrink-0">
                  <h2 className="mb-4 text-xl leading-snug font-bold text-gray-800 xl:mb-0 xl:leading-7 dark:text-gray-100">
                    2024 Q2
                  </h2>
                </div>
                <div className="grow border-b border-gray-200 pb-6 dark:border-gray-700/60">
                  <header>
                    <div className="mb-6 flex flex-nowrap items-center space-x-2">
                      {/* Avatars */}
                      <div className="-ml-px flex shrink-0 -space-x-3">
                        <a className="block" href="#0">
                          <Image
                            className="box-content rounded-full border-2 border-white dark:border-gray-800"
                            src={User03}
                            width={28}
                            height={28}
                            alt="User 03"
                          />
                        </a>
                        <a className="block" href="#0">
                          <Image
                            className="box-content rounded-full border-2 border-white dark:border-gray-800"
                            src={User05}
                            width={28}
                            height={28}
                            alt="User 05"
                          />
                        </a>
                        <a className="block" href="#0">
                          <Image
                            className="box-content rounded-full border-2 border-white dark:border-gray-800"
                            src={User01}
                            width={28}
                            height={28}
                            alt="User 01"
                          />
                        </a>
                      </div>
                      <div className="text-gray-400 dark:text-gray-600">·</div>
                      <div>
                        <div className="btn-xs rounded-full bg-violet-500/20 px-2.5 py-1 text-xs text-violet-600 shadow-none">
                          Working on
                        </div>
                      </div>
                    </div>
                  </header>
                  {/* List */}
                  <ul className="-my-2">
                    {/* List item */}
                    <li className="relative py-2">
                      <div className="mb-1 flex items-center">
                        <div
                          className="absolute left-0 ml-2.5 h-full w-0.5 -translate-x-1/2 translate-y-3 self-start bg-gray-200 dark:bg-gray-700"
                          aria-hidden="true"
                        ></div>
                        <div className="absolute left-0 rounded-full bg-violet-500" aria-hidden="true">
                          <svg className="fill-current text-white" width="20" height="20" viewBox="0 0 20 20">
                            <path d="M14.4 8.4L13 7l-4 4-2-2-1.4 1.4L9 13.8z" />
                          </svg>
                        </div>
                        <h3 className="pl-9 text-lg font-bold text-gray-800 dark:text-gray-100">
                          Product V1 - Early Access
                        </h3>
                      </div>
                      <div className="pl-9">
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                        pariatur.
                      </div>
                    </li>
                    {/* List item */}
                    <li className="relative py-2">
                      <div className="mb-1 flex items-center">
                        <div
                          className="absolute left-0 ml-2.5 h-full w-0.5 -translate-x-1/2 translate-y-3 self-start bg-gray-200 dark:bg-gray-700"
                          aria-hidden="true"
                        ></div>
                        <div className="absolute left-0 rounded-full bg-violet-500" aria-hidden="true">
                          <svg className="fill-current text-white" width="20" height="20" viewBox="0 0 20 20">
                            <path d="M14.4 8.4L13 7l-4 4-2-2-1.4 1.4L9 13.8z" />
                          </svg>
                        </div>
                        <h3 className="pl-9 text-lg font-bold text-gray-800 dark:text-gray-100">Web3 Compatibility</h3>
                      </div>
                      <div className="pl-9">
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                        pariatur.
                      </div>
                    </li>
                    {/* List item */}
                    <li className="relative py-2">
                      <div className="mb-1 flex items-center">
                        <div
                          className="absolute left-0 ml-2.5 h-full w-0.5 -translate-x-1/2 translate-y-3 self-start bg-gray-200 dark:bg-gray-700"
                          aria-hidden="true"
                        ></div>
                        <div className="absolute left-0 rounded-full bg-violet-500" aria-hidden="true">
                          <svg className="fill-current text-white" width="20" height="20" viewBox="0 0 20 20">
                            <path d="M14.4 8.4L13 7l-4 4-2-2-1.4 1.4L9 13.8z" />
                          </svg>
                        </div>
                        <h3 className="pl-9 text-lg font-bold text-gray-800 dark:text-gray-100">
                          Proof-of-Funds Compliance Key
                        </h3>
                      </div>
                      <div className="pl-9">
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                        pariatur.
                      </div>
                    </li>
                    {/* List item */}
                    <li className="relative py-2">
                      <div className="mb-1 flex items-center">
                        <div className="absolute left-0 rounded-full bg-white dark:bg-gray-900" aria-hidden="true">
                          <svg
                            className="fill-current text-gray-200 dark:text-gray-700"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2C4.477 20 0 15.523 0 10S4.477 0 10 0s10 4.477 10 10-4.477 10-10 10z" />
                          </svg>
                        </div>
                        <h3 className="pl-9 text-lg font-bold text-gray-800 dark:text-gray-100">
                          Activity Feed Integration
                        </h3>
                      </div>
                      <div className="pl-9">
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                        pariatur.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </article>

            {/* Post */}
            <article className="pt-6">
              <div className="xl:flex">
                <div className="w-32 shrink-0">
                  <h2 className="mb-4 text-xl leading-snug font-bold text-gray-800 xl:mb-0 xl:leading-7 dark:text-gray-100">
                    2024 Q3
                  </h2>
                </div>
                <div className="grow border-b border-gray-200 pb-6 dark:border-gray-700/60">
                  <header>
                    <div className="mb-6 flex flex-nowrap items-center space-x-2">
                      {/* Avatars */}
                      <div className="-ml-px flex shrink-0 -space-x-3">
                        <a className="block" href="#0">
                          <Image
                            className="box-content rounded-full border-2 border-white dark:border-gray-800"
                            src={User06}
                            width={28}
                            height={28}
                            alt="User 03"
                          />
                        </a>
                        <a className="block" href="#0">
                          <Image
                            className="box-content rounded-full border-2 border-white dark:border-gray-800"
                            src={User05}
                            width={28}
                            height={28}
                            alt="User 05"
                          />
                        </a>
                        <a className="block" href="#0">
                          <Image
                            className="box-content rounded-full border-2 border-white dark:border-gray-800"
                            src={User09}
                            width={28}
                            height={28}
                            alt="User 01"
                          />
                        </a>
                      </div>
                      <div className="text-gray-400 dark:text-gray-600">·</div>
                      <div>
                        <div className="inline-flex rounded-full bg-yellow-500/20 px-2.5 py-1 text-center text-xs font-medium text-yellow-700">
                          Planned
                        </div>
                      </div>
                    </div>
                  </header>
                  {/* List */}
                  <ul className="-my-2">
                    {/* List item */}
                    <li className="relative py-2">
                      <div className="mb-1 flex items-center">
                        <div
                          className="absolute left-0 ml-2.5 h-full w-0.5 -translate-x-1/2 translate-y-3 self-start bg-gray-200 dark:bg-gray-700"
                          aria-hidden="true"
                        ></div>
                        <div className="absolute left-0 rounded-full bg-white dark:bg-gray-900" aria-hidden="true">
                          <svg
                            className="fill-current text-gray-200 dark:text-gray-700"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2C4.477 20 0 15.523 0 10S4.477 0 10 0s10 4.477 10 10-4.477 10-10 10z" />
                          </svg>
                        </div>
                        <h3 className="pl-9 text-lg font-bold text-gray-800 dark:text-gray-100">
                          Product V1 - Early Access
                        </h3>
                      </div>
                      <div className="pl-9">
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                        pariatur.
                      </div>
                    </li>
                    {/* List item */}
                    <li className="relative py-2">
                      <div className="mb-1 flex items-center">
                        <div className="absolute left-0 rounded-full bg-white dark:bg-gray-900" aria-hidden="true">
                          <svg
                            className="fill-current text-gray-200 dark:text-gray-700"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2C4.477 20 0 15.523 0 10S4.477 0 10 0s10 4.477 10 10-4.477 10-10 10z" />
                          </svg>
                        </div>
                        <h3 className="pl-9 text-lg font-bold text-gray-800 dark:text-gray-100">Web3 Compatibility</h3>
                      </div>
                      <div className="pl-9">
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                        pariatur.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </article>

            {/* Post */}
            <article className="pt-6">
              <div className="xl:flex">
                <div className="w-32 shrink-0">
                  <h2 className="mb-4 text-xl leading-snug font-bold text-gray-800 xl:mb-0 xl:leading-7 dark:text-gray-100">
                    2024 Q4
                  </h2>
                </div>
                <div className="grow border-b border-gray-200 pb-6 dark:border-gray-700/60">
                  <header>
                    <div className="mb-6 flex flex-nowrap items-center space-x-2">
                      {/* Avatars */}
                      <div className="-ml-px flex shrink-0 -space-x-3">
                        <a className="block" href="#0">
                          <Image
                            className="box-content rounded-full border-2 border-white dark:border-gray-800"
                            src={User06}
                            width={28}
                            height={28}
                            alt="User 03"
                          />
                        </a>
                        <a className="block" href="#0">
                          <Image
                            className="box-content rounded-full border-2 border-white dark:border-gray-800"
                            src={User02}
                            width={28}
                            height={28}
                            alt="User 02"
                          />
                        </a>
                      </div>
                      <div className="text-gray-400 dark:text-gray-600">·</div>
                      <div>
                        <div className="inline-flex rounded-full bg-yellow-500/20 px-2.5 py-1 text-center text-xs font-medium text-yellow-700">
                          Planned
                        </div>
                      </div>
                    </div>
                  </header>
                  {/* List */}
                  <ul className="-my-2">
                    {/* List item */}
                    <li className="relative py-2">
                      <div className="mb-1 flex items-center">
                        <div
                          className="absolute left-0 ml-2.5 h-full w-0.5 -translate-x-1/2 translate-y-3 self-start bg-gray-200 dark:bg-gray-700"
                          aria-hidden="true"
                        ></div>
                        <div className="absolute left-0 rounded-full bg-white dark:bg-gray-900" aria-hidden="true">
                          <svg
                            className="fill-current text-gray-200 dark:text-gray-700"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2C4.477 20 0 15.523 0 10S4.477 0 10 0s10 4.477 10 10-4.477 10-10 10z" />
                          </svg>
                        </div>
                        <h3 className="pl-9 text-lg font-bold text-gray-800 dark:text-gray-100">
                          Product V1 - Early Access
                        </h3>
                      </div>
                      <div className="pl-9">
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                        pariatur.
                      </div>
                    </li>
                    {/* List item */}
                    <li className="relative py-2">
                      <div className="mb-1 flex items-center">
                        <div className="absolute left-0 rounded-full bg-white dark:bg-gray-900" aria-hidden="true">
                          <svg
                            className="fill-current text-gray-200 dark:text-gray-700"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2C4.477 20 0 15.523 0 10S4.477 0 10 0s10 4.477 10 10-4.477 10-10 10z" />
                          </svg>
                        </div>
                        <h3 className="pl-9 text-lg font-bold text-gray-800 dark:text-gray-100">Web3 Compatibility</h3>
                      </div>
                      <div className="pl-9">
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                        pariatur.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
