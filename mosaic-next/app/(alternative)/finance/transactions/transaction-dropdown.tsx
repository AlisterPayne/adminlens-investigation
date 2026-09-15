"use client";

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import Link from "next/link";

export default function TransactionDropdown({ align }: { align?: "left" | "right" }) {
  return (
    <Menu as="div" className="relative inline-flex">
      <MenuButton className="group inline-flex items-center justify-center">
        <div className="flex items-center truncate">
          <span className="truncate font-medium text-violet-500 group-hover:text-violet-600 dark:group-hover:text-violet-400">
            My Personal Account
          </span>
          <svg className="ml-1 h-3 w-3 shrink-0 fill-current text-violet-400" viewBox="0 0 12 12">
            <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
          </svg>
        </div>
      </MenuButton>
      <Transition
        as="div"
        className={`absolute top-full z-10 mt-1 min-w-[11rem] origin-top-right overflow-hidden rounded-lg border border-gray-200 bg-white py-1.5 shadow-lg dark:border-gray-700/60 dark:bg-gray-800 ${
          align === "right" ? "right-0" : "left-0"
        }`}
        enter="transition ease-out duration-200 transform"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <MenuItems as="ul" className="focus:outline-hidden">
          <MenuItem as="li">
            {({ active }) => (
              <Link
                className={`flex px-3 py-1 text-sm font-medium ${active ? "text-gray-800 dark:text-gray-200" : "text-gray-600 dark:text-gray-300"}`}
                href="#0"
              >
                Business Account
              </Link>
            )}
          </MenuItem>
          <MenuItem as="li">
            {({ active }) => (
              <Link
                className={`flex px-3 py-1 text-sm font-medium ${active ? "text-gray-800 dark:text-gray-200" : "text-gray-600 dark:text-gray-300"}`}
                href="#0"
              >
                Family Account
              </Link>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
