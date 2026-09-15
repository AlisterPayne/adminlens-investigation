"use client";

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { useState } from "react";

export default function DateSelect() {
  const options = [
    {
      id: 0,
      period: "Today",
    },
    {
      id: 1,
      period: "Last 7 Days",
    },
    {
      id: 2,
      period: "Last Month",
    },
    {
      id: 3,
      period: "Last 12 Months",
    },
    {
      id: 4,
      period: "All Time",
    },
  ];

  const [selected, setSelected] = useState<number>(2);

  return (
    <Menu as="div" className="relative inline-flex">
      {({ open }) => (
        <>
          <MenuButton
            className="btn min-w-[11rem] justify-between border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-800 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-gray-100"
            aria-label="Select date range"
          >
            <span className="flex items-center">
              <svg
                className="mr-2 shrink-0 fill-current text-gray-400 dark:text-gray-500"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path d="M5 4a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z" />
                <path d="M4 0a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4H4ZM2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Z" />
              </svg>
              <span>{options[selected].period}</span>
            </span>
            <svg
              className="ml-1 shrink-0 fill-current text-gray-400 dark:text-gray-500"
              width="11"
              height="7"
              viewBox="0 0 11 7"
            >
              <path d="M5.4 6.8L0 1.4 1.4 0l4 4 4-4 1.4 1.4z" />
            </svg>
          </MenuButton>
          <Transition
            as="div"
            className="absolute top-full right-0 z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white py-1.5 shadow-lg dark:border-gray-700/60 dark:bg-gray-800"
            enter="transition ease-out duration-100 transform"
            enterFrom="opacity-0 -translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-out duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <MenuItems className="text-sm font-medium text-gray-600 focus:outline-hidden dark:text-gray-300">
              {options.map((option, optionIndex) => (
                <MenuItem key={optionIndex}>
                  {({ active }) => (
                    <button
                      className={`flex w-full cursor-pointer items-center px-3 py-1 ${active ? "bg-gray-50 dark:bg-gray-700/20" : ""} ${option.id === selected && "text-violet-500"}`}
                      onClick={() => {
                        setSelected(option.id);
                      }}
                    >
                      <svg
                        className={`mr-2 shrink-0 fill-current text-violet-500 ${option.id !== selected && "invisible"}`}
                        width="12"
                        height="9"
                        viewBox="0 0 12 9"
                      >
                        <path d="M10.28.28L3.989 6.575 1.695 4.28A1 1 0 00.28 5.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28.28z" />
                      </svg>
                      <span>{option.period}</span>
                    </button>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Transition>
        </>
      )}
    </Menu>
  );
}
