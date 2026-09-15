export default function ProjectsCard10() {
  return (
    <div className="col-span-full rounded-xl bg-white shadow-sm dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Active Tasks</h2>
      </header>
      <div className="p-3">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto dark:text-gray-300">
            {/* Table header */}
            <thead className="rounded-xs bg-gray-50 text-xs text-gray-400 uppercase dark:bg-gray-700/50 dark:text-gray-500">
              <tr>
                <th className="p-2">
                  <div className="text-left font-semibold">Task</div>
                </th>
                <th className="p-2">
                  <div className="text-left font-semibold">Assignee</div>
                </th>
                <th className="p-2">
                  <div className="text-left font-semibold">Project</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">Due</div>
                </th>
                <th className="p-2">
                  <div className="text-center font-semibold">Status</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="divide-y divide-gray-100 text-sm font-medium dark:divide-gray-700/60">
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Implement auth flow</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Sara Chen</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Mosaic Platform</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Jul 8</div>
                </td>
                <td className="p-2">
                  <div className="text-center">
                    <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-xs font-medium text-sky-700">
                      In Progress
                    </span>
                  </div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Design dashboard widgets</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Emily Rodriguez</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Analytics Suite</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Jul 10</div>
                </td>
                <td className="p-2">
                  <div className="text-center">
                    <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-700">
                      Review
                    </span>
                  </div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Fix pagination bug</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Marcus Webb</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Mosaic Platform</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Jul 6</div>
                </td>
                <td className="p-2">
                  <div className="text-center">
                    <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-700">
                      Blocked
                    </span>
                  </div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Write API documentation</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">James Park</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Developer Portal</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Jul 12</div>
                </td>
                <td className="p-2">
                  <div className="text-center">
                    <span className="rounded-full bg-gray-500/20 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                      To Do
                    </span>
                  </div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Optimize database queries</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Nina Patel</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Mosaic Platform</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Jul 9</div>
                </td>
                <td className="p-2">
                  <div className="text-center">
                    <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-xs font-medium text-sky-700">
                      In Progress
                    </span>
                  </div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Set up CI pipeline</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">Tom Hughes</div>
                </td>
                <td className="p-2">
                  <div className="text-gray-800 dark:text-gray-100">DevOps</div>
                </td>
                <td className="p-2">
                  <div className="text-center">Jul 7</div>
                </td>
                <td className="p-2">
                  <div className="text-center">
                    <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-700">
                      Done
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
