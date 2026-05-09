import { useState, useMemo } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BanPickPool, BanPickPick } from "@/hooks/useTournament";
import type { Participant } from "@/hooks/useTournament";

interface DraftPoolEditorProps {
  pool: BanPickPool;
  picks: BanPickPick[];
  participants: Participant[];
  usedPlayerNames: Set<string>;
  onUpdateName: (name: string) => void;
  onUpdateWinPlayerName: (name: string) => void;
  onUpdateLossPlayerName: (name: string) => void;
}

export default function DraftPoolEditor({
  pool,
  picks,
  participants,
  usedPlayerNames,
  onUpdateName,
  onUpdateWinPlayerName,
  onUpdateLossPlayerName,
}: DraftPoolEditorProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(pool.name);

  const poolPicks = picks.filter((p) => p.pool_id === pool.id);
  const filledCount = poolPicks.length;
  const totalSlots = 8;

  const availablePlayers = useMemo(() => {
    return participants.map((p) => ({
      value: p.name,
      label: p.name,
      disabled:
        usedPlayerNames.has(p.name) &&
        p.name !== pool.win_player_name &&
        p.name !== pool.loss_player_name,
    }));
  }, [participants, usedPlayerNames, pool.win_player_name, pool.loss_player_name]);

  const handleSaveName = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== pool.name) {
      onUpdateName(trimmed);
    }
    setEditingName(false);
  };

  return (
    <div
      className={cn(
        "flex-1 min-w-[200px] bg-ink-surface",
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
          <Select
            value={pool.win_player_name || undefined}
            onValueChange={(value) => {
              if (value !== pool.win_player_name) {
                onUpdateWinPlayerName(value);
              }
            }}
          >
            <SelectTrigger
              className={cn(
                "h-8 bg-ink-void border-ink-border text-xs font-body",
                pool.win_player_name ? "text-gold" : "text-ink-mist/50"
              )}
            >
              <SelectValue placeholder="Win player" />
            </SelectTrigger>
            <SelectContent className="bg-ink-surface border-ink-border max-h-48">
              {availablePlayers.map((player) => (
                <SelectItem
                  key={player.value}
                  value={player.value}
                  disabled={player.disabled}
                  className="font-body text-xs text-ink-DEFAULT data-[disabled]:opacity-30 data-[disabled]:cursor-not-allowed focus:bg-amber-wash/10 focus:text-amber"
                >
                  {player.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1.5">
          <Star className="h-3 w-3 text-ink-mist/20 shrink-0" />
          <Select
            value={pool.loss_player_name || undefined}
            onValueChange={(value) => {
              if (value !== pool.loss_player_name) {
                onUpdateLossPlayerName(value);
              }
            }}
          >
            <SelectTrigger
              className={cn(
                "h-8 bg-ink-void border-ink-border text-xs font-body",
                pool.loss_player_name ? "text-ink-DEFAULT" : "text-ink-mist/50"
              )}
            >
              <SelectValue placeholder="Loss player" />
            </SelectTrigger>
            <SelectContent className="bg-ink-surface border-ink-border max-h-48">
              {availablePlayers.map((player) => (
                <SelectItem
                  key={player.value}
                  value={player.value}
                  disabled={player.disabled}
                  className="font-body text-xs text-ink-DEFAULT data-[disabled]:opacity-30 data-[disabled]:cursor-not-allowed focus:bg-amber-wash/10 focus:text-amber"
                >
                  {player.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
