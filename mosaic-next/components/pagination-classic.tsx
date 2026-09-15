export default function PaginationClassic() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <nav className="mb-4 sm:order-1 sm:mb-0" role="navigation" aria-label="Navigation">
        <ul className="flex justify-center">
          <li className="ml-3 first:ml-0">
            <span className="btn border-gray-200 bg-white text-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-600">
              &lt;- Previous
            </span>
          </li>
          <li className="ml-3 first:ml-0">
            <a
              className="btn border-gray-200 bg-white text-gray-800 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
              href="#0"
            >
              Next -&gt;
            </a>
          </li>
        </ul>
      </nav>
      <div className="text-center text-sm text-gray-500 sm:text-left">
        Showing <span className="font-medium text-gray-600 dark:text-gray-300">1</span> to{" "}
        <span className="font-medium text-gray-600 dark:text-gray-300">10</span> of{" "}
        <span className="font-medium text-gray-600 dark:text-gray-300">467</span> results
      </div>
    </div>
  );
}
