import Link from "next/link";

export default function Logo() {
  return (
    <Link className="flex items-center gap-2.5" href="/dashboard">
      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
        AL
      </div>
      <span className="lg:sidebar-expanded:block text-lg font-bold text-gray-900 lg:hidden 2xl:block tracking-tight">
        Admin Lens
      </span>
    </Link>
  );
}
