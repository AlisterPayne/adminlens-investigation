export default function MessagesFooter() {
  return (
    <div className="sticky bottom-0">
      <div className="flex h-16 items-center justify-between border-t border-gray-200 bg-white px-4 sm:px-6 md:px-5 dark:border-gray-700/60 dark:bg-gray-900">
        {/* Plus button */}
        <button className="mr-3 shrink-0 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
          <span className="sr-only">Add</span>
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12C23.98 5.38 18.62.02 12 0zm6 13h-5v5h-2v-5H6v-2h5V6h2v5h5v2z" />
          </svg>
        </button>
        {/* Message input */}
        <form className="flex grow">
          <div className="mr-3 grow">
            <label htmlFor="message-input" className="sr-only">
              Type a message
            </label>
            <input
              id="message-input"
              className="form-input w-full border-transparent bg-gray-100 placeholder-gray-500 focus:bg-white dark:border-transparent dark:bg-gray-800 dark:focus:bg-gray-800"
              type="text"
              placeholder="Aa"
            />
          </div>
          <button
            type="submit"
            className="btn bg-gray-900 whitespace-nowrap text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
          >
            Send -&gt;
          </button>
        </form>
      </div>
    </div>
  );
}
