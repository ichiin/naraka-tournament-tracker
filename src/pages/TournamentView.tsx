import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Share2, Settings } from "lucide-react";
import { toast } from "sonner";
import { useTournament, useParticipants, usePicks } from "@/hooks/useTournament";
import { HEROES } from "@/lib/heroes";
import PickTable from "@/components/PickTable";
import PickRateSummary from "@/components/PickRateSummary";
import { Button } from "@/components/ui/button";

export default function TournamentView() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;

  const { data: tournament, isLoading: tLoading } = useTournament(id);
  const { data: participants } = useParticipants(id);
  const { data: picks } = usePicks(id);

  if (tLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-display text-lg text-gold animate-pulse tracking-widest">
          Loading...
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-20">
        <h1 className="font-display text-3xl text-ink-DEFAULT mb-4">
          Tournament Not Found
        </h1>
        <Link
          to="/"
          className="font-body text-gold hover:text-gold-light transition-colors"
        >
          Create a new tournament
        </Link>
      </div>
    );
  }

  const pickCounts: Record<string, number> = {};
  HEROES.forEach((h) => (pickCounts[h] = 0));
  picks?.forEach((p) => {
    pickCounts[p.hero_name] = (pickCounts[p.hero_name] || 0) + 1;
  });

  const totalPicks = picks?.length || 0;

  const handleShare = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied", {
      description: "Share this URL to show the tournament",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-3xl font-bold text-ink-DEFAULT tracking-[0.1em]">
              {tournament.name}
            </h1>
            <span
              className={`font-mono text-[10px] px-2 py-0.5 border uppercase tracking-wider $
                {tournament.mode === "solo"
                  ? "border-jade text-jade"
                  : "border-vermillion text-vermillion"
                }`}
            >
              {tournament.mode}
            </span>
          </div>
          <p className="font-body text-ink-mist text-sm">
            {tournament.num_participants}{" "}
            {tournament.mode === "solo" ? "players" : "teams"} &middot;{" "}
            {tournament.num_games} games &middot;{" "}
            {totalPicks} picks recorded
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="border-ink-border text-ink-mist hover:text-vermillion hover:border-vermillion/40
                       font-body text-xs gap-2"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
          <Link to={`/tournament/${id}/setup`}>
            <Button
              variant="outline"
              size="sm"
              className="border-ink-border text-ink-mist hover:text-gold hover:border-gold/40
                         font-body text-xs gap-2"
            >
              <Settings className="h-3.5 w-3.5" />
              Setup
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm text-ink-DEFAULT tracking-[0.15em] uppercase">
              Pick Table
            </h2>
            <div className="flex gap-1">
              {Array.from({ length: tournament.num_games }, (_, i) => (
                <Link
                  key={i}
                  to={`/tournament/${id}/game/${i + 1}`}
                  className="font-mono text-[10px] px-2 py-1 border border-ink-border text-ink-mist
                             hover:border-vermillion/50 hover:text-vermillion transition-colors"
                >
                  G{i + 1}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-ink-surface border border-ink-border rounded-lg p-4">
            <PickTable
              participants={participants || []}
              picks={picks || []}
              numGames={tournament.num_games}
              mode={tournament.mode}
            />
          </div>
        </div>

        <div className="bg-ink-surface border border-ink-border rounded-lg p-5">
          <PickRateSummary pickCounts={pickCounts} totalPicks={totalPicks} />
        </div>
      </div>
    </motion.div>
  );
}
