"use client";

import Image from "next/image";
import { StaticImageData } from "next/image";
import { useState } from "react";

interface RichItem {
  id: number;
  image: StaticImageData;
  customer: string;
  email: string;
  location: string;
  date: string;
  amount: string;
  descriptionTitle: string;
  descriptionBody: string;
}

interface RichItemProps {
  item: RichItem;
}

export default function AccordionTableRichItem({ item }: RichItemProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <tbody className="text-sm">
      <tr>
        <td className="px-2 py-3 whitespace-nowrap first:pl-5 last:pr-5">
          <div className="flex items-center text-gray-800">
            <div className="mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 sm:mr-3 dark:bg-gray-700">
              <Image className="ml-1 rounded-full" src={item.image} width={40} height={40} alt={item.customer} />
            </div>
            <div className="font-medium text-gray-800 dark:text-gray-100">{item.customer}</div>
          </div>
        </td>
        <td className="px-2 py-3 whitespace-nowrap first:pl-5 last:pr-5">
          <div className="text-left">{item.email}</div>
        </td>
        <td className="px-2 py-3 whitespace-nowrap first:pl-5 last:pr-5">
          <div className="text-left">{item.location}</div>
        </td>
        <td className="px-2 py-3 whitespace-nowrap first:pl-5 last:pr-5">
          <div className="text-left">{item.date}</div>
        </td>
        <td className="px-2 py-3 whitespace-nowrap first:pl-5 last:pr-5">
          <div className="text-left font-medium text-green-500">{item.amount}</div>
        </td>
        <td className="w-px px-2 py-3 whitespace-nowrap first:pl-5 last:pr-5">
          <div className="flex items-center">
            <button
              className={`text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 ${open && "rotate-180"}`}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              aria-controls={`description-${item.id}`}
            >
              <span className="sr-only">Menu</span>
              <svg className="h-8 w-8 fill-current" viewBox="0 0 32 32">
                <path d="M16 20l-5.4-5.4 1.4-1.4 4 4 4-4 1.4 1.4z" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
      {/*
      Example of content revealing when clicking the button on the right side:
      Note that you must set a "colSpan" attribute on the <td> element,
      and it should match the number of columns in your table
      */}
      <tr id={`description-${item.id}`} role="region" className={`${!open && "hidden"}`}>
        <td colSpan={10} className="px-2 py-3 first:pl-5 last:pr-5">
          <div className="-mt-3 bg-gray-50 p-3 dark:bg-gray-950/[0.15] dark:text-gray-400">
            <div className="mb-3 text-sm">
              <div className="mb-1 font-medium text-gray-800 dark:text-gray-100">{item.descriptionTitle}</div>
              <div>{item.descriptionBody}</div>
            </div>
            <button className="btn-sm bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
              Approve
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  );
}
