export const metadata = {
  title: "Kanban - Mosaic",
  description: "Page description",
};

import Link from "next/link";

import Task01 from "./task-01";
import Task02 from "./task-02";
import Task03 from "./task-03";
import Task04 from "./task-04";
import Task05 from "./task-05";
import Task06 from "./task-06";
import Task07 from "./task-07";
import Task08 from "./task-08";
import Task09 from "./task-09";
import TasksGroups from "./tasks-groups";

export default function Kanban() {
  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Acme Inc. Tasks</h1>
        </div>

        {/* Right: Actions */}
        <div className="grid grid-flow-col justify-start gap-2 sm:auto-cols-max sm:justify-end">
          {/* Add board button */}
          <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
            Add Board
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700/60">
        <ul className="no-scrollbar -mx-4 flex flex-nowrap overflow-x-scroll text-sm font-medium sm:-mx-6 lg:-mx-8">
          <li className="mr-6 pb-3 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
            <Link className="whitespace-nowrap text-violet-500" href="#0">
              View All
            </Link>
          </li>
          <li className="mr-6 pb-3 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
            <Link
              className="whitespace-nowrap text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              href="#0"
            >
              Web Sprint
            </Link>
          </li>
          <li className="mr-6 pb-3 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
            <Link
              className="whitespace-nowrap text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              href="#0"
            >
              Marketing
            </Link>
          </li>
          <li className="mr-6 pb-3 first:pl-4 last:mr-0 last:pr-4 sm:first:pl-6 sm:last:pr-6 lg:first:pl-8 lg:last:pr-8">
            <Link
              className="whitespace-nowrap text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              href="#0"
            >
              Development
            </Link>
          </li>
        </ul>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-12 gap-x-4 gap-y-8">
        {/* Tasks column */}
        <TasksGroups title="To Do's">
          <Task01 />
          <Task02 />
          <Task03 />
        </TasksGroups>
        {/* Tasks column */}
        <TasksGroups title="In Progress">
          <Task04 />
          <Task05 />
        </TasksGroups>
        {/* Tasks column */}
        <TasksGroups title="Completed">
          <Task06 />
          <Task07 />
        </TasksGroups>
        {/* Tasks column */}
        <TasksGroups title="Notes">
          <Task08 />
          <Task09 />
        </TasksGroups>
      </div>
    </div>
  );
}
