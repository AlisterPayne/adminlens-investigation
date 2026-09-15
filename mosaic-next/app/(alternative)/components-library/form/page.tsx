export const metadata = {
  title: "Form - Mosaic",
  description: "Page description",
};

import Tooltip from "@/components/tooltip";

import FormSwitches from "./form-switches";

export default function FormLibrary() {
  return (
    <div className="relative h-full bg-white dark:bg-gray-900">
      <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Input Form</h1>
        </div>

        <div>
          {/* Components */}
          <div className="mt-8 space-y-8">
            {/* Input Types */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Input Types</h2>
              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  {/* Start */}
                  <div>
                    <label className="mb-1 block text-sm font-medium" htmlFor="default">
                      Default
                    </label>
                    <input id="default" className="form-input w-full" type="text" />
                  </div>
                  {/* End */}
                </div>

                <div>
                  {/* Start */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="mb-1 block text-sm font-medium" htmlFor="tooltip">
                        W/ Tooltip
                      </label>
                      <Tooltip className="ml-2" bg="dark" size="md">
                        <div className="text-sm text-gray-200">
                          Excepteur sint occaecat cupidata non proident, sunt.
                        </div>
                      </Tooltip>
                    </div>
                    <input id="tooltip" className="form-input w-full" type="text" />
                  </div>
                  {/* End */}
                </div>

                <div>
                  {/* Start */}
                  <div>
                    <label className="mb-1 block text-sm font-medium" htmlFor="mandatory">
                      Mandatory <span className="text-red-500">*</span>
                    </label>
                    <input id="mandatory" className="form-input w-full" type="text" required />
                  </div>
                  {/* End */}
                </div>

                <div>
                  {/* Start */}
                  <div>
                    <label className="mb-1 block text-sm font-medium" htmlFor="prefix">
                      W/ Prefix
                    </label>
                    <div className="relative">
                      <input id="prefix" className="form-input w-full pl-12" type="text" />
                      <div className="pointer-events-none absolute inset-0 right-auto flex items-center">
                        <span className="px-3 text-sm font-medium text-gray-400 dark:text-gray-500">USD</span>
                      </div>
                    </div>
                  </div>
                  {/* End */}
                </div>

                <div>
                  {/* Start */}
                  <div>
                    <label className="mb-1 block text-sm font-medium" htmlFor="suffix">
                      W/ Suffix
                    </label>
                    <div className="relative">
                      <input id="suffix" className="form-input w-full pr-8" type="text" />
                      <div className="pointer-events-none absolute inset-0 left-auto flex items-center">
                        <span className="px-3 text-sm font-medium text-gray-400 dark:text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                  {/* End */}
                </div>

                <div>
                  {/* Start */}
                  <div>
                    <label className="mb-1 block text-sm font-medium" htmlFor="placeholder">
                      W/ Placeholder
                    </label>
                    <input id="placeholder" className="form-input w-full" type="text" placeholder="Something cool..." />
                  </div>
                  {/* End */}
                </div>

                <div>
                  {/* Start */}
                  <form>
                    <label className="mb-1 block text-sm font-medium" htmlFor="icon">
                      W/ Icon
                    </label>
                    <div className="relative">
                      <input id="icon" className="form-input w-full pl-9" type="text" />
                      <div className="pointer-events-none absolute inset-0 right-auto flex items-center">
                        <svg
                          className="mr-2 ml-3 shrink-0 fill-current text-gray-400 dark:text-gray-500"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                        >
                          <path d="M11.7.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM4.6 14H2v-2.6l6-6L10.6 8l-6 6zM12 6.6L9.4 4 11 2.4 13.6 5 12 6.6z" />
                        </svg>
                      </div>
                    </div>
                  </form>
                  {/* End */}
                </div>

                <div>
                  {/* Start */}
                  <div>
                    <div>
                      <label className="mb-1 block text-sm font-medium" htmlFor="supporting-text">
                        W/ Supporting Text
                      </label>
                      <input id="supporting-text" className="form-input w-full" type="text" />
                    </div>
                    <div className="mt-1 text-xs">Supporting text goes here!</div>
                  </div>
                  {/* End */}
                </div>

                <div>
                  {/* Start */}
                  <form>
                    <label className="mb-1 block text-sm font-medium" htmlFor="form-search">
                      Search
                    </label>
                    <div className="relative">
                      <input id="form-search" className="form-input w-full pl-9" type="search" />
                      <button className="group absolute inset-0 right-auto" type="submit" aria-label="Search">
                        <svg
                          className="mr-2 ml-3 shrink-0 fill-current text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
                          <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
                        </svg>
                      </button>
                    </div>
                  </form>
                  {/* End */}
                </div>
              </div>
            </div>

            {/* Input Sizes */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Input Sizes</h2>
              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  {/* Start */}
                  <div>
                    <label className="mb-1 block text-sm font-medium" htmlFor="small">
                      Small
                    </label>
                    <input id="small" className="form-input w-full px-2 py-1" type="text" />
                  </div>
                  {/* End */}
                </div>

                <div>
                  {/* Start */}
                  <div>
                    <label className="mb-1 block text-sm font-medium" htmlFor="normal">
                      Default
                    </label>
                    <input id="normal" className="form-input w-full" type="text" />
                  </div>
                  {/* End */}
                </div>

                <div>
                  {/* Start */}
                  <div>
                    <label className="mb-1 block text-sm font-medium" htmlFor="large">
                      Large
                    </label>
                    <input id="large" className="form-input w-full px-4 py-3" type="text" />
                  </div>
                  {/* End */}
                </div>
              </div>
            </div>

            {/* Input States */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Input States</h2>
              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  {/* Start */}
                  <div>
                    <label className="mb-1 block text-sm font-medium" htmlFor="disabled">
                      Disabled
                    </label>
                    <input
                      id="disabled"
                      className="form-input w-full shadow-none disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:border-gray-700 dark:disabled:bg-gray-800 dark:disabled:text-gray-600 dark:disabled:placeholder:text-gray-600"
                      type="text"
                      placeholder="Something cool..."
                      disabled
                    />
                  </div>
                  {/* End */}
                </div>

                <div>
                  {/* Start */}
                  <div>
                    <div>
                      <label className="mb-1 block text-sm font-medium" htmlFor="error">
                        Error <span className="text-red-500">*</span>
                      </label>
                      <input id="error" className="form-input w-full border-red-300" type="text" />
                    </div>
                    <div className="mt-1 text-xs text-red-500">This field is required!</div>
                  </div>
                  {/* End */}
                </div>

                <div>
                  {/* Start */}
                  <div>
                    <div>
                      <label className="mb-1 block text-sm font-medium" htmlFor="success">
                        Success <span className="text-red-500">*</span>
                      </label>
                      <input id="success" className="form-input w-full border-green-300" type="text" />
                    </div>
                    <div className="mt-1 text-xs text-green-500">Sounds good!</div>
                  </div>
                  {/* End */}
                </div>
              </div>
            </div>

            {/* Select */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Select</h2>
              <label className="mb-1 block text-sm font-medium" htmlFor="country">
                Country
              </label>
              <select id="country" className="form-select">
                <option>Italy</option>
                <option>USA</option>
                <option>United Kingdom</option>
              </select>
            </div>

            {/* Checkbox */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Checkbox</h2>
              <div className="-m-3 flex flex-wrap items-center">
                <div className="m-3">
                  {/* Start */}
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="ml-2 text-sm">Active</span>
                  </label>
                  {/* End */}
                </div>

                <div className="m-3">
                  {/* Start */}
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox" defaultChecked />
                    <span className="ml-2 text-sm">Selected</span>
                  </label>
                  {/* End */}
                </div>

                <div className="m-3">
                  {/* Start */}
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox disabled:border-gray-200 disabled:bg-gray-100 dark:disabled:border-gray-700 dark:disabled:bg-gray-800"
                      disabled
                    />
                    <span className="ml-2 text-sm">Disabled</span>
                  </label>
                  {/* End */}
                </div>
              </div>
            </div>

            {/* Radio */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Radio</h2>
              <div className="-m-3 flex flex-wrap items-center">
                <div className="m-3">
                  {/* Start */}
                  <label className="flex items-center">
                    <input type="radio" name="radio-buttons" className="form-radio" />
                    <span className="ml-2 text-sm">Active</span>
                  </label>
                  {/* End */}
                </div>

                <div className="m-3">
                  {/* Start */}
                  <label className="flex items-center">
                    <input type="radio" name="radio-buttons" className="form-radio" defaultChecked />
                    <span className="ml-2 text-sm">Selected</span>
                  </label>
                  {/* End */}
                </div>

                <div className="m-3">
                  {/* Start */}
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="radio-buttons"
                      className="form-radio disabled:border-gray-200 disabled:bg-gray-100 dark:disabled:border-gray-700 dark:disabled:bg-gray-800"
                      disabled
                    />
                    <span className="ml-2 text-sm">Disabled</span>
                  </label>
                  {/* End */}
                </div>
              </div>
            </div>

            {/* Toggle Switch */}
            <FormSwitches />
          </div>
        </div>
      </div>
    </div>
  );
}
