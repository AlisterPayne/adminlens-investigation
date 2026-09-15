import { useFlyoutContext } from "@/app/flyout-context";

export default function Channels() {
  const { setFlyoutOpen } = useFlyoutContext();

  return (
    <div className="mt-4">
      <div className="mb-3 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500">Channels</div>
      <ul className="mb-6">
        <li className="-mx-2">
          <button
            className="flex w-full items-center justify-between rounded-sm p-2"
            onClick={() => setFlyoutOpen(false)}
          >
            <div className="flex items-center">
              <div className="truncate">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">#New Leads</span>
              </div>
            </div>
            <div className="ml-2 flex items-center">
              <div className="h-2 w-2 rounded-full bg-violet-400"></div>
            </div>
          </button>
        </li>
        <li className="-mx-2">
          <button
            className="flex w-full items-center justify-between rounded-sm p-2"
            onClick={() => setFlyoutOpen(false)}
          >
            <div className="flex items-center truncate">
              <div className="truncate">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">#Development Team</span>
              </div>
            </div>
          </button>
        </li>
        <li className="-mx-2">
          <button
            className="flex w-full items-center justify-between rounded-sm p-2"
            onClick={() => setFlyoutOpen(false)}
          >
            <div className="flex items-center truncate">
              <div className="truncate">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">#Product Tips</span>
              </div>
            </div>
          </button>
        </li>
      </ul>
    </div>
  );
}
