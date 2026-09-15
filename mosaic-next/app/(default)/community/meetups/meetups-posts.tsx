import Image from "next/image";
import Link from "next/link";

import UserImage01 from "@/public/images/avatar-01.jpg";
import UserImage02 from "@/public/images/avatar-02.jpg";
import UserImage03 from "@/public/images/avatar-03.jpg";
import UserImage04 from "@/public/images/avatar-04.jpg";
import UserImage05 from "@/public/images/avatar-05.jpg";
import UserImage06 from "@/public/images/avatar-06.jpg";
import MeetupsThumb01 from "@/public/images/meetups-thumb-01.jpg";
import MeetupsThumb02 from "@/public/images/meetups-thumb-02.jpg";
import MeetupsThumb03 from "@/public/images/meetups-thumb-03.jpg";
import MeetupsThumb04 from "@/public/images/meetups-thumb-04.jpg";
import MeetupsThumb05 from "@/public/images/meetups-thumb-05.jpg";
import MeetupsThumb06 from "@/public/images/meetups-thumb-06.jpg";
import MeetupsThumb07 from "@/public/images/meetups-thumb-07.jpg";
import MeetupsThumb08 from "@/public/images/meetups-thumb-08.jpg";

export default function MeetupsPosts() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {/* Item 1 */}
      <article className="flex overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
        {/* Image */}
        <Link
          className="xl:sidebar-expanded:w-40 2xl:sidebar-expanded:w-[14rem] relative block w-24 shrink-0 sm:w-[14rem]"
          href="/community/meetups/post"
        >
          <Image
            className="absolute h-full w-full object-cover object-center"
            src={MeetupsThumb01}
            width={220}
            height={236}
            alt="Meetup 01"
          />
          {/* Like button */}
          <button className="absolute top-0 right-0 mt-4 mr-4">
            <div className="rounded-full bg-gray-900/60 text-gray-100">
              <span className="sr-only">Like</span>
              <svg className="h-8 w-8 fill-current" viewBox="0 0 32 32">
                <path d="M22.682 11.318A4.485 4.485 0 0019.5 10a4.377 4.377 0 00-3.5 1.707A4.383 4.383 0 0012.5 10a4.5 4.5 0 00-3.182 7.682L16 24l6.682-6.318a4.5 4.5 0 000-6.364zm-1.4 4.933L16 21.247l-5.285-5A2.5 2.5 0 0112.5 12c1.437 0 2.312.681 3.5 2.625C17.187 12.681 18.062 12 19.5 12a2.5 2.5 0 011.785 4.251h-.003z" />
              </svg>
            </div>
          </button>
        </Link>
        {/* Content */}
        <div className="flex grow flex-col p-5">
          <div className="grow">
            <div className="mb-2 text-sm font-semibold text-violet-500 uppercase">Mon 27 Dec, 2024</div>
            <Link className="mb-2 inline-flex" href="/community/meetups/post">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                Silicon Valley Bootstrapper Breakfast Online for 2024
              </h3>
            </Link>
            <div className="text-sm">
              Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for
              previewing layouts.
            </div>
          </div>
          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            {/* Tag */}
            <div className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-1 text-center text-xs font-medium text-gray-600 dark:border-gray-700/60 dark:text-gray-400">
              <svg className="mr-2 h-3 w-4 fill-gray-400 dark:fill-gray-500" viewBox="0 0 16 12">
                <path d="m16 2-4 2.4V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.6l4 2.4V2ZM2 10V2h8v8H2Z" />
              </svg>
              <span>Online Event</span>
            </div>
            {/* Avatars */}
            <div className="flex items-center space-x-2">
              <div className="-ml-0.5 flex -space-x-3">
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage01}
                  width={28}
                  height={28}
                  alt="User 01"
                />
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage04}
                  width={28}
                  height={28}
                  alt="User 04"
                />
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage05}
                  width={28}
                  height={28}
                  alt="User 05"
                />
              </div>
              <div className="text-xs font-medium text-gray-400 italic dark:text-gray-500">+22</div>
            </div>
          </div>
        </div>
      </article>

      {/* Item 2 */}
      <article className="flex overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
        {/* Image */}
        <Link
          className="xl:sidebar-expanded:w-40 2xl:sidebar-expanded:w-[14rem] relative block w-24 shrink-0 sm:w-[14rem]"
          href="/community/meetups/post"
        >
          <Image
            className="absolute h-full w-full object-cover object-center"
            src={MeetupsThumb02}
            width={220}
            height={236}
            alt="Meetup 02"
          />
          {/* Like button */}
          <button className="absolute top-0 right-0 mt-4 mr-4">
            <div className="rounded-full bg-gray-900/60 text-gray-100">
              <span className="sr-only">Like</span>
              <svg className="h-8 w-8 fill-current" viewBox="0 0 32 32">
                <path d="M22.682 11.318A4.485 4.485 0 0019.5 10a4.377 4.377 0 00-3.5 1.707A4.383 4.383 0 0012.5 10a4.5 4.5 0 00-3.182 7.682L16 24l6.682-6.318a4.5 4.5 0 000-6.364zm-1.4 4.933L16 21.247l-5.285-5A2.5 2.5 0 0112.5 12c1.437 0 2.312.681 3.5 2.625C17.187 12.681 18.062 12 19.5 12a2.5 2.5 0 011.785 4.251h-.003z" />
              </svg>
            </div>
          </button>
        </Link>
        {/* Content */}
        <div className="flex grow flex-col p-5">
          <div className="grow">
            <div className="mb-2 text-sm font-semibold text-violet-500 uppercase">Mon 27 Dec, 2024</div>
            <Link className="mb-2 inline-flex" href="/community/meetups/post">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                New York &amp; New Jersey Virtual Retreat 2024
              </h3>
            </Link>
            <div className="text-sm">
              Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for
              previewing layouts.
            </div>
          </div>
          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            {/* Tag */}
            <div className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-1 text-center text-xs font-medium text-gray-600 dark:border-gray-700/60 dark:text-gray-400">
              <svg className="mr-2 h-3 w-4 fill-gray-400 dark:fill-gray-500" viewBox="0 0 16 12">
                <path d="m16 2-4 2.4V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.6l4 2.4V2ZM2 10V2h8v8H2Z" />
              </svg>
              <span>Online Event</span>
            </div>
            {/* Avatars */}
            <div className="flex items-center space-x-2">
              <div className="-ml-0.5 flex -space-x-3">
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage02}
                  width={28}
                  height={28}
                  alt="User 02"
                />
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage03}
                  width={28}
                  height={28}
                  alt="User 03"
                />
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage04}
                  width={28}
                  height={28}
                  alt="User 04"
                />
              </div>
              <div className="text-xs font-medium text-gray-400 italic dark:text-gray-500">+132</div>
            </div>
          </div>
        </div>
      </article>

      {/* Item 3 */}
      <article className="flex overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
        {/* Image */}
        <Link
          className="xl:sidebar-expanded:w-40 2xl:sidebar-expanded:w-[14rem] relative block w-24 shrink-0 sm:w-[14rem]"
          href="/community/meetups/post"
        >
          <Image
            className="absolute h-full w-full object-cover object-center"
            src={MeetupsThumb03}
            width={220}
            height={236}
            alt="Meetup 03"
          />
          {/* Like button */}
          <button className="absolute top-0 right-0 mt-4 mr-4">
            <div className="rounded-full bg-gray-900/60 text-gray-100">
              <span className="sr-only">Like</span>
              <svg className="h-8 w-8 fill-current" viewBox="0 0 32 32">
                <path d="M22.682 11.318A4.485 4.485 0 0019.5 10a4.377 4.377 0 00-3.5 1.707A4.383 4.383 0 0012.5 10a4.5 4.5 0 00-3.182 7.682L16 24l6.682-6.318a4.5 4.5 0 000-6.364zm-1.4 4.933L16 21.247l-5.285-5A2.5 2.5 0 0112.5 12c1.437 0 2.312.681 3.5 2.625C17.187 12.681 18.062 12 19.5 12a2.5 2.5 0 011.785 4.251h-.003z" />
              </svg>
            </div>
          </button>
        </Link>
        {/* Content */}
        <div className="flex grow flex-col p-5">
          <div className="grow">
            <div className="mb-2 text-sm font-semibold text-violet-500 uppercase">Wed 29 Dec, 2024</div>
            <Link className="mb-2 inline-flex" href="/community/meetups/post">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                The World of AI and Machine Learning — Open Chat
              </h3>
            </Link>
            <div className="text-sm">
              Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for
              previewing layouts.
            </div>
          </div>
          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            {/* Tag */}
            <div className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-1 text-center text-xs font-medium text-gray-600 dark:border-gray-700/60 dark:text-gray-400">
              <svg className="mr-2 h-3 w-4 fill-gray-400 dark:fill-gray-500" viewBox="0 0 16 12">
                <path d="m16 2-4 2.4V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.6l4 2.4V2ZM2 10V2h8v8H2Z" />
              </svg>
              <span>Online Event</span>
            </div>
            {/* Avatars */}
            <div className="flex items-center space-x-2">
              <div className="-ml-0.5 flex -space-x-3">
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage06}
                  width={28}
                  height={28}
                  alt="User 06"
                />
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage03}
                  width={28}
                  height={28}
                  alt="User 03"
                />
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage01}
                  width={28}
                  height={28}
                  alt="User 01"
                />
              </div>
              <div className="text-xs font-medium text-gray-400 italic dark:text-gray-500">+12</div>
            </div>
          </div>
        </div>
      </article>

      {/* Item 4 */}
      <article className="flex overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
        {/* Image */}
        <Link
          className="xl:sidebar-expanded:w-40 2xl:sidebar-expanded:w-[14rem] relative block w-24 shrink-0 sm:w-[14rem]"
          href="/community/meetups/post"
        >
          <Image
            className="absolute h-full w-full object-cover object-center"
            src={MeetupsThumb04}
            width={220}
            height={236}
            alt="Meetup 04"
          />
          {/* Like button */}
          <button className="absolute top-0 right-0 mt-4 mr-4">
            <div className="rounded-full bg-gray-900/60 text-gray-100">
              <span className="sr-only">Like</span>
              <svg className="h-8 w-8 fill-current" viewBox="0 0 32 32">
                <path d="M22.682 11.318A4.485 4.485 0 0019.5 10a4.377 4.377 0 00-3.5 1.707A4.383 4.383 0 0012.5 10a4.5 4.5 0 00-3.182 7.682L16 24l6.682-6.318a4.5 4.5 0 000-6.364zm-1.4 4.933L16 21.247l-5.285-5A2.5 2.5 0 0112.5 12c1.437 0 2.312.681 3.5 2.625C17.187 12.681 18.062 12 19.5 12a2.5 2.5 0 011.785 4.251h-.003z" />
              </svg>
            </div>
          </button>
        </Link>
        {/* Content */}
        <div className="flex grow flex-col p-5">
          <div className="grow">
            <div className="mb-2 text-sm font-semibold text-violet-500 uppercase">Wed 29 Dec, 2024</div>
            <Link className="mb-2 inline-flex" href="/community/meetups/post">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                NYC Code &amp; Coffee 2.0 @ Freehold Brooklyn
              </h3>
            </Link>
            <div className="text-sm">
              Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for
              previewing layouts.
            </div>
          </div>
          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            {/* Tag */}
            <div className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-1 text-center text-xs font-medium text-gray-600 dark:border-gray-700/60 dark:text-gray-400">
              <svg className="mr-2 h-3 w-4 fill-gray-400 dark:fill-gray-500" viewBox="0 0 16 12">
                <path d="m16 2-4 2.4V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.6l4 2.4V2ZM2 10V2h8v8H2Z" />
              </svg>
              <span>Online Event</span>
            </div>
            {/* Avatars */}
            <div className="flex items-center space-x-2">
              <div className="-ml-0.5 flex -space-x-3">
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage05}
                  width={28}
                  height={28}
                  alt="User 05"
                />
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage02}
                  width={28}
                  height={28}
                  alt="User 02"
                />
              </div>
              <div className="text-xs font-medium text-gray-400 italic dark:text-gray-500">+17</div>
            </div>
          </div>
        </div>
      </article>

      {/* Item 5 */}
      <article className="flex overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
        {/* Image */}
        <Link
          className="xl:sidebar-expanded:w-40 2xl:sidebar-expanded:w-[14rem] relative block w-24 shrink-0 sm:w-[14rem]"
          href="/community/meetups/post"
        >
          <Image
            className="absolute h-full w-full object-cover object-center"
            src={MeetupsThumb05}
            width={220}
            height={236}
            alt="Meetup 05"
          />
          {/* Like button */}
          <button className="absolute top-0 right-0 mt-4 mr-4">
            <div className="rounded-full bg-gray-900/60 text-gray-100">
              <span className="sr-only">Like</span>
              <svg className="h-8 w-8 fill-current" viewBox="0 0 32 32">
                <path d="M22.682 11.318A4.485 4.485 0 0019.5 10a4.377 4.377 0 00-3.5 1.707A4.383 4.383 0 0012.5 10a4.5 4.5 0 00-3.182 7.682L16 24l6.682-6.318a4.5 4.5 0 000-6.364zm-1.4 4.933L16 21.247l-5.285-5A2.5 2.5 0 0112.5 12c1.437 0 2.312.681 3.5 2.625C17.187 12.681 18.062 12 19.5 12a2.5 2.5 0 011.785 4.251h-.003z" />
              </svg>
            </div>
          </button>
        </Link>
        {/* Content */}
        <div className="flex grow flex-col p-5">
          <div className="grow">
            <div className="mb-2 text-sm font-semibold text-violet-500 uppercase">Mon 3 Jan, 2024</div>
            <Link className="mb-2 inline-flex" href="/community/meetups/post">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                Acme Inc. London Meetup: Women in Tech Night
              </h3>
            </Link>
            <div className="text-sm">
              Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for
              previewing layouts.
            </div>
          </div>
          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            {/* Tag */}
            <div className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-1 text-center text-xs font-medium text-gray-600 dark:border-gray-700/60 dark:text-gray-400">
              <svg className="mr-2 h-3 w-4 fill-gray-400 dark:fill-gray-500" viewBox="0 0 16 12">
                <path d="m16 2-4 2.4V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.6l4 2.4V2ZM2 10V2h8v8H2Z" />
              </svg>
              <span>Online Event</span>
            </div>
            {/* Avatars */}
            <div className="flex items-center space-x-2">
              <div className="-ml-0.5 flex -space-x-3">
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage02}
                  width={28}
                  height={28}
                  alt="User 02"
                />
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage01}
                  width={28}
                  height={28}
                  alt="User 01"
                />
              </div>
              <div className="text-xs font-medium text-gray-400 italic dark:text-gray-500">+117</div>
            </div>
          </div>
        </div>
      </article>

      {/* Item 6 */}
      <article className="flex overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
        {/* Image */}
        <Link
          className="xl:sidebar-expanded:w-40 2xl:sidebar-expanded:w-[14rem] relative block w-24 shrink-0 sm:w-[14rem]"
          href="/community/meetups/post"
        >
          <Image
            className="absolute h-full w-full object-cover object-center"
            src={MeetupsThumb06}
            width={220}
            height={236}
            alt="Meetup 06"
          />
          {/* Like button */}
          <button className="absolute top-0 right-0 mt-4 mr-4">
            <div className="rounded-full bg-gray-900/60 text-gray-100">
              <span className="sr-only">Like</span>
              <svg className="h-8 w-8 fill-current" viewBox="0 0 32 32">
                <path d="M22.682 11.318A4.485 4.485 0 0019.5 10a4.377 4.377 0 00-3.5 1.707A4.383 4.383 0 0012.5 10a4.5 4.5 0 00-3.182 7.682L16 24l6.682-6.318a4.5 4.5 0 000-6.364zm-1.4 4.933L16 21.247l-5.285-5A2.5 2.5 0 0112.5 12c1.437 0 2.312.681 3.5 2.625C17.187 12.681 18.062 12 19.5 12a2.5 2.5 0 011.785 4.251h-.003z" />
              </svg>
            </div>
          </button>
        </Link>
        {/* Content */}
        <div className="flex grow flex-col p-5">
          <div className="grow">
            <div className="mb-2 text-sm font-semibold text-violet-500 uppercase">Thu 6 Jan, 2024</div>
            <Link className="mb-2 inline-flex" href="/community/meetups/post">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                Founder Worldwide - First Meetup of 2022!
              </h3>
            </Link>
            <div className="text-sm">
              Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for
              previewing layouts.
            </div>
          </div>
          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            {/* Tag */}
            <div className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-1 text-center text-xs font-medium text-gray-600 dark:border-gray-700/60 dark:text-gray-400">
              <svg className="mr-2 h-3 w-4 fill-gray-400 dark:fill-gray-500" viewBox="0 0 16 12">
                <path d="m16 2-4 2.4V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.6l4 2.4V2ZM2 10V2h8v8H2Z" />
              </svg>
              <span>Online Event</span>
            </div>
            {/* Avatars */}
            <div className="flex items-center space-x-2">
              <div className="-ml-0.5 flex -space-x-3">
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage03}
                  width={28}
                  height={28}
                  alt="User 03"
                />
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage05}
                  width={28}
                  height={28}
                  alt="User 05"
                />
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage04}
                  width={28}
                  height={28}
                  alt="User 04"
                />
              </div>
              <div className="text-xs font-medium text-gray-400 italic dark:text-gray-500">+64</div>
            </div>
          </div>
        </div>
      </article>

      {/* Item 7 */}
      <article className="flex overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
        {/* Image */}
        <Link
          className="xl:sidebar-expanded:w-40 2xl:sidebar-expanded:w-[14rem] relative block w-24 shrink-0 sm:w-[14rem]"
          href="/community/meetups/post"
        >
          <Image
            className="absolute h-full w-full object-cover object-center"
            src={MeetupsThumb07}
            width={220}
            height={236}
            alt="Meetup 07"
          />
          {/* Like button */}
          <button className="absolute top-0 right-0 mt-4 mr-4">
            <div className="rounded-full bg-gray-900/60 text-gray-100">
              <span className="sr-only">Like</span>
              <svg className="h-8 w-8 fill-current" viewBox="0 0 32 32">
                <path d="M22.682 11.318A4.485 4.485 0 0019.5 10a4.377 4.377 0 00-3.5 1.707A4.383 4.383 0 0012.5 10a4.5 4.5 0 00-3.182 7.682L16 24l6.682-6.318a4.5 4.5 0 000-6.364zm-1.4 4.933L16 21.247l-5.285-5A2.5 2.5 0 0112.5 12c1.437 0 2.312.681 3.5 2.625C17.187 12.681 18.062 12 19.5 12a2.5 2.5 0 011.785 4.251h-.003z" />
              </svg>
            </div>
          </button>
        </Link>
        {/* Content */}
        <div className="flex grow flex-col p-5">
          <div className="grow">
            <div className="mb-2 text-sm font-semibold text-violet-500 uppercase">Thu 6 Jan, 2024</div>
            <Link className="mb-2 inline-flex" href="/community/meetups/post">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                NYC Blockchain Network - Monthly 3rd Thursday Meetup
              </h3>
            </Link>
            <div className="text-sm">
              Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for
              previewing layouts.
            </div>
          </div>
          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            {/* Tag */}
            <div className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-1 text-center text-xs font-medium text-gray-600 dark:border-gray-700/60 dark:text-gray-400">
              <svg className="mr-2 h-3 w-4 fill-gray-400 dark:fill-gray-500" viewBox="0 0 16 12">
                <path d="m16 2-4 2.4V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.6l4 2.4V2ZM2 10V2h8v8H2Z" />
              </svg>
              <span>Online Event</span>
            </div>
            {/* Avatars */}
            <div className="flex items-center space-x-2">
              <div className="-ml-0.5 flex -space-x-3">
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage02}
                  width={28}
                  height={28}
                  alt="User 02"
                />
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage04}
                  width={28}
                  height={28}
                  alt="User 04"
                />
              </div>
              <div className="text-xs font-medium text-gray-400 italic dark:text-gray-500">+112</div>
            </div>
          </div>
        </div>
      </article>

      {/* Item 8 */}
      <article className="flex overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
        {/* Image */}
        <Link
          className="xl:sidebar-expanded:w-40 2xl:sidebar-expanded:w-[14rem] relative block w-24 shrink-0 sm:w-[14rem]"
          href="/community/meetups/post"
        >
          <Image
            className="absolute h-full w-full object-cover object-center"
            src={MeetupsThumb08}
            width={220}
            height={236}
            alt="Meetup 08"
          />
          {/* Like button */}
          <button className="absolute top-0 right-0 mt-4 mr-4">
            <div className="rounded-full bg-gray-900/60 text-gray-100">
              <span className="sr-only">Like</span>
              <svg className="h-8 w-8 fill-current" viewBox="0 0 32 32">
                <path d="M22.682 11.318A4.485 4.485 0 0019.5 10a4.377 4.377 0 00-3.5 1.707A4.383 4.383 0 0012.5 10a4.5 4.5 0 00-3.182 7.682L16 24l6.682-6.318a4.5 4.5 0 000-6.364zm-1.4 4.933L16 21.247l-5.285-5A2.5 2.5 0 0112.5 12c1.437 0 2.312.681 3.5 2.625C17.187 12.681 18.062 12 19.5 12a2.5 2.5 0 011.785 4.251h-.003z" />
              </svg>
            </div>
          </button>
        </Link>
        {/* Content */}
        <div className="flex grow flex-col p-5">
          <div className="grow">
            <div className="mb-2 text-sm font-semibold text-violet-500 uppercase">Fri 7 Jan, 2024</div>
            <Link className="mb-2 inline-flex" href="/community/meetups/post">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                Build a Personal Brand and Boost Your Career in AI!
              </h3>
            </Link>
            <div className="text-sm">
              Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for
              previewing layouts.
            </div>
          </div>
          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            {/* Tag */}
            <div className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-1 text-center text-xs font-medium text-gray-600 dark:border-gray-700/60 dark:text-gray-400">
              <svg className="mr-2 h-3 w-4 fill-gray-400 dark:fill-gray-500" viewBox="0 0 16 12">
                <path d="m16 2-4 2.4V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.6l4 2.4V2ZM2 10V2h8v8H2Z" />
              </svg>
              <span>Online Event</span>
            </div>
            {/* Avatars */}
            <div className="flex items-center space-x-2">
              <div className="-ml-0.5 flex -space-x-3">
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage01}
                  width={28}
                  height={28}
                  alt="User 01"
                />
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage05}
                  width={28}
                  height={28}
                  alt="User 05"
                />
                <Image
                  className="box-content rounded-full border-2 border-white dark:border-gray-800"
                  src={UserImage06}
                  width={28}
                  height={28}
                  alt="User 06"
                />
              </div>
              <div className="text-xs font-medium text-gray-400 italic dark:text-gray-500">+32</div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
