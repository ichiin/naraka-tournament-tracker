import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

const BASENAME = import.meta.env.BASE_URL;
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/Layout";
import CreateTournament from "@/pages/CreateTournament";
import TournamentView from "@/pages/TournamentView";
import TournamentSetup from "@/pages/TournamentSetup";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function TitleManager() {
  useEffect(() => {
    const updateTitle = () => {
      const path = window.location.pathname.replace(BASENAME, "");
      if (path === "/" || path === "") {
        document.title = "Naraka Tournament Tracker";
      } else if (path.startsWith("/tournament/")) {
        document.title = "Tournament — Naraka Tournament Tracker";
      }
    };
    updateTitle();
    window.addEventListener("popstate", updateTitle);
    return () => window.removeEventListener("popstate", updateTitle);
  }, []);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={BASENAME}>
        <TitleManager />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<CreateTournament />} />
            <Route path="/tournament/:id" element={<TournamentView />} />
            <Route
              path="/tournament/:id/setup"
              element={<TournamentSetup />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: "font-body bg-ink-surface border border-ink-border text-ink-DEFAULT",
        }}
      />
    </QueryClientProvider>
  );
}
