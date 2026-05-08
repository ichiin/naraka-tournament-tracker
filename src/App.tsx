import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/Layout";
import CreateTournament from "@/pages/CreateTournament";
import TournamentView from "@/pages/TournamentView";
import GamePicker from "@/pages/GamePicker";
import TournamentSetup from "@/pages/TournamentSetup";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<CreateTournament />} />
            <Route path="/tournament/:id" element={<TournamentView />} />
            <Route
              path="/tournament/:id/setup"
              element={<TournamentSetup />}
            />
            <Route
              path="/tournament/:id/game/:gameNumber"
              element={<GamePicker />}
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
