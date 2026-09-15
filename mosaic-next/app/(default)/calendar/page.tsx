export const metadata = {
  title: "Calendar - Mosaic",
  description: "Page description",
};

import { CalendarProvider } from "./calendar-context";
import CalendarNavigation from "./calendar-navigation";
import CalendarTable from "./calendar-table";
import CalendarTitle from "./title";

export default function Calendar() {
  // Some dummy events data
  const events = [
    // Previous month
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 8, 3),
      eventEnd: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 8, 7),
      eventName: "⛱️ Relax for 2 at Marienbad",
      eventColor: "indigo",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 12, 10),
      eventEnd: new Date(new Date().getFullYear(), new Date().getMonth(), 12, 11),
      eventName: "Team Catch-up",
      eventColor: "sky",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 18, 2),
      eventEnd: null,
      eventName: "✍️ New Project (2)",
      eventColor: "yellow",
    },
    // Current month
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1, 10),
      eventEnd: new Date(new Date().getFullYear(), new Date().getMonth(), 1, 11),
      eventName: "Meeting w/ Patrick Lin",
      eventColor: "sky",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1, 19),
      eventEnd: null,
      eventName: "Reservation at La Ginestre",
      eventColor: "indigo",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth(), 3, 9),
      eventEnd: new Date(new Date().getFullYear(), new Date().getMonth(), 3, 10),
      eventName: "✍️ New Project",
      eventColor: "yellow",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth(), 7, 21),
      eventEnd: new Date(new Date().getFullYear(), new Date().getMonth(), 7, 22),
      eventName: "⚽ 2024 - Semi-final",
      eventColor: "red",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth(), 9, 10),
      eventEnd: new Date(new Date().getFullYear(), new Date().getMonth(), 9, 11),
      eventName: "Meeting w/Carolyn",
      eventColor: "sky",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth(), 9, 13),
      eventEnd: null,
      eventName: "Pick up Marta at school",
      eventColor: "green",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth(), 9, 14),
      eventEnd: new Date(new Date().getFullYear(), new Date().getMonth(), 9, 15),
      eventName: "Meeting w/ Patrick Lin",
      eventColor: "green",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth(), 9, 19),
      eventEnd: null,
      eventName: "Reservation at La Ginestre",
      eventColor: "indigo",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth(), 11, 10),
      eventEnd: new Date(new Date().getFullYear(), new Date().getMonth(), 11, 11),
      eventName: "⛱️ Relax for 2 at Marienbad",
      eventColor: "indigo",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth(), 11, 19),
      eventEnd: null,
      eventName: "⚽ 2024 - Semi-final",
      eventColor: "red",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth(), 14, 10),
      eventEnd: new Date(new Date().getFullYear(), new Date().getMonth(), 14, 11),
      eventName: "Team Catch-up",
      eventColor: "sky",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth(), 21, 2),
      eventEnd: null,
      eventName: "Pick up Marta at school",
      eventColor: "green",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth(), 21, 3),
      eventEnd: new Date(new Date().getFullYear(), new Date().getMonth(), 21, 7),
      eventName: "✍️ New Project (2)",
      eventColor: "yellow",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth(), 22, 10),
      eventEnd: new Date(new Date().getFullYear(), new Date().getMonth(), 22, 11),
      eventName: "Team Catch-up",
      eventColor: "sky",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth(), 22, 19),
      eventEnd: null,
      eventName: "⚽ 2024 - Semi-final",
      eventColor: "red",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth(), 23, 0),
      eventEnd: new Date(new Date().getFullYear(), new Date().getMonth(), 23, 23),
      eventName: "You stay at Meridiana B&B",
      eventColor: "indigo",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth(), 25, 10),
      eventEnd: new Date(new Date().getFullYear(), new Date().getMonth(), 25, 11),
      eventName: "Meeting w/ Kylie Joh",
      eventColor: "sky",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth(), 29, 10),
      eventEnd: new Date(new Date().getFullYear(), new Date().getMonth(), 29, 11),
      eventName: "Call Request ->",
      eventColor: "sky",
    },
    // Next month
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 2, 3),
      eventEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 2, 7),
      eventName: "✍️ New Project (2)",
      eventColor: "yellow",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 14, 10),
      eventEnd: new Date(new Date().getFullYear(), new Date().getMonth(), 14, 11),
      eventName: "Team Catch-up",
      eventColor: "sky",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 25, 2),
      eventEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 25, 3),
      eventName: "Pick up Marta at school",
      eventColor: "green",
    },
    {
      eventStart: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 27, 21),
      eventEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 27, 22),
      eventName: "⚽ 2024 - Semi-final",
      eventColor: "red",
    },
  ];

  return (
    <CalendarProvider>
      <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-4 sm:flex sm:items-center sm:justify-between">
          {/* Left: Title */}
          <CalendarTitle />

          {/* Right: Actions */}
          <div className="grid grid-flow-col justify-start gap-2 sm:auto-cols-max sm:justify-end">
            <CalendarNavigation />

            <hr className="mx-1 h-full w-px border-none bg-gray-200 dark:bg-gray-700/60" />

            {/* Create event button */}
            <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
              Create Event
            </button>
          </div>
        </div>

        {/* Filters and view buttons */}
        <div className="mb-4 sm:flex sm:items-center sm:justify-between">
          {/* Filters  */}
          <div className="mr-2 mb-4 sm:mb-0">
            <ul className="-m-1 flex flex-wrap items-center">
              <li className="m-1">
                <button className="btn-sm border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600">
                  <div className="h-3.5 w-1 shrink-0 bg-sky-500"></div>
                  <span className="ml-1.5">Acme Inc.</span>
                </button>
              </li>
              <li className="m-1">
                <button className="btn-sm border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600">
                  <div className="h-3.5 w-1 shrink-0 bg-green-500"></div>
                  <span className="ml-1.5">Life & Family</span>
                </button>
              </li>
              <li className="m-1">
                <button className="btn-sm border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600">
                  <div className="h-3.5 w-1 shrink-0 bg-violet-500"></div>
                  <span className="ml-1.5">Reservations</span>
                </button>
              </li>
              <li className="m-1">
                <button className="btn-sm border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600">
                  <div className="h-3.5 w-1 shrink-0 bg-red-500"></div>
                  <span className="ml-1.5">Events</span>
                </button>
              </li>
              <li className="m-1">
                <button className="btn-sm border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600">
                  <div className="h-3.5 w-1 shrink-0 bg-yellow-500"></div>
                  <span className="ml-1.5">Misc</span>
                </button>
              </li>
              <li className="m-1">
                <button className="btn-sm border-gray-200 bg-white text-violet-500 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600">
                  +Add New
                </button>
              </li>
            </ul>
          </div>

          {/* View buttons (requires custom integration) */}
          <div className="flex flex-nowrap -space-x-px">
            <button className="btn rounded-none border-gray-200 bg-white text-violet-500 first:rounded-l-lg last:rounded-r-lg dark:border-gray-700/60 dark:bg-gray-800">
              Month
            </button>
            <button className="btn rounded-none border-gray-200 bg-white text-gray-600 first:rounded-l-lg last:rounded-r-lg hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-900">
              Week
            </button>
            <button className="btn rounded-none border-gray-200 bg-white text-gray-600 first:rounded-l-lg last:rounded-r-lg hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-900">
              Day
            </button>
          </div>
        </div>

        <CalendarTable events={events} />
      </div>
    </CalendarProvider>
  );
}
