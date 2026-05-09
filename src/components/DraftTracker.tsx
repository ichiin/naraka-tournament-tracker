import React, { useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { BanPickPool, BanPickPick, Participant } from "@/hooks/useTournament";
import {
  useSaveBanPickPick,
  useDeleteBanPickPick,
  useUpdateBanPickPool,
  useClearAllBanPickPicks,
  useSavePicks,
} from "@/hooks/useTournament";
import DraftPoolEditor from "@/components/DraftPoolEditor";
import HeroPickerModal from "@/components/HeroPickerModal";
import HeroCard from "@/components/HeroCard";

const ROUNDS = [1, 2, 3, 4] as const;
const GAMES = [2, 3, 4, 5] as const;
const SLOTS: { value: number; label: string }[] = [
  { value: 1, label: "W" },
  { value: 2, label: "L" },
];

function getPoolNumberForCell(round: number, game: number): number {
  return ((game + round - 3) % 4) + 1;
}

interface DraftTrackerProps {
  pools: BanPickPool[];
  picks: BanPickPick[];
  participants: Participant[];
}

export default function DraftTracker({ pools, picks, participants }: DraftTrackerProps) {
  const { id: tournamentId } = useParams<{ id: string }>();
  const savePick = useSaveBanPickPick();
  const deletePick = useDeleteBanPickPick();
  const updatePool = useUpdateBanPickPool();
  const clearAll = useClearAllBanPickPicks();
  const saveTrackerPick = useSavePicks();

  const strictKey = `draft-strict-${tournamentId}`;
  const [strictMode, setStrictMode] = useState(() => {
    const stored = localStorage.getItem(strictKey);
    return stored !== null ? stored === "true" : false;
  });
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCell, setModalCell] = useState<{
    round: number;
    game: number;
    playerSlot: number;
    poolId: string;
    poolName: string;
    playerName: string;
  } | null>(null);
  const [flashCells, setFlashCells] = useState<Set<string>>(new Set());

  const participantMap = useMemo(() => {
    const map = new Map<string, Participant>();
    for (const p of participants) {
      map.set(p.name, p);
    }
    return map;
  }, [participants]);

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
      const key = `${pick.round_number}-${pick.game_number}-${pick.player_slot}`;
      map.set(key, pick);
    }
    return map;
  }, [picks]);

  const bannedByRound = useMemo(() => {
    const banned = new Map<number, Map<number, Set<string>>>();
    for (const game of GAMES) {
      const byRound = new Map<number, Set<string>>();
      for (let r = 1; r <= 4; r++) {
        const set = new Set<string>();
        for (const pick of picks) {
          if (pick.game_number === game && pick.round_number < r) {
            set.add(pick.hero_name);
          }
        }
        byRound.set(r, set);
      }
      banned.set(game, byRound);
    }
    return banned;
  }, [picks]);

  const bannedWithinRound = useMemo(() => {
    const map = new Map<number, Map<number, Set<string>>>();
    if (!strictMode) return map;
    for (const game of GAMES) {
      const byRound = new Map<number, Set<string>>();
      for (let r = 1; r <= 4; r++) {
        const set = new Set<string>();
        for (const pick of picks) {
          if (pick.game_number === game && pick.round_number === r && pick.player_slot === 1) {
            set.add(pick.hero_name);
          }
        }
        byRound.set(r, set);
      }
      map.set(game, byRound);
    }
    return map;
  }, [picks, strictMode]);

  const usedPlayerNames = useMemo(() => {
    const names = new Set<string>();
    for (const pool of pools) {
      if (pool.win_player_name) names.add(pool.win_player_name);
      if (pool.loss_player_name) names.add(pool.loss_player_name);
    }
    return names;
  }, [pools]);

  const totalFilled = picks.length;
  const totalCells = 32;

  const handleStrictToggle = () => {
    const next = !strictMode;
    setStrictMode(next);
    localStorage.setItem(strictKey, String(next));
  };

  const filteredGames = selectedGame ? GAMES.filter((g) => g === selectedGame) : GAMES;

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

  const handleCellClick = (round: number, game: number, playerSlot: number) => {
    const poolNumber = getPoolNumberForCell(round, game);
    const pool = poolMap.get(poolNumber);
    if (!pool) return;

    const playerName =
      playerSlot === 1
        ? pool.win_player_name || "Win"
        : pool.loss_player_name || "Loss";

    setModalCell({
      round,
      game,
      playerSlot,
      poolId: pool.id,
      poolName: pool.name || `Pool ${poolNumber}`,
      playerName,
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
        playerSlot: modalCell.playerSlot,
        heroName,
      });
    } else {
      await deletePick.mutateAsync({
        tournamentId,
        roundNumber: modalCell.round,
        gameNumber: modalCell.game,
        playerSlot: modalCell.playerSlot,
      });
    }

    const pool = pools.find((p) => p.id === modalCell.poolId);
    const playerName =
      modalCell.playerSlot === 1
        ? pool?.win_player_name
        : pool?.loss_player_name;
    if (playerName) {
      const participant = participantMap.get(playerName);
      if (participant) {
        await saveTrackerPick.mutateAsync({
          tournamentId,
          participantId: participant.id,
          gameNumber: modalCell.game,
          heroes: heroName ? [heroName] : [],
        });
      }
    }

    triggerFlash(`${modalCell.round}-${modalCell.game}-${modalCell.playerSlot}`);
  };

  const handleClearAll = async () => {
    if (!tournamentId) return;
    if (!window.confirm("Clear all 32 draft picks? This cannot be undone.")) return;
    await clearAll.mutateAsync(tournamentId);
    toast.success("All picks cleared");
  };

  const handleCopyAsText = async () => {
    const lines: string[] = ["MSC Challenge Finals — Ban/Pick Draft", ""];

    for (const round of ROUNDS) {
      const pickPool = poolMap.get(round);
      const winName = pickPool?.win_player_name || `Win ${round}`;
      const lossName = pickPool?.loss_player_name || `Loss ${round}`;
      lines.push(`Round ${round} (${winName} ⋆ / ${lossName})`);

      for (const slot of SLOTS) {
        const slotLabel = slot.value === 1 ? "W" : "L";
        const playerName = slot.value === 1 ? winName : lossName;
        const gameLines: string[] = [];
        for (const game of GAMES) {
          const poolNum = getPoolNumberForCell(round, game);
          const cell = pickMap.get(`${round}-${game}-${slot.value}`);
          const heroName = cell?.hero_name || "—";
          gameLines.push(`P${poolNum}=G${game}/${heroName}`);
        }
        lines.push(`  ${slotLabel} (${playerName}): ${gameLines.join(", ")}`);
      }

      lines.push("");
    }

    await navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Draft copied to clipboard");
  };

  const getBannedForCell = (round: number, game: number, playerSlot: number): string[] => {
    const crossRound = bannedByRound.get(game)?.get(round) ?? new Set<string>();
    const withinRound =
      playerSlot === 2
        ? bannedWithinRound.get(game)?.get(round) ?? new Set<string>()
        : new Set<string>();
    return [...new Set([...crossRound, ...withinRound])];
  };

  if (pools.length === 0) {
    return (
      <p className="font-body text-sm text-ink-mist italic">
        No pools configured yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-lg text-ink-DEFAULT uppercase tracking-wide">
            Draft Tracker
          </h2>
          <button
            onClick={handleStrictToggle}
            className={cn(
              "flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 border transition-colors",
              strictMode
                ? "border-vermillion-faded/40 text-vermillion-faded"
                : "border-ink-border text-ink-mist"
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                strictMode ? "bg-vermillion-DEFAULT" : "bg-ink-border"
              )}
            />
            Strict {strictMode ? "ON" : "OFF"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={cn(
              "font-mono text-sm tabular-nums",
              totalFilled === totalCells
                ? "text-jade"
                : totalFilled > 0
                  ? "text-gold"
                  : "text-ink-mist"
            )}
          >
            {totalFilled}/{totalCells} picks
          </span>
          <div className="flex gap-px w-40">
            {Array.from({ length: 32 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 flex-1 transition-colors duration-300",
                  i < totalFilled ? "bg-amber" : "bg-ink-border/20"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-5">
        {[1, 2, 3, 4].map((poolNum) => {
          const pool = poolMap.get(poolNum);
          if (!pool) return null;
          const poolPicks = picks.filter((p) => p.pool_id === pool.id);
          return (
            <DraftPoolEditor
              key={pool.id}
              pool={pool}
              picks={poolPicks}
              participants={participants}
              usedPlayerNames={usedPlayerNames}
              onUpdateName={(name) =>
                updatePool.mutate({
                  id: pool.id,
                  tournamentId: tournamentId!,
                  updates: { name },
                })
              }
              onUpdateWinPlayerName={(win_player_name) =>
                updatePool.mutate({
                  id: pool.id,
                  tournamentId: tournamentId!,
                  updates: { win_player_name },
                })
              }
              onUpdateLossPlayerName={(loss_player_name) =>
                updatePool.mutate({
                  id: pool.id,
                  tournamentId: tournamentId!,
                  updates: { loss_player_name },
                })
              }
            />
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setSelectedGame(null)}
          className={cn(
            "font-mono text-sm px-4 py-2 border transition-colors",
            selectedGame === null
              ? "border-amber/60 text-amber bg-amber-wash/5"
              : "border-ink-border text-ink-mist hover:text-ink-DEFAULT"
          )}
        >
          All
        </button>
        {GAMES.map((game) => (
          <button
            key={game}
            onClick={() => setSelectedGame(game)}
            className={cn(
              "font-mono text-sm px-4 py-2 border transition-colors",
              selectedGame === game
                ? "border-amber/60 text-amber bg-amber-wash/5"
                : "border-ink-border text-ink-mist hover:text-ink-DEFAULT"
            )}
          >
            G{game}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-ink-surface z-10 text-left font-display text-sm text-gold tracking-wide uppercase py-4 pr-5 border-b border-ink-border min-w-[90px]">
                Game
              </th>
              {ROUNDS.map((round) => {
                const pickingPool = poolMap.get(round);
                const winName = pickingPool?.win_player_name;
                const lossName = pickingPool?.loss_player_name;

                return (
                  <th
                    key={round}
                    className="text-center py-3 px-3 border-b border-ink-border min-w-[140px]"
                  >
                    <div className="font-mono text-xs text-ink-mist tracking-[0.15em] uppercase mb-1.5">
                      BP Round {round}
                    </div>
                    <div className="h-[3px] mb-2.5 bg-gradient-to-r from-amber to-gold-light" />
                    <div className="flex items-center justify-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-gold fill-gold" />
                      <span className="font-display text-base text-gold">
                        {winName || `Win ${round}`}
                      </span>
                    </div>
                    <span className="block font-mono text-xs text-ink-mist/70 mt-1">
                      {lossName || `Loss ${round}`}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredGames.map((game, gi) => (
              <React.Fragment key={game}>
                {SLOTS.map((slot, si) => {
                  const isWin = slot.value === 1;
                  return (
                    <tr
                      key={`${game}-${slot.value}`}
                      className={cn(
                        "transition-colors",
                        gi % 2 === 0 ? "bg-ink-void/20" : "bg-transparent"
                      )}
                    >
                      <td
                        className="sticky left-0 z-10 py-3 pr-5 border-b border-ink-border/30"
                        style={{
                          backgroundColor:
                            gi % 2 === 0
                              ? si === 0
                                ? "rgb(18,17,20,0.2)"
                                : "rgb(18,17,20,0.1)"
                              : "transparent",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {si === 0 && (
                            <span className="font-mono text-base text-gold font-semibold">
                              G{game}
                            </span>
                          )}
                          <span
                            className={cn(
                              "font-mono text-[11px] w-5 text-center",
                              isWin
                                ? "text-gold font-semibold"
                                : "text-ink-mist/60"
                            )}
                          >
                            {slot.label}
                          </span>
                        </div>
                      </td>
                      {ROUNDS.map((round) => {
                        const poolNumber = getPoolNumberForCell(round, game);
                        const pool = poolMap.get(poolNumber);
                        const cellKey = `${round}-${game}-${slot.value}`;
                        const cellPick = pickMap.get(cellKey);
                        const isFlashing = flashCells.has(cellKey);
                        const playerName =
                          slot.value === 1
                            ? pool?.win_player_name
                            : pool?.loss_player_name;

                        return (
                          <td
                            key={`${round}-${game}-${slot.value}`}
                            className={cn(
                              "text-center py-2 px-2 border-b border-ink-border/30 transition-colors",
                              isFlashing && "pick-flash"
                            )}
                          >
                            <button
                              onClick={() =>
                                handleCellClick(round, game, slot.value)
                              }
                              aria-label={`Round ${round}, Game ${game}, ${slot.label}${cellPick ? `, hero: ${cellPick.hero_name}` : ", no pick"}`}
                              className={cn(
                                "flex flex-col items-center justify-center gap-1 cursor-pointer",
                                "hover:bg-amber-wash/10 rounded transition-colors min-h-[60px] min-w-[110px] p-2 w-full",
                                isWin &&
                                  "border-l-2 border-amber/30"
                              )}
                            >
                              <span
                                className={cn(
                                  "font-body text-xs truncate max-w-[100px] leading-tight",
                                  isWin
                                    ? "text-gold/80"
                                    : "text-ink-mist/60",
                                  !playerName && "italic text-ink-mist/30"
                                )}
                              >
                                {playerName || "—"}
                              </span>
                              {cellPick ? (
                                <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                                  <HeroCard
                                    name={cellPick.hero_name}
                                    size="sm"
                                  />
                                </div>
                              ) : (
                                <span className="font-mono text-sm text-ink-mist/25">
                                  —
                                </span>
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm text-ink-DEFAULT uppercase tracking-wide">
            Banned Heroes
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleCopyAsText}
              className="font-mono text-xs text-ink-mist hover:text-amber transition-colors"
            >
              Copy as text
            </button>
            <button
              onClick={handleClearAll}
              disabled={totalFilled === 0}
              className="font-mono text-xs text-ink-mist hover:text-vermillion transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Clear all
            </button>
          </div>
        </div>

        {filteredGames.map((game) => {
          const gameBans = bannedByRound.get(game);
          return (
            <div key={game} className="space-y-3">
              <span className="font-mono text-sm text-gold">Game {game}</span>
              {ROUNDS.map((round) => {
                const banned = gameBans?.get(round);
                const prevBanned = gameBans?.get(round - 1);
                const newBanned =
                  round > 1 && banned && prevBanned
                    ? [...banned].filter((h) => !prevBanned.has(h))
                    : [];

                return (
                  <div key={round} className="flex items-start gap-4">
                    <span className="font-mono text-xs text-ink-mist w-16 shrink-0 pt-0.5">
                      Round {round}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {banned && banned.size === 0 ? (
                        <span className="font-mono text-xs text-ink-mist/40 italic">
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
                                "font-mono text-[11px] px-2 py-1 border border-vermillion-faded/30 text-ink-mist",
                                isNew && "animate-slide-up"
                              )}
                            >
                              {hero}
                            </span>
                          );
                        })}
                    </div>
                    {banned && banned.size > 0 && (
                      <span className="font-mono text-[11px] text-ink-mist/50 shrink-0 pt-0.5">
                        ({banned.size})
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {modalCell && (
        <HeroPickerModal
          key={`draft-${modalCell.round}-${modalCell.game}-${modalCell.playerSlot}`}
          open={modalOpen}
          onOpenChange={setModalOpen}
          participant={{
            id: modalCell.poolId,
            tournament_id: tournamentId ?? "",
            name: modalCell.playerName,
            created_at: "",
          }}
          gameNumber={modalCell.game}
          tournamentId={tournamentId ?? ""}
          maxHeroes={1}
          currentPicks={
            pickMap.get(
              `${modalCell.round}-${modalCell.game}-${modalCell.playerSlot}`
            )
              ? [
                  {
                    id: pickMap.get(
                      `${modalCell.round}-${modalCell.game}-${modalCell.playerSlot}`
                    )!.id,
                    tournament_id: tournamentId ?? "",
                    participant_id: modalCell.poolId,
                    game_number: modalCell.game,
                    hero_name: pickMap.get(
                      `${modalCell.round}-${modalCell.game}-${modalCell.playerSlot}`
                    )!.hero_name,
                  },
                ]
              : []
          }
          bannedHeroes={getBannedForCell(modalCell.round, modalCell.game, modalCell.playerSlot)}
          contextLabel={`Round ${modalCell.round}, Game ${modalCell.game}  ·  ${modalCell.playerSlot === 1 ? "Win" : "Loss"}  ·  ${modalCell.poolName}`}
          onSave={handleSavePick}
        />
      )}
    </div>
  );
}
