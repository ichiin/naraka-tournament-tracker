import { useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { BanPickPool, BanPickPick } from "@/hooks/useTournament";
import {
  useSaveBanPickPick,
  useDeleteBanPickPick,
  useUpdateBanPickPool,
  useClearAllBanPickPicks,
} from "@/hooks/useTournament";
import DraftPoolEditor from "@/components/DraftPoolEditor";
import HeroPickerModal from "@/components/HeroPickerModal";
import HeroCard from "@/components/HeroCard";

const ROUNDS = [1, 2, 3, 4] as const;
const GAMES = [2, 3, 4, 5] as const;

function getPoolNumberForCell(round: number, game: number): number {
  return ((game + round - 3) % 4) + 1;
}

interface DraftTrackerProps {
  pools: BanPickPool[];
  picks: BanPickPick[];
}

export default function DraftTracker({ pools, picks }: DraftTrackerProps) {
  const { id: tournamentId } = useParams<{ id: string }>();
  const savePick = useSaveBanPickPick();
  const deletePick = useDeleteBanPickPick();
  const updatePool = useUpdateBanPickPool();
  const clearAll = useClearAllBanPickPicks();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCell, setModalCell] = useState<{
    round: number;
    game: number;
    poolId: string;
    poolName: string;
  } | null>(null);
  const [flashCells, setFlashCells] = useState<Set<string>>(new Set());

  const poolMap = useMemo(() => {
    const map = new Map<number, BanPickPool>();
    for (const pool of pools) {
      map.set(pool.pool_number, pool);
    }
    return map;
  }, [pools]);

  const pickMap = useMemo(() => {
    const map = new Map<string, BanPickPick>();
    for (const pick of picks) {
      const key = `${pick.round_number}-${pick.game_number}`;
      map.set(key, pick);
    }
    return map;
  }, [picks]);

  const bannedByRound = useMemo(() => {
    const banned = new Map<number, Set<string>>();
    for (let r = 1; r <= 4; r++) {
      const set = new Set<string>();
      for (const pick of picks) {
        if (pick.round_number < r) {
          set.add(pick.hero_name);
        }
      }
      banned.set(r, set);
    }
    return banned;
  }, [picks]);

  const totalFilled = picks.filter((p) => p.hero_name).length;
  const totalCells = 16;

  const triggerFlash = useCallback((key: string) => {
    setFlashCells((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    setTimeout(() => {
      setFlashCells((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }, 400);
  }, []);

  const handleCellClick = (round: number, game: number) => {
    const poolNumber = getPoolNumberForCell(round, game);
    const pool = poolMap.get(poolNumber);
    if (!pool) return;

    setModalCell({
      round,
      game,
      poolId: pool.id,
      poolName: pool.name || `Pool ${poolNumber}`,
    });
    setModalOpen(true);
  };

  const handleSavePick = async (heroes: string[]) => {
    if (!modalCell || !tournamentId) return;

    const heroName = heroes[0] || "";
    if (heroName) {
      await savePick.mutateAsync({
        tournamentId,
        roundNumber: modalCell.round,
        gameNumber: modalCell.game,
        poolId: modalCell.poolId,
        heroName,
      });
    } else {
      await deletePick.mutateAsync({
        tournamentId,
        roundNumber: modalCell.round,
        gameNumber: modalCell.game,
      });
    }

    triggerFlash(`${modalCell.round}-${modalCell.game}`);
  };

  const handleClearAll = async () => {
    if (!tournamentId) return;
    if (!window.confirm("Clear all 16 draft picks? This cannot be undone.")) return;
    await clearAll.mutateAsync(tournamentId);
    toast.success("All picks cleared");
  };

  const handleCopyAsText = async () => {
    const lines: string[] = ["MSC Challenge Finals — Ban/Pick Draft", ""];

    for (const round of ROUNDS) {
      const pool = poolMap.get(round);
      const playerLabel = pool
        ? `${pool.player_name || `Player ${round}`}${pool.won_duel ? " (Win)" : " (Loss)"}`
        : `Player ${round}`;

      const gameLines: string[] = [];
      for (const game of GAMES) {
        const poolNum = getPoolNumberForCell(round, game);
        const cell = pickMap.get(`${round}-${game}`);
        const heroName = cell?.hero_name || "—";
        gameLines.push(`P${poolNum}=G${game}/${heroName}`);
      }

      lines.push(`Round ${round} (${playerLabel}): ${gameLines.join(", ")}`);
    }

    await navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Draft copied to clipboard");
  };

  if (pools.length === 0) {
    return (
      <p className="font-body text-sm text-ink-mist italic">
        No pools configured yet.
      </p>
    );
  }

  const getPoolPicksForPool = (poolId: string) =>
    picks.filter((p) => p.pool_id === poolId);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-sm text-ink-DEFAULT uppercase tracking-wide">
            Draft Tracker
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-mono text-xs tabular-nums",
              totalFilled === totalCells ? "text-jade" : totalFilled > 0 ? "text-gold" : "text-ink-mist"
            )}
          >
            {totalFilled}/{totalCells} picks
          </span>
          <div className="flex gap-0.5 w-24">
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 transition-colors duration-300",
                  i < totalFilled ? "bg-amber" : "bg-ink-border/30"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {[1, 2, 3, 4].map((poolNum) => {
          const pool = poolMap.get(poolNum);
          if (!pool) return null;
          return (
            <DraftPoolEditor
              key={pool.id}
              pool={pool}
              picks={getPoolPicksForPool(pool.id)}
              onUpdateName={(name) =>
                updatePool.mutate({ id: pool.id, tournamentId: tournamentId!, updates: { name } })
              }
              onUpdatePlayerName={(playerName) =>
                updatePool.mutate({
                  id: pool.id,
                  tournamentId: tournamentId!,
                  updates: { player_name: playerName },
                })
              }
              onToggleWonDuel={() =>
                updatePool.mutate({
                  id: pool.id,
                  tournamentId: tournamentId!,
                  updates: { won_duel: !pool.won_duel },
                })
              }
            />
          );
        })}
      </div>

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-ink-surface z-10 text-left font-display text-xs text-gold tracking-wide uppercase py-3 pr-4 border-b border-ink-border min-w-[80px]">
                Game
              </th>
              {ROUNDS.map((round) => (
                <th
                  key={round}
                  className="text-center py-2 px-2 border-b border-ink-border min-w-[120px]"
                >
                  <div className="font-mono text-[10px] text-ink-mist tracking-[0.15em] uppercase mb-1">
                    BP Round {round}
                  </div>
                  <div
                    className={cn(
                      "h-0.5 mb-2",
                      poolMap.get(round)?.won_duel
                        ? "bg-gradient-to-r from-amber to-gold-light"
                        : "bg-ink-border"
                    )}
                  />
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="font-display text-sm text-ink-DEFAULT">
                      {poolMap.get(round)?.player_name || `Player ${round}`}
                    </span>
                    {poolMap.get(round)?.won_duel && (
                      <Star
                        className="h-3 w-3 text-gold fill-gold"
                      />
                    )}
                  </div>
                  <span className="block font-mono text-[9px] text-ink-mist/70 mt-0.5">
                    {poolMap.get(round)?.won_duel ? "Win" : "Loss"}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GAMES.map((game, gi) => (
              <tr
                key={game}
                className={cn(
                  "transition-colors",
                  gi % 2 === 0 ? "bg-ink-void/30" : "bg-transparent"
                )}
              >
                <td
                  className="sticky left-0 z-10 py-3 pr-4 border-b border-ink-border/50 font-mono text-sm text-gold font-semibold"
                  style={{
                    backgroundColor:
                      gi % 2 === 0 ? "rgb(18,17,20,0.3)" : "transparent",
                  }}
                >
                  G{game}
                </td>
                {ROUNDS.map((round) => {
                  const poolNumber = getPoolNumberForCell(round, game);
                  const cellKey = `${round}-${game}`;
                  const cellPick = pickMap.get(cellKey);
                  const isFlashing = flashCells.has(cellKey);

                  return (
                    <td
                      key={`${round}-${game}`}
                      className={cn(
                        "text-center py-2 px-1 border-b border-ink-border/50 transition-colors",
                        isFlashing && "pick-flash"
                      )}
                    >
                      <button
                        onClick={() => handleCellClick(round, game)}
                        aria-label={`Round ${round}, Game ${game}, Pool ${poolNumber}${cellPick ? `, hero: ${cellPick.hero_name}` : ", no pick"}`}
                        className="flex flex-col items-center justify-center gap-1 cursor-pointer
                                   hover:bg-amber-wash/10 rounded transition-colors min-h-[60px] min-w-[80px] p-1.5 w-full"
                      >
                        <span className="font-mono text-[9px] text-ink-mist/50">
                          pool {poolNumber}
                        </span>
                        {cellPick ? (
                          <div className="w-10 h-10 shrink-0">
                            <HeroCard
                              name={cellPick.hero_name}
                              size="sm"
                            />
                          </div>
                        ) : (
                          <span className="font-mono text-sm text-ink-mist/30">
                            —
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xs text-ink-DEFAULT uppercase tracking-wide">
            Banned Heroes
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleCopyAsText}
              className="font-mono text-[10px] text-ink-mist hover:text-amber transition-colors"
            >
              Copy as text
            </button>
            <button
              onClick={handleClearAll}
              disabled={totalFilled === 0}
              className="font-mono text-[10px] text-ink-mist hover:text-vermillion transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Clear all
            </button>
          </div>
        </div>

        {ROUNDS.map((round) => {
          const banned = bannedByRound.get(round);
          const prevBanned = bannedByRound.get(round - 1);
          const newBanned =
            round > 1 && banned && prevBanned
              ? [...banned].filter((h) => !prevBanned.has(h))
              : [];

          return (
            <div key={round} className="flex items-start gap-3">
              <span className="font-mono text-[10px] text-ink-mist w-16 shrink-0 pt-0.5">
                Round {round}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {banned && banned.size === 0 ? (
                  <span className="font-mono text-[10px] text-ink-mist/40 italic">
                    —
                  </span>
                ) : null}
                {banned &&
                  [...banned].map((hero) => {
                    const isNew = round > 1 && newBanned.includes(hero);
                    return (
                      <span
                        key={hero}
                        className={cn(
                          "font-mono text-[9px] px-1.5 py-0.5 border border-vermillion-faded/30 text-ink-mist",
                          isNew && "animate-slide-up"
                        )}
                      >
                        {hero}
                      </span>
                    );
                  })}
              </div>
              {banned && banned.size > 0 && (
                <span className="font-mono text-[9px] text-ink-mist/50 shrink-0 pt-0.5">
                  ({banned.size})
                </span>
              )}
            </div>
          );
        })}
      </div>

      {modalCell && (
        <HeroPickerModal
          key={`draft-${modalCell.round}-${modalCell.game}`}
          open={modalOpen}
          onOpenChange={setModalOpen}
          participant={{
            id: modalCell.poolId,
            tournament_id: tournamentId ?? "",
            name: modalCell.poolName,
            created_at: "",
          }}
          gameNumber={modalCell.game}
          tournamentId={tournamentId ?? ""}
          maxHeroes={1}
          currentPicks={
            pickMap.get(`${modalCell.round}-${modalCell.game}`)
              ? [
                  {
                    id: pickMap.get(`${modalCell.round}-${modalCell.game}`)!.id,
                    tournament_id: tournamentId ?? "",
                    participant_id: modalCell.poolId,
                    game_number: modalCell.game,
                    hero_name: pickMap.get(`${modalCell.round}-${modalCell.game}`)!.hero_name,
                  },
                ]
              : []
          }
          bannedHeroes={[...(bannedByRound.get(modalCell.round) ?? new Set())]}
          contextLabel={`Round ${modalCell.round}, Game ${modalCell.game}  ·  ${modalCell.poolName}`}
          onSave={handleSavePick}
        />
      )}
    </div>
  );
}
