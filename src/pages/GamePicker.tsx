import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import {
  useTournament,
  useParticipants,
  usePicks,
  useSavePicks,
} from "@/hooks/useTournament";
import HeroGrid from "@/components/HeroGrid";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GamePicker() {
  const { id, gameNumber } = useParams<{
    id: string;
    gameNumber: string;
  }>();
  if (!id || !gameNumber) return null;

  const gameNum = parseInt(gameNumber, 10);
  const navigate = useNavigate();

  const { data: tournament, isLoading: tLoading } = useTournament(id);
  const { data: participants } = useParticipants(id);
  const { data: allPicks } = usePicks(id);
  const savePicks = useSavePicks();

  const [activeParticipantId, setActiveParticipantId] = useState<string>("");
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>([]);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  const maxHeroes = tournament?.mode === "solo" ? 1 : 3;

  const gamePicks = useMemo(
    () => allPicks?.filter((p) => p.game_number === gameNum) || [],
    [allPicks, gameNum]
  );

  const getSavedHeroes = useCallback(
    (participantId: string) =>
      gamePicks
        .filter((p) => p.participant_id === participantId)
        .map((p) => p.hero_name),
    [gamePicks]
  );

  useEffect(() => {
    if (participants && participants.length > 0 && !activeParticipantId) {
      setActiveParticipantId(participants[0].id);
    }
  }, [participants, activeParticipantId]);

  useEffect(() => {
    if (activeParticipantId) {
      setSelectedHeroes(getSavedHeroes(activeParticipantId));
    }
  }, [activeParticipantId, getSavedHeroes]);

  const handleToggleHero = (hero: string) => {
    setSelectedHeroes((prev) => {
      if (prev.includes(hero)) {
        return prev.filter((h) => h !== hero);
      }
      if (prev.length >= maxHeroes) {
        return prev;
      }
      return [...prev, hero];
    });
  };

  const handleSave = async () => {
    if (!activeParticipantId) return;

    const currentSaved = getSavedHeroes(activeParticipantId);
    const currentSorted = [...selectedHeroes].sort();
    const savedSorted = [...currentSaved].sort();

    if (
      currentSorted.length === savedSorted.length &&
      currentSorted.every((h, i) => h === savedSorted[i])
    ) {
      return;
    }

    await savePicks.mutateAsync({
      tournamentId: id,
      participantId: activeParticipantId,
      gameNumber: gameNum,
      heroes: selectedHeroes,
    });

    toast.success("Picks saved", {
      description: `${
        participants?.find((p) => p.id === activeParticipantId)?.name
      }: ${selectedHeroes.join(", ") || "none"}`,
    });
    setHasUnsaved(false);
  };

  const handleParticipantChange = async (participantId: string) => {
    if (hasUnsaved && activeParticipantId) {
      await handleSave();
    }
    setActiveParticipantId(participantId);
  };

  const goToGame = (n: number) => {
    if (hasUnsaved && activeParticipantId) {
      handleSave().then(() => {
        navigate(`/tournament/${id}/game/${n}`);
      });
    } else {
      navigate(`/tournament/${id}/game/${n}`);
    }
  };

  if (tLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-display text-lg text-gold animate-pulse tracking-widest">
          Loading...
        </div>
      </div>
    );
  }

  if (!tournament) return null;

  const activeParticipant = participants?.find(
    (p) => p.id === activeParticipantId
  );

  const allParticipantsFilled = participants?.every((p) => {
    const pPicks = getSavedHeroes(p.id);
    return pPicks.length === maxHeroes;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={`/tournament/${id}`}
            className="font-body text-sm text-ink-mist hover:text-gold transition-colors"
          >
            &larr; {tournament.name}
          </Link>
          <h1 className="font-display text-2xl font-bold text-ink-DEFAULT tracking-[0.1em] mt-1">
            Game {gameNum}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={savePicks.isPending}
            className="border-vermillion/40 text-vermillion hover:bg-vermillion/10 font-body text-xs gap-2"
          >
            <Check className="h-3.5 w-3.5" />
            {savePicks.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-body text-xs text-ink-mist tracking-wide uppercase">
          {tournament.mode === "solo" ? "Player" : "Team"}
        </label>
        <Select
          value={activeParticipantId}
          onValueChange={handleParticipantChange}
        >
          <SelectTrigger className="w-full bg-ink-void border-ink-border text-ink-DEFAULT font-body h-11
                                     focus:ring-vermillion/50">
            <SelectValue placeholder="Select participant" />
          </SelectTrigger>
          <SelectContent className="bg-ink-surface border-ink-border text-ink-DEFAULT font-body">
            {participants?.map((p) => {
              const pPicks = getSavedHeroes(p.id);
              const filled = pPicks.length === maxHeroes;
              return (
                <SelectItem key={p.id} value={p.id}>
                  <span className="flex items-center gap-2">
                    {p.name}
                    {filled && (
                      <span className="font-mono text-[10px] text-jade">
                        &#10003;
                      </span>
                    )}
                    {pPicks.length > 0 && !filled && (
                      <span className="font-mono text-[10px] text-vermillion/70">
                        {pPicks.length}/{maxHeroes}
                      </span>
                    )}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {activeParticipant && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-ink-DEFAULT">
              {activeParticipant.name}
            </span>
            <span
              className={`font-mono text-xs ${
                selectedHeroes.length === maxHeroes
                  ? "text-jade"
                  : selectedHeroes.length > 0
                    ? "text-gold"
                    : "text-ink-mist"
              }`}
            >
              {selectedHeroes.length}/{maxHeroes} selected
            </span>
          </div>

          <div className="min-h-[8px] bg-ink-void overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-vermillion to-gold transition-all duration-300"
              style={{
                width: `${(selectedHeroes.length / maxHeroes) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="bg-ink-surface border border-ink-border rounded-lg p-5">
        <HeroGrid
          selected={selectedHeroes}
          onToggle={handleToggleHero}
          maxSelections={maxHeroes}
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-ink-border">
        <Button
          variant="ghost"
          size="sm"
          disabled={gameNum <= 1}
          onClick={() => goToGame(gameNum - 1)}
          className="text-ink-mist hover:text-vermillion font-body text-xs gap-2 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous Game
        </Button>

        <div className="flex gap-1">
          {Array.from({ length: tournament.num_games }, (_, i) => (
            <button
              key={i}
              onClick={() => goToGame(i + 1)}
              className={`w-8 h-8 font-mono text-xs border transition-colors
                ${gameNum === i + 1
                  ? "border-vermillion bg-vermillion/10 text-vermillion"
                  : "border-ink-border text-ink-mist hover:border-ink-mist/50"
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          disabled={gameNum >= tournament.num_games}
          onClick={() => goToGame(gameNum + 1)}
          className="text-ink-mist hover:text-vermillion font-body text-xs gap-2 disabled:opacity-30"
        >
          Next Game
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {allParticipantsFilled && (
        <div className="text-center">
          <Link
            to={`/tournament/${id}`}
            className="font-body text-sm text-jade hover:text-jade/80 transition-colors"
          >
            All picks complete &mdash; view tournament &rarr;
          </Link>
        </div>
      )}
    </motion.div>
  );
}
