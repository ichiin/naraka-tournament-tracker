import { useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import HeroGrid from "@/components/HeroGrid";
import { Button } from "@/components/ui/button";
import { useSavePicks } from "@/hooks/useTournament";
import type { Participant, Pick } from "@/hooks/useTournament";

interface HeroPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: Participant | null;
  gameNumber: number;
  tournamentId: string;
  maxHeroes: number;
  currentPicks: Pick[];
  bannedHeroes?: string[];
  contextLabel?: string;
  onSave?: (heroes: string[]) => Promise<void>;
}

export default function HeroPickerModal({
  open,
  onOpenChange,
  participant,
  gameNumber,
  tournamentId,
  maxHeroes,
  currentPicks,
  bannedHeroes,
  contextLabel,
  onSave,
}: HeroPickerModalProps) {
  const [selected, setSelected] = useState<string[]>(
    () => currentPicks.map((p) => p.hero_name)
  );  const savePicks = useSavePicks();

  const bannedSet = new Set(bannedHeroes ?? []);

  const handleToggle = (hero: string) => {
    if (bannedSet.has(hero)) return;
    setSelected((prev) => {
      if (prev.includes(hero)) return prev.filter((h) => h !== hero);
      if (prev.length >= maxHeroes) return prev;
      return [...prev, hero];
    });
  };

  const handleSave = async () => {
    if (!participant) return;

    const currentSaved = currentPicks.map((p) => p.hero_name);
    const currentSorted = [...selected].sort();
    const savedSorted = [...currentSaved].sort();

    if (
      currentSorted.length === savedSorted.length &&
      currentSorted.every((h, i) => h === savedSorted[i])
    ) {
      onOpenChange(false);
      return;
    }

    if (onSave) {
      await onSave(selected);
    } else {
      await savePicks.mutateAsync({
        tournamentId,
        participantId: participant.id,
        gameNumber,
        heroes: selected,
      });
    }

    toast.success("Picks saved", {
      description: selected.length > 0
        ? `${participant.name}: ${selected.join(", ")}`
        : `${participant.name} cleared picks`,
    });
    onOpenChange(false);
  };

  if (!participant) return null;

  const bannedCount = bannedHeroes?.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-base">
            {participant.name}
            {contextLabel && (
              <span className="block font-mono text-[10px] text-ink-mist font-normal mt-0.5">
                {contextLabel}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {bannedCount > 0 && (
            <div className="flex items-center gap-2 bg-vermillion-wash border border-vermillion-faded/20 rounded px-3 py-1.5">
              <span className="font-mono text-[10px] text-vermillion-faded">
                {bannedCount} hero{bannedCount !== 1 ? "es" : ""} banned this round
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span
              className={`font-mono text-xs ${
                selected.length === maxHeroes
                  ? "text-jade"
                  : selected.length > 0
                    ? "text-gold"
                    : "text-ink-mist"
              }`}
            >
              {selected.length}/{maxHeroes} selected
            </span>
          </div>
          <HeroGrid
            selected={selected}
            onToggle={handleToggle}
            maxSelections={maxHeroes}
            disabledHeroes={bannedSet}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={savePicks.isPending}
              className="bg-amber hover:bg-amber/80 text-primary-foreground font-body text-xs gap-2"
            >
              <Check className="h-3.5 w-3.5" />
              {savePicks.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
