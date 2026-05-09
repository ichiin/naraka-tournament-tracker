import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import TournamentForm from "@/components/TournamentForm";
import { useCreateTournament } from "@/hooks/useTournament";

export default function CreateTournament() {
  const navigate = useNavigate();
  const createTournament = useCreateTournament();
  const [loadId, setLoadId] = useState("");

  const handleSubmit = async (values: {
    name: string;
    mode: "solo" | "trios";
    num_participants: number;
    num_games: number;
    teamNames?: string[];
  }) => {
    const participantNames =
      values.mode === "trios" && values.teamNames
        ? values.teamNames
        : Array.from(
            { length: values.num_participants },
            (_, i) => `Player ${i + 1}`
          );

    const tournament = await createTournament.mutateAsync({
      name: values.name,
      mode: values.mode,
      num_participants: values.num_participants,
      num_games: values.num_games,
      participantNames,
    });

    toast.success("Tournament created", {
      description: `${values.num_participants} ${values.mode === "solo" ? "players" : "teams"}, ${values.num_games} games`,
    });

    navigate(`/tournament/${tournament.id}`);
  };

  const handleLoad = () => {
    const trimmed = loadId.trim();
    if (!trimmed) return;

    const match = trimmed.match(/tournament\/([a-zA-Z0-9-]+)/);
    const tournamentId = match ? match[1] : trimmed;

    navigate(`/tournament/${tournamentId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-xl mx-auto"
    >
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl font-bold text-ink-DEFAULT mb-3">
          Naraka Tracker
        </h1>
        <p className="font-body text-ink-mist text-lg">
          Track hero picks across games. Solo or trios. No login.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="bg-ink-surface border border-ink-border rounded-lg p-6 mb-6"
      >
        <h2 className="font-display text-sm text-ink-DEFAULT uppercase tracking-wide mb-3">
          Load Tournament
        </h2>
        <div className="flex gap-2">
          <input
            value={loadId}
            onChange={(e) => setLoadId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLoad();
            }}
            placeholder="Paste tournament code or URL"
            className="flex-1 bg-ink-void border border-ink-border text-ink-DEFAULT font-mono text-xs
                       placeholder:text-ink-mist/50 px-3 py-2 focus-visible:outline-2
                       focus-visible:outline-amber h-9"
          />
          <button
            onClick={handleLoad}
            disabled={!loadId.trim()}
            className="flex items-center gap-1.5 bg-amber hover:bg-amber/80 text-primary-foreground
                       font-body text-xs px-4 h-9 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            Load
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-ink-surface border border-ink-border rounded-lg p-8"
      >
        <h2 className="font-display text-sm text-ink-DEFAULT uppercase tracking-wide mb-4">
          New Tournament
        </h2>
        <TournamentForm
          onSubmit={handleSubmit}
          isSubmitting={createTournament.isPending}
        />
      </motion.div>

      <p className="text-center mt-8 font-mono text-xs text-ink-mist tracking-wider">
        27 HEROES &middot; SOLO &amp; TRIOS &middot; NO LOGIN REQUIRED
      </p>
    </motion.div>
  );
}
