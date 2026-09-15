"use client";

import Image from "next/image";
import { useState } from "react";

import ModalAction from "@/components/modal-action";
import ModalBasic from "@/components/modal-basic";
import ModalBlank from "@/components/modal-blank";
import SearchModal from "@/components/search-modal";
import AnnouncementIcon from "@/public/images/announcement-icon.svg";
import ModalImage from "@/public/images/modal-image.jpg";

export default function ProductExamples() {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);
  const [newsletterModalOpen, setNewsletterModalOpen] = useState<boolean>(false);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState<boolean>(false);
  const [integrationModalOpen, setIntegrationModalOpen] = useState<boolean>(false);
  const [newsModalOpen, setNewsModalOpen] = useState<boolean>(false);
  const [planModalOpen, setPlanModalOpen] = useState<boolean>(false);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Product</h2>
      <div className="-m-1.5 flex flex-wrap items-center">
        {/* Send Feedback */}
        <div className="m-1.5">
          {/* Start */}
          <button
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
            aria-controls="feedback-modal"
            onClick={() => {
              setFeedbackModalOpen(true);
            }}
          >
            Send Feedback
          </button>
          <ModalBasic isOpen={feedbackModalOpen} setIsOpen={setFeedbackModalOpen} title="Send Feedback">
            {/* Modal content */}
            <div className="px-5 py-4">
              <div className="text-sm">
                <div className="mb-3 font-medium text-gray-800 dark:text-gray-100">Let us know what you think 🙌</div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input id="name" className="form-input w-full px-2 py-1" type="text" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input id="email" className="form-input w-full px-2 py-1" type="email" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="feedback">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea id="feedback" className="form-textarea w-full px-2 py-1" rows={4} required></textarea>
                </div>
              </div>
            </div>
            {/* Modal footer */}
            <div className="border-t border-gray-200 px-5 py-4 dark:border-gray-700/60">
              <div className="flex flex-wrap justify-end space-x-2">
                <button
                  className="btn-sm border-gray-200 text-gray-800 hover:border-gray-300 dark:border-gray-700/60 dark:text-gray-300 dark:hover:border-gray-600"
                  onClick={() => {
                    setFeedbackModalOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button className="btn-sm bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                  Send
                </button>
              </div>
            </div>
          </ModalBasic>
          {/* End */}
        </div>

        {/* Newsletter */}
        <div className="m-1.5">
          {/* Start */}
          <button
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
            aria-controls="newsletter-modal"
            onClick={() => {
              setNewsletterModalOpen(true);
            }}
          >
            Newsletter
          </button>
          <ModalAction isOpen={newsletterModalOpen} setIsOpen={setNewsletterModalOpen}>
            {/* Modal header */}
            <div className="mb-2 text-center">
              {/* Icon */}
              <div className="mb-3">
                <svg className="inline-flex h-12 w-12 shrink-0 rounded-full fill-current" viewBox="0 0 48 48">
                  <rect className="text-gray-100 dark:text-gray-700" width="48" height="48" rx="24" />
                  <path className="text-violet-300" d="M19 16h7a8 8 0 110 16h-7V16z" />
                  <path className="text-violet-500" d="M26 24l-7-6v5h-8v2h8v5z" />
                </svg>
              </div>
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">Subscribe to the Newsletter!</div>
            </div>
            {/* Modal content */}
            <div className="text-center">
              <div className="mb-6 text-sm">
                Semper eget duis at tellus at urna condimentum mattis pellentesque lacus suspendisse faucibus interdum.
              </div>
              {/* Submit form */}
              <form className="m-auto flex max-w-sm">
                <div className="mr-2 grow">
                  <label htmlFor="subscribe-form" className="sr-only">
                    Leave your Email
                  </label>
                  <input id="subscribe-form" className="form-input w-full px-2 py-1" type="email" />
                </div>
                <button
                  type="submit"
                  className="btn-sm bg-gray-900 whitespace-nowrap text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
                >
                  Subscribe
                </button>
              </form>
              <div className="mt-3 text-xs text-gray-500 italic">
                I respect your privacy. No spam. Unsubscribe at any time!
              </div>
            </div>
          </ModalAction>
          {/* End */}
        </div>

        {/* Announcement */}
        <div className="m-1.5">
          {/* Start */}
          <button
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
            aria-controls="announcement-modal"
            onClick={() => {
              setAnnouncementModalOpen(true);
            }}
          >
            Announcement
          </button>
          <ModalAction isOpen={announcementModalOpen} setIsOpen={setAnnouncementModalOpen}>
            {/* Modal header */}
            <div className="mb-2 text-center">
              {/* Icon */}
              <div className="mb-2 inline-flex rounded-full bg-linear-to-b from-gray-100 to-gray-200 dark:from-gray-700/30 dark:to-gray-700">
                <Image src={AnnouncementIcon} width={80} height={80} alt="Announcement" />
              </div>
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">You Unlocked Level 2!</div>
            </div>
            {/* Modal content */}
            <div className="text-center">
              <div className="mb-5 text-sm">
                Semper eget duis at tellus at urna condimentum mattis pellentesque lacus suspendisse faucibus interdum.
              </div>
              {/* CTAs */}
              <div className="space-y-3">
                <button className="btn-sm bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                  Claim your Reward -&gt;
                </button>
                <div>
                  <a
                    className="text-sm font-medium text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    href="#0"
                    onClick={(e) => {
                      e.preventDefault();
                      setAnnouncementModalOpen(true);
                    }}
                  >
                    Not Now!
                  </a>
                </div>
              </div>
            </div>
          </ModalAction>
          {/* End */}
        </div>

        {/* Integration */}
        <div className="m-1.5">
          {/* Start */}
          <button
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
            aria-controls="integration-modal"
            onClick={() => {
              setIntegrationModalOpen(true);
            }}
          >
            Integration
          </button>
          <ModalAction isOpen={integrationModalOpen} setIsOpen={setIntegrationModalOpen}>
            {/* Modal header */}
            <div className="mb-5 text-center">
              {/* Icons */}
              <div className="mb-4 inline-flex items-center justify-center space-x-3">
                {/* Mosaic logo */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                  <svg
                    className="h-5 w-5 fill-violet-500"
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                  >
                    <path d="M31.956 14.8C31.372 6.92 25.08.628 17.2.044V5.76a9.04 9.04 0 0 0 9.04 9.04h5.716ZM14.8 26.24v5.716C6.92 31.372.63 25.08.044 17.2H5.76a9.04 9.04 0 0 1 9.04 9.04Zm11.44-9.04h5.716c-.584 7.88-6.876 14.172-14.756 14.756V26.24a9.04 9.04 0 0 1 9.04-9.04ZM.044 14.8C.63 6.92 6.92.628 14.8.044V5.76a9.04 9.04 0 0 1-9.04 9.04H.044Z" />
                  </svg>
                </div>
                {/* Arrows */}
                <svg className="fill-current text-gray-400" width="16" height="16" viewBox="0 0 16 16">
                  <path d="M5 3V0L0 4l5 4V5h8a1 1 0 000-2H5zM11 11H3a1 1 0 000 2h8v3l5-4-5-4v3z" />
                </svg>
                {/* Cruip logo */}
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <rect className="fill-gray-100 dark:fill-violet-500/30" width="48" height="48" rx="24" />
                  <path
                    d="M34 24c0-1.38-1.126-2.5-2.515-2.5A2.507 2.507 0 0028.97 24c0 1.38 1.126 2.5 2.515 2.5A2.507 2.507 0 0034 24"
                    fill="#4BD37D"
                  />
                  <path
                    d="M31.112 31.07a10.024 10.024 0 01-4.582 2.615c-.8.205-1.64.315-2.506.315a10.007 10.007 0 01-7.553-3.426A9.943 9.943 0 0114 24c0-2.517.932-4.816 2.471-6.574A10.007 10.007 0 0124.024 14a10.024 10.024 0 017.088 2.93l-3.544 3.535A5.003 5.003 0 0024.024 19a5.006 5.006 0 00-5.012 5l.001.13A5.007 5.007 0 0024.024 29c1.384 0 2.637-.56 3.544-1.465l3.544 3.536z"
                    fill="#8470FF"
                  />
                </svg>
              </div>
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Connect Mosaic with your Cruip account
              </div>
            </div>
            {/* Modal content */}
            <div className="mb-5 text-sm">
              <div className="mb-3 font-medium text-gray-800 dark:text-gray-100">Mosaic would like to:</div>
              <ul className="mb-5 space-y-2">
                <li className="flex items-center">
                  <svg className="mr-2 h-3 w-3 shrink-0 fill-current text-green-500" viewBox="0 0 12 12">
                    <path d="M10.28 1.28L3.989 7.575 1.695 5.28A1 1 0 00.28 6.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 1.28z" />
                  </svg>
                  <div>Lorem ipsum dolor sit amet</div>
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-3 w-3 shrink-0 fill-current text-green-500" viewBox="0 0 12 12">
                    <path d="M10.28 1.28L3.989 7.575 1.695 5.28A1 1 0 00.28 6.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 1.28z" />
                  </svg>
                  <div>Semper eget duis at tellus at urna</div>
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-3 w-3 shrink-0 fill-current text-green-500" viewBox="0 0 12 12">
                    <path d="M10.28 1.28L3.989 7.575 1.695 5.28A1 1 0 00.28 6.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 1.28z" />
                  </svg>
                  <div>Lorem ipsum dolor sit amet</div>
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-3 w-3 shrink-0 fill-current text-green-500" viewBox="0 0 12 12">
                    <path d="M10.28 1.28L3.989 7.575 1.695 5.28A1 1 0 00.28 6.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 1.28z" />
                  </svg>
                  <div>Suspendisse faucibus interdum</div>
                </li>
              </ul>
              <div className="text-xs text-gray-500">
                By clicking on Allow access, you authorize Mosaic to use your information in accordance with its{" "}
                <a className="text-violet-500 hover:text-violet-600 dark:hover:text-violet-400" href="#0">
                  Privacy Policy
                </a>
                . You can stop it at any time on the integrations page of your Mosaic account.
              </div>
            </div>
            {/* Modal footer */}
            <div className="flex flex-wrap justify-end space-x-2">
              <button
                className="btn-sm border-gray-200 text-gray-800 hover:border-gray-300 dark:border-gray-700/60 dark:text-gray-300 dark:hover:border-gray-600"
                onClick={() => {
                  setIntegrationModalOpen(false);
                }}
              >
                Cancel
              </button>
              <button className="btn-sm bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                Allow Access
              </button>
            </div>
          </ModalAction>
          {/* End */}
        </div>

        {/* What's New */}
        <div className="m-1.5">
          {/* Start */}
          <button
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
            aria-controls="news-modal"
            onClick={() => {
              setNewsModalOpen(true);
            }}
          >
            What's New
          </button>
          <ModalBlank isOpen={newsModalOpen} setIsOpen={setNewsModalOpen}>
            <div className="relative">
              <Image className="w-full" src={ModalImage} width={460} height="200" alt="New on Mosaic" />
              {/* Close button */}
              <button
                className="absolute top-0 right-0 mt-5 mr-5 text-gray-50 hover:text-white"
                onClick={() => {
                  setNewsModalOpen(false);
                }}
              >
                <div className="sr-only">Close</div>
                <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16">
                  <path d="M7.95 6.536l4.242-4.243a1 1 0 111.415 1.414L9.364 7.95l4.243 4.242a1 1 0 11-1.415 1.415L7.95 9.364l-4.243 4.243a1 1 0 01-1.414-1.415L6.536 7.95 2.293 3.707a1 1 0 011.414-1.414L7.95 6.536z" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              {/* Modal header */}
              <div className="mb-2">
                <div className="mb-3">
                  <div className="btn-xs rounded-full border-gray-200 px-2.5 py-1 text-xs text-gray-800 shadow-none hover:border-gray-300 dark:border-gray-700/60 dark:text-gray-300 dark:hover:border-gray-600">
                    New on Mosaic
                  </div>
                </div>
                <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Help your team work faster with X 🏃‍♂️
                </div>
              </div>
              {/* Modal content */}
              <div className="mb-5 text-sm">
                <div className="space-y-2">
                  <p>
                    You might not be aware of this fact, but every frame, digital video, canvas, responsive design, and
                    image often has a rectangular shape that is exceptionally precise in proportion (or ratio).
                  </p>
                  <p>
                    The ratio has to be well-defined to make shapes fit into different and distinct mediums, such as
                    computer, movies, television and camera screens.
                  </p>
                </div>
              </div>
              {/* Modal footer */}
              <div className="flex flex-wrap justify-end space-x-2">
                <button
                  className="btn-sm bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
                  onClick={() => {
                    setNewsModalOpen(false);
                  }}
                >
                  Cool, I Got it
                </button>
              </div>
            </div>
          </ModalBlank>
          {/* End */}
        </div>

        {/* Change your Plan */}
        <div className="m-1.5">
          {/* Start */}
          <button
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
            aria-controls="feedback-modal"
            onClick={() => {
              setPlanModalOpen(true);
            }}
          >
            Change your Plan
          </button>
          <ModalBasic isOpen={planModalOpen} setIsOpen={setPlanModalOpen} title="Change your Plan">
            {/* Modal content */}
            <div className="px-5 pt-4 pb-1">
              <div className="text-sm">
                <div className="mb-4">Upgrade or downgrade your plan:</div>
                {/* Options */}
                <ul className="mb-4 space-y-2">
                  <li>
                    <button className="h-full w-full rounded-lg border-2 border-violet-400 bg-white px-4 py-3 text-left shadow-sm transition dark:border-violet-500 dark:bg-gray-800">
                      <div className="flex items-center">
                        <div className="mr-3 h-4 w-4 rounded-full border-4 border-violet-500 bg-white"></div>
                        <div className="grow">
                          <div className="mb-0.5 flex flex-wrap items-center justify-between">
                            <span className="font-medium text-gray-800 dark:text-gray-100">
                              Mosaic Light <span className="align-top text-xs text-gray-500 italic">Current Plan</span>
                            </span>
                            <span className="text-gray-600">
                              <span className="font-medium text-green-600">$39.00</span>/mo
                            </span>
                          </div>
                          <div className="text-sm">2 MB · 1 member · 500 block limits</div>
                        </div>
                      </div>
                    </button>
                  </li>
                  <li>
                    <button className="h-full w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-gray-600">
                      <div className="flex items-center">
                        <div className="mr-3 h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                        <div className="grow">
                          <div className="mb-0.5 flex flex-wrap items-center justify-between">
                            <span className="font-semibold text-gray-800 dark:text-gray-100">
                              Mosaic Basic <span className="align-top text-xs text-violet-500 italic">Best Value</span>
                            </span>
                            <span className="text-gray-600">
                              <span className="font-medium text-green-600">$59.00</span>/mo
                            </span>
                          </div>
                          <div className="text-sm">5 MB · 2 members · 1000 block limits</div>
                        </div>
                      </div>
                    </button>
                  </li>
                  <li>
                    <button className="h-full w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-gray-600">
                      <div className="flex items-center">
                        <div className="mr-3 h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                        <div className="grow">
                          <div className="mb-0.5 flex flex-wrap items-center justify-between">
                            <span className="font-semibold text-gray-800 dark:text-gray-100">Mosaic Plus</span>
                            <span className="text-gray-600">
                              <span className="font-medium text-green-600">$79.00</span>/mo
                            </span>
                          </div>
                          <div className="text-sm">10 MB · 5 members · Unlimited block limits</div>
                        </div>
                      </div>
                    </button>
                  </li>
                </ul>
                <div className="text-xs text-gray-500">
                  Your workspace's Mosaic Light Plan is set to $39 per month and will renew on August 9, 2024.
                </div>
              </div>
            </div>
            {/* Modal footer */}
            <div className="px-5 py-4">
              <div className="flex flex-wrap justify-end space-x-2">
                <button
                  className="btn-sm border-gray-200 text-gray-800 hover:border-gray-300 dark:border-gray-700/60 dark:text-gray-300 dark:hover:border-gray-600"
                  onClick={() => {
                    setPlanModalOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button className="btn-sm bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                  Change Plan
                </button>
              </div>
            </div>
          </ModalBasic>
          {/* End */}
        </div>

        {/* Quick Find */}
        <div className="m-1.5">
          {/* Start */}
          <button
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
            aria-controls="quick-find-modal"
            onClick={(e) => {
              e.stopPropagation();
              setSearchModalOpen(true);
            }}
          >
            Quick Find
          </button>
          <SearchModal isOpen={searchModalOpen} setIsOpen={setSearchModalOpen} />
          {/* End */}
        </div>
      </div>
    </div>
  );
}
