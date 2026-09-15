import Link from "next/link";

export const metadata = {
  title: "Add User - Mosaic",
  description: "Add a new team member",
};

export default function AddUser() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <div className="mb-6">
        <Link
          className="btn-sm border-gray-200 bg-white px-3 text-gray-600 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
          href="/community/users-list"
        >
          <svg className="mr-2 fill-current text-gray-400 dark:text-gray-500" width="7" height="12" viewBox="0 0 7 12">
            <path d="M5.4 10.6 1.8 7l3.6-3.6L4 2 0 6l4 4z" />
          </svg>
          <span>Back to Members</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Add Member</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Invite a new member to the Acme Inc. workspace.</p>
      </div>

      <form className="rounded-xl bg-white shadow-sm dark:bg-gray-800">
        {/* Avatar row */}
        <div className="flex items-center gap-4 border-b border-gray-100 p-5 dark:border-gray-700/60">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <svg className="fill-current text-gray-400 dark:text-gray-500" width="24" height="24" viewBox="0 0 16 16">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8 9c-2.7 0-8 1.3-8 4v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2c0-2.7-5.3-4-8-4Z" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-sm bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
            >
              Upload photo
            </button>
            <button
              type="button"
              className="btn-sm border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
            >
              Remove
            </button>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="name">
                Full name <span className="text-red-500">*</span>
              </label>
              <input id="name" name="name" className="form-input w-full" type="text" placeholder="Jane Doe" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                className="form-input w-full"
                type="email"
                placeholder="jane@acme.com"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="role">
                Role
              </label>
              <select id="role" name="role" className="form-select w-full" defaultValue="Editor">
                <option>Administrator</option>
                <option>Editor</option>
                <option>Viewer</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="status">
                Status
              </label>
              <select id="status" name="status" className="form-select w-full" defaultValue="Pending">
                <option>Active</option>
                <option>Pending</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              className="form-textarea w-full"
              rows={3}
              placeholder="A short introduction…"
            />
          </div>
          <label className="flex items-center">
            <input type="checkbox" name="notify" className="form-checkbox" defaultChecked />
            <span className="ml-2 text-sm">Send an invitation email</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-gray-700/60">
          <Link
            href="/community/users-list"
            className="btn border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
          >
            Send Invite
          </button>
        </div>
      </form>
    </div>
  );
}
