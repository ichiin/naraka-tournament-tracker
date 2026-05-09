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
}

export default function HeroPickerModal({
  open,
  onOpenChange,
  participant,
  gameNumber,
  tournamentId,
  maxHeroes,
  currentPicks,
}: HeroPickerModalProps) {
  const [selected, setSelected] = useState<string[]>(
    () => currentPicks.map((p) => p.hero_name)
  );  const savePicks = useSavePicks();

  const handleToggle = (hero: string) => {
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

    await savePicks.mutateAsync({
      tournamentId,
      participantId: participant.id,
      gameNumber,
      heroes: selected,
    });

    toast.success("Picks saved", {
      description: `${participant.name}: ${selected.join(", ") || "none"}`,
    });
    onOpenChange(false);
  };

  if (!participant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {participant.name}, Game {gameNumber}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
