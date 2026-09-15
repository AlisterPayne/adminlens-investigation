export const metadata = {
  title: "Avatar - Mosaic",
  description: "Page description",
};

import Image from "next/image";

import Avatar01 from "@/public/images/avatar-01.jpg";
import Avatar02 from "@/public/images/avatar-02.jpg";
import Avatar03 from "@/public/images/avatar-03.jpg";
import Avatar04 from "@/public/images/avatar-04.jpg";
import Avatar05 from "@/public/images/avatar-05.jpg";
import Avatar06 from "@/public/images/avatar-06.jpg";

export default function AvatarLibrary() {
  return (
    <div className="relative h-full bg-white dark:bg-gray-900">
      <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Avatar</h1>
        </div>

        <div>
          {/* Components */}
          <div className="mt-8 space-y-8">
            {/* Basic Avatars */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Basic Avatars</h2>
              <div className="-m-1.5 flex flex-wrap items-center">
                <div className="m-1.5">
                  {/* Start */}
                  <Image className="rounded-full" src={Avatar01} width={24} height={24} alt="Avatar" />
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <Image className="rounded-full" src={Avatar01} width={28} height={28} alt="Avatar" />
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <Image className="rounded-full" src={Avatar01} width={32} height={32} alt="Avatar" />
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <Image className="rounded-full" src={Avatar01} width={40} height={40} alt="Avatar" />
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <Image className="rounded-full" src={Avatar01} width={64} height={64} alt="Avatar" />
                  {/* End */}
                </div>
              </div>
            </div>

            {/* Avatars with Notification */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Avatars with Notification</h2>
              <div className="-m-1.5 flex flex-wrap items-center">
                <div className="m-1.5">
                  {/* Start */}
                  <div className="relative">
                    <Image className="rounded-full" src={Avatar01} width={24} height={24} alt="Avatar" />
                    <div className="absolute top-0 right-0 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-gray-900"></div>
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="relative">
                    <Image className="rounded-full" src={Avatar01} width={28} height={28} alt="Avatar" />
                    <div className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500 dark:border-gray-900"></div>
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="relative">
                    <Image className="rounded-full" src={Avatar01} width={32} height={32} alt="Avatar" />
                    <div className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 dark:border-gray-900"></div>
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="relative">
                    <Image className="rounded-full" src={Avatar01} width={40} height={40} alt="Avatar" />
                    <div className="absolute top-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-900"></div>
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="relative">
                    <Image className="rounded-full" src={Avatar01} width={64} height={64} alt="Avatar" />
                    <div className="absolute top-0 right-1 h-3 w-3 rounded-full border-2 border-white bg-red-500 dark:border-gray-900"></div>
                  </div>
                  {/* End */}
                </div>
              </div>
            </div>

            {/* Avatars with Placeholder Icon */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">
                Avatars with Placeholder Icon
              </h2>
              <div className="-m-1.5 flex flex-wrap items-center">
                <div className="m-1.5">
                  {/* Start */}
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500 uppercase dark:bg-gray-700">
                    MS
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500 uppercase dark:bg-gray-700">
                    MS
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500 uppercase dark:bg-gray-700">
                    MS
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500 uppercase dark:bg-gray-700">
                    MS
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-lg font-semibold text-gray-500 uppercase dark:bg-gray-700">
                    MS
                  </div>
                  {/* End */}
                </div>
              </div>
            </div>

            {/* Avatars Groups */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Avatars Groups</h2>
              <div className="-m-1.5 flex flex-wrap items-center">
                <div className="m-1.5">
                  {/* Start */}
                  <div className="-ml-0.5 flex -space-x-3">
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar02}
                      width={24}
                      height={24}
                      alt="Avatar"
                    />
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar03}
                      width={24}
                      height={24}
                      alt="Avatar"
                    />
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar04}
                      width={24}
                      height={24}
                      alt="Avatar"
                    />
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar05}
                      width={24}
                      height={24}
                      alt="Avatar"
                    />
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar06}
                      width={24}
                      height={24}
                      alt="Avatar"
                    />
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="-ml-0.5 flex -space-x-3">
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar02}
                      width={28}
                      height={28}
                      alt="Avatar"
                    />
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar03}
                      width={28}
                      height={28}
                      alt="Avatar"
                    />
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar04}
                      width={28}
                      height={28}
                      alt="Avatar"
                    />
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar05}
                      width={28}
                      height={28}
                      alt="Avatar"
                    />
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar06}
                      width={28}
                      height={28}
                      alt="Avatar"
                    />
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="-ml-0.5 flex -space-x-3">
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar02}
                      width={32}
                      height={32}
                      alt="Avatar"
                    />
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar03}
                      width={32}
                      height={32}
                      alt="Avatar"
                    />
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar04}
                      width={32}
                      height={32}
                      alt="Avatar"
                    />
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar05}
                      width={32}
                      height={32}
                      alt="Avatar"
                    />
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar06}
                      width={32}
                      height={32}
                      alt="Avatar"
                    />
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="-ml-0.5 flex -space-x-4">
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar02}
                      width={40}
                      height={40}
                      alt="Avatar"
                    />
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar03}
                      width={40}
                      height={40}
                      alt="Avatar"
                    />
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar04}
                      width={40}
                      height={40}
                      alt="Avatar"
                    />
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar05}
                      width={40}
                      height={40}
                      alt="Avatar"
                    />
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar06}
                      width={40}
                      height={40}
                      alt="Avatar"
                    />
                  </div>
                  {/* End */}
                </div>
                <div className="m-1.5">
                  {/* Start */}
                  <div className="-ml-0.5 flex -space-x-7">
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar02}
                      width={64}
                      height={64}
                      alt="Avatar"
                    />
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar03}
                      width={64}
                      height={64}
                      alt="Avatar"
                    />
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar04}
                      width={64}
                      height={64}
                      alt="Avatar"
                    />
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar05}
                      width={64}
                      height={64}
                      alt="Avatar"
                    />
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-900"
                      src={Avatar06}
                      width={64}
                      height={64}
                      alt="Avatar"
                    />
                  </div>
                  {/* End */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
