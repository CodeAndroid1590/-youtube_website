import Link from "next/link";
import { logoutAction } from "../../actions/auth";

export default function AdminHeader() {
  return (
    <header className="border-b border-slate-800 bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            AI
          </div>
          <span className="text-sm font-semibold text-white">AIWiredOfficial Admin</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/" target="_blank" className="text-xs text-slate-400 hover:text-white transition-colors">
            View Site &rarr;
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="text-xs text-slate-400 hover:text-rose-400 transition-colors">
              Log Out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
