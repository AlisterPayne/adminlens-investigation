import Link from "next/link";

export const metadata = {
  title: "Add Customer - Mosaic",
  description: "Add a new customer",
};

export default function AddCustomer() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <div className="mb-6">
        <Link
          className="btn-sm border-gray-200 bg-white px-3 text-gray-600 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
          href="/ecommerce/customers"
        >
          <svg className="mr-2 fill-current text-gray-400 dark:text-gray-500" width="7" height="12" viewBox="0 0 7 12">
            <path d="M5.4 10.6 1.8 7l3.6-3.6L4 2 0 6l4 4z" />
          </svg>
          <span>Back to Customers</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Add Customer</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create a customer profile and contact details.</p>
      </div>

      <form className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Left: profile card */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm lg:sticky lg:top-24 lg:col-span-1 dark:bg-gray-800">
          {/* Gradient banner */}
          <div className="h-24 bg-linear-to-r from-violet-500 to-sky-500" aria-hidden="true" />
          <div className="px-5 pb-5">
            {/* Avatar */}
            <div className="-mt-10 mb-4 flex flex-col items-center text-center">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 ring-4 ring-white dark:bg-gray-700 dark:ring-gray-800">
                  <svg
                    className="fill-current text-gray-400 dark:text-gray-500"
                    width="28"
                    height="28"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8 9c-2.7 0-8 1.3-8 4v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2c0-2.7-5.3-4-8-4Z" />
                  </svg>
                </div>
                <button
                  type="button"
                  className="absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-gray-100 shadow-sm dark:bg-gray-100 dark:text-gray-800"
                >
                  <span className="sr-only">Upload photo</span>
                  <svg className="fill-current" width="14" height="14" viewBox="0 0 16 16">
                    <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                  </svg>
                </button>
              </div>
              <div className="mt-3 font-semibold text-gray-800 dark:text-gray-100">New Customer</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">JPG, GIF or PNG. Max 2MB.</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="status">
                  Account status
                </label>
                <select id="status" name="status" className="form-select w-full" defaultValue="Active">
                  <option>Active</option>
                  <option>Invited</option>
                  <option>Inactive</option>
                </select>
              </div>
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 dark:border-gray-700/60">
                <span className="flex items-center text-sm font-medium">
                  <svg
                    className="mr-2 shrink-0 fill-current text-yellow-500"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 0L6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934h-6L8 0z" />
                  </svg>
                  VIP customer
                </span>
                <input type="checkbox" name="fav" className="form-checkbox" />
              </label>
            </div>
          </div>
        </div>

        {/* Right: form sections */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
            <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-100">Personal details</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="firstname">
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstname"
                  name="firstname"
                  className="form-input w-full"
                  type="text"
                  placeholder="Jane"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="lastname">
                  Last name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastname"
                  name="lastname"
                  className="form-input w-full"
                  type="text"
                  placeholder="Doe"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium" htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  className="form-input w-full"
                  type="email"
                  placeholder="jane@company.com"
                  required
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
            <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-100">Location</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="location">
                  Country
                </label>
                <select id="location" name="location" className="form-select w-full" defaultValue="🇬🇧 London, UK">
                  <option>🇬🇧 London, UK</option>
                  <option>🇩🇪 Dortmund, DE</option>
                  <option>🇫🇷 Paris, FR</option>
                  <option>🇮🇹 Bologna, IT</option>
                  <option>🇮🇹 Milan, IT</option>
                  <option>🇫🇷 Marseille, FR</option>
                  <option>🇯🇵 Tokio, JP</option>
                  <option>🇨🇳 Shanghai, CN</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="createdAt">
                  Customer since
                </label>
                <input id="createdAt" name="createdAt" className="form-input w-full" type="date" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/ecommerce/customers"
              className="btn border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
            >
              Save Customer
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
