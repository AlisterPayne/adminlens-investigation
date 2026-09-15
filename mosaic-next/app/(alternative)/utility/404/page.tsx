// This is just a demo page, look for the not-found.js file in the app directory.

export const metadata = {
  title: "Page Not Found - Mosaic",
  description: "Page description",
};

import Image from "next/image";
import Link from "next/link";

import NotFoundImage from "@/public/images/404-illustration.svg";
import NotFoundImageDark from "@/public/images/404-illustration-dark.svg";

export default function PageNotFound() {
  return (
    <div className="relative h-full bg-white dark:bg-gray-900">
      <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
        <div className="m-auto mt-16 max-w-2xl">
          <div className="px-4 text-center">
            <div className="mb-8 inline-flex">
              <Image className="dark:hidden" src={NotFoundImage} width={176} height={176} alt="404 illustration" />
              <Image
                className="hidden dark:block"
                src={NotFoundImageDark}
                width={176}
                height={176}
                alt="404 illustration dark"
              />
            </div>
            <div className="mb-6">Hmm...this page doesn't exist. Try searching for something else!</div>
            <Link
              href="/"
              className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
            >
              Back To Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
