export const metadata = {
  title: "Icons - Mosaic",
  description: "Page description",
};

export default function IconsLibrary() {
  return (
    <div className="relative h-full bg-white dark:bg-gray-900">
      <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Icons</h1>
        </div>

        <div>
          {/* Components */}
          <div className="mt-8 space-y-8">
            <div className="text-sm">
              If you need more icons than what we currently support in Mosaic, check out these great packs 👇
            </div>

            {/* Nucleo */}
            <div>
              <div className="mb-6 flex items-start space-x-3">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Nucleo</h2>
                <div className="btn-xs rounded-full bg-violet-500/20 px-2.5 py-1 text-xs text-violet-600 shadow-none">
                  Recommended
                </div>
              </div>
              <div className="rounded-lg bg-gray-100 px-6 py-8 text-center xl:flex xl:flex-wrap xl:items-center xl:justify-between xl:text-left dark:bg-gray-800/50">
                <div className="mx-auto mb-4 max-w-lg text-gray-900 xl:mx-0 xl:mb-0 2xl:max-w-none dark:text-gray-100">
                  99% of the icons used in Mosaic come from Nucleo; a huge library of 3K+ vector icons!
                </div>
                <div className="inline-flex space-x-3">
                  <a
                    className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
                    href="https://nucleoapp.com/pricing"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Buy Nucleo
                  </a>
                  <a
                    className="btn border-gray-200 bg-white text-gray-800 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
                    href="https://nucleoapp.com/free-icons"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download Free Pack
                  </a>
                </div>
              </div>
            </div>

            {/* Tabler Icons */}
            <div>
              <div className="mb-6 flex items-start space-x-3">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Tabler Icons</h2>
                <div className="inline-flex rounded-full bg-green-500/20 px-2.5 py-1 text-center text-xs font-medium text-green-700">
                  Free Alternative
                </div>
              </div>
              <div className="rounded-lg bg-gray-100 px-6 py-8 text-center xl:flex xl:flex-wrap xl:items-center xl:justify-between xl:text-left dark:bg-gray-800/50">
                <div className="mx-auto mb-4 max-w-lg text-gray-900 xl:mx-0 xl:mb-0 2xl:max-w-none dark:text-gray-100">
                  A set of 1250+ icons that are visually consistent with the style used in Mosaic!
                </div>
                <div className="inline-flex space-x-3">
                  <a
                    className="btn border-gray-200 bg-white text-gray-800 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
                    href="https://tabler.io/icons"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download Tabler Icons
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
