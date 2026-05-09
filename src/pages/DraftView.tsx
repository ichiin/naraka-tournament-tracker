import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  useTournament,
  useBanPickPools,
  useBanPickPicks,
  useInitializeBanPickPools,
} from "@/hooks/useTournament";
import DraftTracker from "@/components/DraftTracker";

export default function DraftView() {
  const { id } = useParams<{ id: string }>();
  const { data: tournament, isLoading: tLoading } = useTournament(id ?? "");
  const { data: pools, isLoading: pLoading } = useBanPickPools(id ?? "");
  const { data: picks } = useBanPickPicks(id ?? "");
  const initPools = useInitializeBanPickPools();

  useEffect(() => {
    if (pools && pools.length === 0 && !pLoading && id) {
      initPools.mutate(id);
    }
  }, [pools?.length, pLoading, id]);

  const loading = tLoading || pLoading;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-48 bg-ink-border/30 animate-pulse" />
        </div>
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-1 h-32 bg-ink-surface border border-ink-border rounded-md animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 bg-ink-surface border border-ink-border rounded-md animate-pulse" />
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
          </div>
          <p className="font-body text-ink-mist text-sm">
            MSC Challenge Finals &middot; Ban/Pick Draft
          </p>
        </div>

        <Link to={`/tournament/${id}`}>
          <span className="font-body text-sm text-ink-mist hover:text-amber transition-colors duration-200">
            Back to pick table
          </span>
        </Link>
      </div>

      <div className="bg-ink-surface border border-ink-border rounded-lg p-6">
        <DraftTracker
          pools={pools || []}
          picks={picks || []}
        />
      </div>
    </motion.div>
  );
}
