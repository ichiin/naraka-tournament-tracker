import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Share2, Settings, Swords, Table2 } from "lucide-react";
import { toast } from "sonner";
import {
  useTournament,
  useParticipants,
  usePicks,
  useBanPickPools,
  useBanPickPicks,
  useInitializeBanPickPools,
} from "@/hooks/useTournament";
import PickTable from "@/components/PickTable";
import DraftTracker from "@/components/DraftTracker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function TournamentView() {
  const { id } = useParams<{ id: string }>();

  const { data: tournament, isLoading: tLoading } = useTournament(id ?? "");
  const { data: participants } = useParticipants(id ?? "");
  const { data: picks } = usePicks(id ?? "");
  const { data: pools, isLoading: pLoading } = useBanPickPools(id ?? "");
  const { data: draftPicks } = useBanPickPicks(id ?? "");
  const initPools = useInitializeBanPickPools();

  const [showPicks, setShowPicks] = useState(true);
  const [showDraft, setShowDraft] = useState(true);

  useEffect(() => {
    if (pools && pools.length === 0 && !pLoading && id) {
      initPools.mutate(id);
    }
  }, [pools?.length, pLoading, id]);

  if (tLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-display text-lg text-gold animate-pulse tracking-wide">
          Loading...
        </div>
      </div>
    );
  }

  if (!id || !tournament) {
    return (
      <div className="text-center py-20">
        <h1 className="font-display text-3xl text-ink-DEFAULT mb-4">
          Tournament Not Found
        </h1>
        <Link
          to="/"
          className="font-body text-amber hover:text-gold-light transition-colors"
        >
          Create a new tournament
        </Link>
      </div>
    );
  }

  const totalPicks = picks?.length || 0;

  const handleShare = async () => {
    await navigator.clipboard.writeText(id);
    toast.success("Tournament code copied", {
      description: "Share this code. Load it from the home page to view.",
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
            <h1 className="font-display text-3xl font-bold text-ink-DEFAULT">
              {tournament.name}
            </h1>
            <span
              className={`font-mono text-[10px] px-2 py-0.5 border uppercase tracking-wider ${
                tournament.mode === "solo"
                  ? "border-jade text-jade"
                  : "border-amber text-amber"
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
            onClick={() => setShowPicks(!showPicks)}
            className={cn(
              "font-body text-xs gap-2",
              showPicks
                ? "border-amber/30 text-amber hover:border-amber hover:bg-amber-wash/10"
                : "border-ink-border text-ink-mist hover:text-amber hover:border-amber/40"
            )}
          >
            <Table2 className="h-3.5 w-3.5" />
            Picks
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDraft(!showDraft)}
            className={cn(
              "font-body text-xs gap-2",
              showDraft
                ? "border-amber/30 text-amber hover:border-amber hover:bg-amber-wash/10"
                : "border-ink-border text-ink-mist hover:text-amber hover:border-amber/40"
            )}
          >
            <Swords className="h-3.5 w-3.5" />
            Draft
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="border-ink-border text-ink-mist hover:text-amber hover:border-amber/40
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

      {showPicks && (
        <div className="space-y-4">
          <h2 className="font-display text-sm text-ink-DEFAULT uppercase tracking-wide">
            Pick Table
          </h2>

          <div className="bg-ink-surface border border-ink-border rounded-lg p-4">
            <PickTable
              participants={participants || []}
              picks={picks || []}
              numGames={tournament.num_games}
              mode={tournament.mode}
            />
          </div>
        </div>
      )}

      {showDraft && (
        <div className="space-y-4">
          <div className="bg-ink-surface border border-ink-border rounded-lg p-6">
            <DraftTracker
              pools={pools || []}
              picks={draftPicks || []}
              participants={participants || []}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
