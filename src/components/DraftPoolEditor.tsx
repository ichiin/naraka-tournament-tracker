import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BanPickPool, BanPickPick } from "@/hooks/useTournament";

interface DraftPoolEditorProps {
  pool: BanPickPool;
  picks: BanPickPick[];
  onUpdateName: (name: string) => void;
  onUpdatePlayerName: (playerName: string) => void;
  onToggleWonDuel: () => void;
}

export default function DraftPoolEditor({
  pool,
  picks,
  onUpdateName,
  onUpdatePlayerName,
  onToggleWonDuel,
}: DraftPoolEditorProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(pool.name);
  const [editingPlayer, setEditingPlayer] = useState(false);
  const [playerValue, setPlayerValue] = useState(pool.player_name);

  const poolPicks = picks.filter((p) => p.pool_id === pool.id);
  const filledCount = poolPicks.filter((p) => p.hero_name).length;

  const handleSaveName = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== pool.name) {
      onUpdateName(trimmed);
    }
    setEditingName(false);
  };

  const handleSavePlayer = () => {
    const trimmed = playerValue.trim();
    if (trimmed !== pool.player_name) {
      onUpdatePlayerName(trimmed);
    }
    setEditingPlayer(false);
  };

  return (
    <div
      className={cn(
        "flex-1 min-w-[180px] bg-ink-surface border-ink-border",
        "pool-card-hover",
        "p-4",
        pool.won_duel
          ? "border-t-2 border-t-amber rounded-b-md border-x border-b border-x-ink-border border-b-ink-border"
          : "border border-ink-border rounded-md"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        {editingName ? (
          <input
            autoFocus
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveName();
              if (e.key === "Escape") {
                setNameValue(pool.name);
                setEditingName(false);
              }
            }}
            className="bg-ink-void border border-amber/50 text-ink-DEFAULT font-display text-sm px-2 py-0.5 w-28 focus-visible:outline-2 focus-visible:outline-amber"
          />
        ) : (
          <button
            onClick={() => {
              setNameValue(pool.name);
              setEditingName(true);
            }}
            className="font-display text-sm text-ink-DEFAULT hover:text-amber transition-colors cursor-text text-left"
          >
            {pool.name || `Pool ${pool.pool_number}`}
          </button>
        )}

        <button
          onClick={onToggleWonDuel}
          aria-label={pool.won_duel ? "Mark as loss" : "Mark as win"}
          className={cn(
            "transition-all duration-200",
            pool.won_duel
              ? "text-gold drop-shadow-[0_0_6px_rgba(240,192,96,0.5)] hover:text-gold-light"
              : "text-ink-mist/30 hover:text-ink-mist/60"
          )}
        >
          <Star
            className="h-4 w-4"
            fill={pool.won_duel ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="mb-3">
        {editingPlayer ? (
          <input
            autoFocus
            value={playerValue}
            onChange={(e) => setPlayerValue(e.target.value)}
            onBlur={handleSavePlayer}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSavePlayer();
              if (e.key === "Escape") {
                setPlayerValue(pool.player_name);
                setEditingPlayer(false);
              }
            }}
            placeholder="Player name"
            className="bg-ink-void border border-amber/50 text-ink-DEFAULT font-body text-sm px-2 py-0.5 w-full focus-visible:outline-2 focus-visible:outline-amber"
          />
        ) : (
          <button
            onClick={() => {
              setPlayerValue(pool.player_name);
              setEditingPlayer(true);
            }}
            className={cn(
              "font-body text-sm cursor-text text-left w-full transition-colors",
              pool.player_name
                ? "text-ink-DEFAULT hover:text-amber"
                : "text-ink-mist/50 italic hover:text-ink-mist"
            )}
          >
            {pool.player_name || "Player name"}
          </button>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 transition-colors duration-300",
                i < filledCount ? "bg-amber" : "bg-ink-border/50"
              )}
            />
          ))}
        </div>
        <span className="font-mono text-[9px] text-ink-mist">
          {filledCount}/4 picks
        </span>
      </div>
    </div>
  );
}
