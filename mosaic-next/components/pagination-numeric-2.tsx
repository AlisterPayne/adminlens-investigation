export default function PaginationNumeric02() {
  return (
    <div>
      <nav className="flex justify-between" role="navigation" aria-label="Navigation">
        <div className="mr-2 flex-1">
          <span className="btn border-gray-200 bg-white text-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-600">
            &lt;-<span className="hidden sm:inline">&nbsp;Previous</span>
          </span>
        </div>
        <div className="grow text-center">
          <ul className="inline-flex -space-x-px text-sm font-medium">
            <li>
              <span className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-2 py-2 leading-5 text-violet-500 shadow-sm dark:border-gray-700/60 dark:bg-gray-800">
                <span className="w-5">1</span>
              </span>
            </li>
            <li>
              <a
                className="inline-flex items-center justify-center border border-transparent px-2 py-2 leading-5 text-gray-600 hover:text-violet-500 dark:text-gray-300 dark:hover:text-violet-500"
                href="#0"
              >
                <span className="w-5">2</span>
              </a>
            </li>
            <li>
              <a
                className="inline-flex items-center justify-center border border-transparent px-2 py-2 leading-5 text-gray-600 hover:text-violet-500 dark:text-gray-300 dark:hover:text-violet-500"
                href="#0"
              >
                <span className="w-5">3</span>
              </a>
            </li>
            <li>
              <span className="inline-flex items-center justify-center px-2 py-2 leading-5 text-gray-400 dark:text-gray-500">
                …
              </span>
            </li>
            <li>
              <a
                className="inline-flex items-center justify-center rounded-r border border-transparent px-2 py-2 leading-5 text-gray-600 hover:text-violet-500 dark:text-gray-300 dark:hover:text-violet-500"
                href="#0"
              >
                <span className="w-5">9</span>
              </a>
            </li>
          </ul>
        </div>
        <div className="ml-2 flex-1 text-right">
          <a
            className="btn border-gray-200 bg-white text-gray-800 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
            href="#0"
          >
            <span className="hidden sm:inline">Next&nbsp;</span>-&gt;
          </a>
        </div>
      </nav>
    </div>
  );
}
