export default function FeedbackPanel() {
  return (
    <div className="grow">
      {/* Panel body */}
      <div className="space-y-6 p-6">
        <div>
          <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-100">Give Feedback</h2>
          <div className="text-sm">Our product depends on customer feedback to improve the overall experience!</div>
        </div>

        {/* Rate */}
        <section>
          <h3 className="mb-6 text-xl leading-snug font-bold text-gray-800 dark:text-gray-100">
            How likely would you recommend us to a friend or colleague?
          </h3>
          <div className="w-full max-w-xl">
            <div className="relative">
              <div
                className="absolute top-1/2 left-0 -mt-px h-0.5 w-full bg-gray-200 dark:bg-gray-700/60"
                aria-hidden="true"
              ></div>
              <ul className="relative flex w-full justify-between">
                <li className="flex">
                  <button className="h-3 w-3 rounded-full border-2 border-gray-400 bg-white dark:border-gray-500 dark:bg-gray-800">
                    <span className="sr-only">1</span>
                  </button>
                </li>
                <li className="flex">
                  <button className="h-3 w-3 rounded-full border-2 border-gray-400 bg-white dark:border-gray-500 dark:bg-gray-800">
                    <span className="sr-only">2</span>
                  </button>
                </li>
                <li className="flex">
                  <button className="h-3 w-3 rounded-full border-2 border-violet-500 bg-violet-500">
                    <span className="sr-only">3</span>
                  </button>
                </li>
                <li className="flex">
                  <button className="h-3 w-3 rounded-full border-2 border-gray-400 bg-white dark:border-gray-500 dark:bg-gray-800">
                    <span className="sr-only">4</span>
                  </button>
                </li>
                <li className="flex">
                  <button className="h-3 w-3 rounded-full border-2 border-gray-400 bg-white dark:border-gray-500 dark:bg-gray-800">
                    <span className="sr-only">5</span>
                  </button>
                </li>
              </ul>
            </div>
            <div className="mt-3 flex w-full justify-between text-sm text-gray-500 italic dark:text-gray-400">
              <div>Not at all</div>
              <div>Extremely likely</div>
            </div>
          </div>
        </section>

        {/* Tell us in words */}
        <section>
          <h3 className="mb-5 text-xl leading-snug font-bold text-gray-800 dark:text-gray-100">Tell us in words</h3>
          {/* Form */}
          <label className="sr-only" htmlFor="feedback">
            Leave a feedback
          </label>
          <textarea
            id="feedback"
            className="form-textarea w-full focus:border-gray-300"
            rows={4}
            placeholder="I really enjoy…"
          ></textarea>
        </section>
      </div>

      {/* Panel footer */}
      <footer>
        <div className="flex flex-col border-t border-gray-200 px-6 py-5 dark:border-gray-700/60">
          <div className="flex self-end">
            <button className="btn border-gray-200 text-gray-800 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600">
              Cancel
            </button>
            <button className="btn ml-3 bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
              Save Changes
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
