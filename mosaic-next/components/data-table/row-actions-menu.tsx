"use client";

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import Link from "next/link";

export default function RowActionsMenu({
  href,
  detailLabel,
  onRemove,
  align = "right",
}: {
  href: string;
  detailLabel: string;
  onRemove?: () => void;
  align?: "left" | "right";
}) {
  return (
    <Menu as="div" className="relative inline-flex">
      {({ open }) => (
        <>
          <MenuButton
            className={`rounded-full ${open ? "bg-gray-100 text-gray-500 dark:bg-gray-700/60 dark:text-gray-400" : "text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"}`}
          >
            <span className="sr-only">Menu</span>
            <svg className="h-8 w-8 fill-current" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="2" />
              <circle cx="10" cy="16" r="2" />
              <circle cx="22" cy="16" r="2" />
            </svg>
          </MenuButton>
          <Transition
            as="div"
            className={`absolute top-full z-10 mt-1 min-w-[9rem] origin-top-right overflow-hidden rounded-lg border border-gray-200 bg-white py-1.5 shadow-lg dark:border-gray-700/60 dark:bg-gray-800 ${align === "right" ? "right-0" : "left-0"}`}
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
                    href={href}
                  >
                    {detailLabel}
                  </Link>
                )}
              </MenuItem>
              <MenuItem as="li">
                {({ active }) => (
                  <Link
                    className={`flex px-3 py-1 text-sm font-medium ${active ? "text-gray-800 dark:text-gray-200" : "text-gray-600 dark:text-gray-300"}`}
                    href={href}
                  >
                    Edit
                  </Link>
                )}
              </MenuItem>
              <MenuItem as="li">
                {({ active }) => (
                  <button
                    className={`flex w-full px-3 py-1 text-left text-sm font-medium ${active ? "text-red-600" : "text-red-500"}`}
                    onClick={onRemove}
                  >
                    Remove
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Transition>
        </>
      )}
    </Menu>
  );
}
