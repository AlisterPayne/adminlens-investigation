"use client";

import Image from "next/image";
import { useState } from "react";

import AccountImage from "@/public/images/user-avatar-80.png";

export default function AccountPanel() {
  const [sync, setSync] = useState<boolean>(false);

  return (
    <div className="grow">
      {/* Panel body */}
      <div className="space-y-6 p-6">
        <h2 className="mb-5 text-2xl font-bold text-gray-800 dark:text-gray-100">My Account</h2>
        {/* Picture */}
        <section>
          <div className="flex items-center">
            <div className="mr-4">
              <Image className="h-20 w-20 rounded-full" src={AccountImage} width={80} height={80} alt="User upload" />
            </div>
            <button className="btn-sm border-gray-200 text-gray-800 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600">
              Change
            </button>
          </div>
        </section>
        {/* Business Profile */}
        <section>
          <h2 className="mb-1 text-xl leading-snug font-bold text-gray-800 dark:text-gray-100">Business Profile</h2>
          <div className="text-sm">
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit.
          </div>
          <div className="mt-5 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-4">
            <div className="sm:w-1/3">
              <label className="mb-1 block text-sm font-medium" htmlFor="name">
                Business Name
              </label>
              <input id="name" className="form-input w-full" type="text" />
            </div>
            <div className="sm:w-1/3">
              <label className="mb-1 block text-sm font-medium" htmlFor="business-id">
                Business ID
              </label>
              <input id="business-id" className="form-input w-full" type="text" />
            </div>
            <div className="sm:w-1/3">
              <label className="mb-1 block text-sm font-medium" htmlFor="location">
                Location
              </label>
              <input id="location" className="form-input w-full" type="text" />
            </div>
          </div>
        </section>
        {/* Email */}
        <section>
          <h2 className="mb-1 text-xl leading-snug font-bold text-gray-800 dark:text-gray-100">Email</h2>
          <div className="text-sm">Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia.</div>
          <div className="mt-5 flex flex-wrap">
            <div className="mr-2">
              <label className="sr-only" htmlFor="email">
                Business email
              </label>
              <input id="email" className="form-input" type="email" />
            </div>
            <button className="btn border-gray-200 text-gray-800 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600">
              Change
            </button>
          </div>
        </section>
        {/* Password */}
        <section>
          <h2 className="mb-1 text-xl leading-snug font-bold text-gray-800 dark:text-gray-100">Password</h2>
          <div className="text-sm">
            You can set a permanent password if you don't want to use temporary login codes.
          </div>
          <div className="mt-5">
            <button className="btn border-gray-200 text-gray-800 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600">
              Set New Password
            </button>
          </div>
        </section>
        {/* Smart Sync */}
        <section>
          <h2 className="mb-1 text-xl leading-snug font-bold text-gray-800 dark:text-gray-100">
            Smart Sync update for Mac
          </h2>
          <div className="text-sm">
            With this update, online-only files will no longer appear to take up hard drive space.
          </div>
          <div className="mt-5 flex items-center">
            <div className="form-switch">
              <input type="checkbox" id="toggle" className="sr-only" checked={sync} onChange={() => setSync(!sync)} />
              <label htmlFor="toggle">
                <span className="bg-white shadow-sm" aria-hidden="true"></span>
                <span className="sr-only">Enable smart sync</span>
              </label>
            </div>
            <div className="ml-2 text-sm text-gray-400 italic dark:text-gray-500">{sync ? "On" : "Off"}</div>
          </div>
        </section>
      </div>
      {/* Panel footer */}
      <footer>
        <div className="flex flex-col border-t border-gray-200 px-6 py-5 dark:border-gray-700/60">
          <div className="flex self-end">
            <button className="btn border-gray-200 text-gray-800 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600">
              Cancel
            </button>
            <button className="btn ml-3 bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
              Save Changes
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
