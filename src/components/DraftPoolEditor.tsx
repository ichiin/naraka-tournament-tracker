import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BanPickPool, BanPickPick } from "@/hooks/useTournament";

interface DraftPoolEditorProps {
  pool: BanPickPool;
  picks: BanPickPick[];
  onUpdateName: (name: string) => void;
  onUpdateWinPlayerName: (name: string) => void;
  onUpdateLossPlayerName: (name: string) => void;
}

export default function DraftPoolEditor({
  pool,
  picks,
  onUpdateName,
  onUpdateWinPlayerName,
  onUpdateLossPlayerName,
}: DraftPoolEditorProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(pool.name);
  const [editingWin, setEditingWin] = useState(false);
  const [winValue, setWinValue] = useState(pool.win_player_name);
  const [editingLoss, setEditingLoss] = useState(false);
  const [lossValue, setLossValue] = useState(pool.loss_player_name);

  const poolPicks = picks.filter((p) => p.pool_id === pool.id);
  const filledCount = poolPicks.length;
  const totalSlots = 8;

  const handleSaveName = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== pool.name) {
      onUpdateName(trimmed);
    }
    setEditingName(false);
  };

  const handleSaveWin = () => {
    const trimmed = winValue.trim();
    if (trimmed !== pool.win_player_name) {
      onUpdateWinPlayerName(trimmed);
    }
    setEditingWin(false);
  };

  const handleSaveLoss = () => {
    const trimmed = lossValue.trim();
    if (trimmed !== pool.loss_player_name) {
      onUpdateLossPlayerName(trimmed);
    }
    setEditingLoss(false);
  };

  return (
    <div
      className={cn(
        "flex-1 min-w-[180px] bg-ink-surface",
        "pool-card-hover",
        "p-4 border border-ink-border rounded-md"
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
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-1.5">
          <Star className="h-3 w-3 text-gold fill-gold shrink-0" />
          {editingWin ? (
            <input
              autoFocus
              value={winValue}
              onChange={(e) => setWinValue(e.target.value)}
              onBlur={handleSaveWin}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveWin();
                if (e.key === "Escape") {
                  setWinValue(pool.win_player_name);
                  setEditingWin(false);
                }
              }}
              placeholder="Win player"
              className="bg-ink-void border border-amber/50 text-gold font-body text-sm px-2 py-0.5 w-full focus-visible:outline-2 focus-visible:outline-amber"
            />
          ) : (
            <button
              onClick={() => {
                setWinValue(pool.win_player_name);
                setEditingWin(true);
              }}
              className={cn(
                "font-body text-sm cursor-text text-left w-full transition-colors",
                pool.win_player_name
                  ? "text-gold hover:text-gold-light"
                  : "text-ink-mist/50 italic hover:text-ink-mist"
              )}
            >
              {pool.win_player_name || "Win player"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Star className="h-3 w-3 text-ink-mist/20 shrink-0" />
          {editingLoss ? (
            <input
              autoFocus
              value={lossValue}
              onChange={(e) => setLossValue(e.target.value)}
              onBlur={handleSaveLoss}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveLoss();
                if (e.key === "Escape") {
                  setLossValue(pool.loss_player_name);
                  setEditingLoss(false);
                }
              }}
              placeholder="Loss player"
              className="bg-ink-void border border-amber/50 text-ink-DEFAULT font-body text-sm px-2 py-0.5 w-full focus-visible:outline-2 focus-visible:outline-amber"
            />
          ) : (
            <button
              onClick={() => {
                setLossValue(pool.loss_player_name);
                setEditingLoss(true);
              }}
              className={cn(
                "font-body text-sm cursor-text text-left w-full transition-colors",
                pool.loss_player_name
                  ? "text-ink-DEFAULT hover:text-amber"
                  : "text-ink-mist/50 italic hover:text-ink-mist"
              )}
            >
              {pool.loss_player_name || "Loss player"}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
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
          {filledCount}/{totalSlots} picks
        </span>
      </div>
    </div>
  );
}
