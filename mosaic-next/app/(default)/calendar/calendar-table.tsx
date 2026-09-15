"use client";

import { useEffect } from "react";

import { CalendarProperties } from "./calendar-properties";

export interface Event {
  eventStart: Date;
  eventEnd: Date | null;
  eventName: string;
  eventColor: string;
}

export default function CalendarTable({ events }: { events: Event[] }) {
  const {
    dayNames,
    currentYear,
    currentMonth,
    daysInMonth,
    startingBlankDays,
    endingBlankDays,
    eventColor,
    isToday,
    renderDays,
  } = CalendarProperties();

  const getEvents = (date: number) => {
    return events.filter(
      (e) => new Date(e.eventStart).toDateString() === new Date(currentYear, currentMonth, date).toDateString(),
    );
  };

  useEffect(() => {
    renderDays();
  }, [currentMonth, currentYear]);

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow dark:bg-gray-800">
      {/* Days of the week */}
      <div className="grid grid-cols-7 gap-px border-b border-gray-200 dark:border-gray-700/60">
        {dayNames.map((day) => {
          return (
            <div className="px-1 py-3" key={day}>
              <div className="text-center text-sm font-medium text-gray-500 lg:hidden">{day.substring(0, 3)}</div>
              <div className="hidden text-center text-sm font-medium text-gray-500 lg:block dark:text-gray-400">
                {day}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700/60">
        {/* Diagonal stripes pattern */}
        <svg className="sr-only">
          <defs>
            <pattern id="stripes" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(135)">
              <line
                className="stroke-current text-gray-200 opacity-50 dark:text-gray-700"
                x1="0"
                y="0"
                x2="0"
                y2="5"
                strokeWidth="2"
              />
            </pattern>
          </defs>
        </svg>
        {/* Empty cells (previous month) */}
        {startingBlankDays.map((blankday) => {
          return (
            <div className="h-20 bg-gray-50 sm:h-28 lg:h-36 dark:bg-gray-800" key={blankday}>
              <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                <rect width="100%" height="100%" fill="url(#stripes)" />
              </svg>
            </div>
          );
        })}
        {/* Days of the current month */}
        {daysInMonth.map((day) => {
          return (
            <div className="relative h-20 overflow-hidden bg-white sm:h-28 lg:h-36 dark:bg-gray-800" key={day}>
              <div className="flex h-full flex-col justify-between">
                {/* Events */}
                <div className="relative flex grow flex-col overflow-hidden p-0.5 sm:p-1.5">
                  {getEvents(day).map((event) => {
                    return (
                      <button className="relative mb-1 w-full text-left" key={event.eventName}>
                        <div className={`overflow-hidden rounded-lg px-2 py-0.5 ${eventColor(event.eventColor)}`}>
                          {/* Event name */}
                          <div className="truncate text-xs font-semibold">{event.eventName}</div>
                          {/* Event time */}
                          <div className="hidden truncate text-xs uppercase sm:block">
                            {/* Start date */}
                            {event.eventStart && (
                              <span>
                                {event.eventStart.toLocaleTimeString([], {
                                  hour12: true,
                                  hour: "numeric",
                                  minute: "numeric",
                                })}
                              </span>
                            )}
                            {/* End date */}
                            {event.eventEnd && (
                              <span>
                                -{" "}
                                <span>
                                  {event.eventEnd.toLocaleTimeString([], {
                                    hour12: true,
                                    hour: "numeric",
                                    minute: "numeric",
                                  })}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  <div
                    className="pointer-events-none absolute right-0 bottom-0 left-0 h-4 bg-linear-to-t from-white to-transparent dark:from-gray-800"
                    aria-hidden="true"
                  ></div>
                </div>
                {/* Cell footer */}
                <div className="flex items-center justify-between p-0.5 sm:p-1.5">
                  {/* More button (if more than 2 events) */}
                  {getEvents(day).length > 2 && (
                    <button className="rounded-lg border border-gray-200 px-0.5 text-center text-xs font-medium whitespace-nowrap text-gray-500 sm:px-2 sm:py-0.5 dark:border-gray-700/60 dark:text-gray-300">
                      <span className="md:hidden">+</span>
                      <span>{getEvents(day).length - 2}</span> <span className="hidden md:inline">more</span>
                    </button>
                  )}
                  {/* Day number */}
                  <button
                    className={`ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full text-center text-xs font-medium hover:bg-violet-100 sm:text-sm dark:text-gray-300 dark:hover:bg-gray-600 ${isToday(day) && "text-violet-500"}`}
                  >
                    {day}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {/* Empty cells (next month) */}
        {endingBlankDays.map((blankday) => {
          return (
            <div className="h-20 bg-gray-50 sm:h-28 lg:h-36 dark:bg-gray-800" key={blankday}>
              <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                <rect width="100%" height="100%" fill="url(#stripes)" />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}
