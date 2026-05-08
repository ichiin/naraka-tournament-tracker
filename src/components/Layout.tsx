import { Outlet, Link, useLocation } from "react-router-dom";
import { Swords } from "lucide-react";

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen ink-texture ink-wash-bg relative">
      <nav className="border-b border-ink-border/50 bg-ink-void/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 group no-underline"
          >
            <Swords className="h-5 w-5 text-vermillion transition-transform group-hover:rotate-12" />
            <span className="font-display text-sm font-semibold tracking-[0.2em] text-ink-DEFAULT uppercase">
              Tournament Scrolls
            </span>
          </Link>

          {!isHome && (
            <Link
              to="/"
              className="font-body text-sm text-ink-mist hover:text-vermillion transition-colors duration-200"
            >
              New Tournament
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-ink-border/30 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="font-mono text-xs text-ink-mist tracking-wider">
            NARAKA BLADEPOINT TOURNAMENT TRACKER
          </p>
        </div>
      </footer>
    </div>
  );
}
