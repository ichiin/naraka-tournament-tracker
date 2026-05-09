import { Outlet, Link, useLocation } from "react-router-dom";
import { Swords } from "lucide-react";

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen relative">
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      <nav className="border-b border-ink-border/50 bg-ink-void/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 group no-underline"
            aria-label="Home"
          >
            <Swords className="h-5 w-5 text-amber transition-transform group-hover:rotate-12" />
            <span className="font-display text-base font-semibold tracking-tight text-ink-DEFAULT">
              Naraka Tracker
            </span>
          </Link>

          {!isHome && (
            <Link
              to="/"
              className="font-body text-sm text-ink-mist hover:text-amber transition-colors duration-200"
            >
              New Tournament
            </Link>
          )}
        </div>
      </nav>

      <main id="main-content" className="max-w-7xl mx-auto px-6 py-10">
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
