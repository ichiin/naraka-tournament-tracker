import { useState } from "react";
import { useParams } from "react-router-dom";
import type { Pick, Participant } from "@/hooks/useTournament";
import { useUpdateParticipant } from "@/hooks/useTournament";
import HeroCard from "@/components/HeroCard";
import HeroPickerModal from "@/components/HeroPickerModal";

interface PickTableProps {
  participants: Participant[];
  picks: Pick[];
  numGames: number;
  mode: "solo" | "trios";
}

export default function PickTable({
  participants,
  picks,
  numGames,
  mode,
}: PickTableProps) {
  const { id } = useParams<{ id: string }>();
  const updateParticipant = useUpdateParticipant();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalParticipant, setModalParticipant] = useState<Participant | null>(null);
  const [modalGameNumber, setModalGameNumber] = useState<number | null>(null);

  if (participants.length === 0) {
    return (
      <p className="font-body text-sm text-ink-mist italic">
        No participants yet.
      </p>
    );
  }

  const maxHeroes = mode === "solo" ? 1 : 3;

  const handleSaveName = () => {
    if (editingId && editValue.trim()) {
      updateParticipant.mutate({ id: editingId, name: editValue.trim() });
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleCellClick = (participant: Participant, gameNumber: number) => {
    setModalParticipant(participant);
    setModalGameNumber(gameNumber);
    setModalOpen(true);
  };

  const modalCurrentPicks =
    modalParticipant && modalGameNumber
      ? picks.filter(
          (p) =>
            p.participant_id === modalParticipant.id &&
            p.game_number === modalGameNumber
        )
      : [];

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 bg-ink-surface z-10 text-left font-display text-xs text-gold tracking-[0.15em] uppercase py-3 pr-4 border-b border-ink-border min-w-[120px]">
              {mode === "solo" ? "Player" : "Team"}
            </th>
            {Array.from({ length: numGames }, (_, i) => (
              <th
                key={i}
                className="text-center font-mono text-xs text-ink-mist py-3 px-2 border-b border-ink-border min-w-[80px]"
              >
                G{i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {participants.map((p, idx) => (
            <tr
              key={p.id}
              className={`transition-colors ${
                idx % 2 === 0 ? "bg-ink-void/30" : "bg-transparent"
              }`}
            >
              <td
                className="sticky left-0 z-10 py-3 pr-4 border-b border-ink-border/50 font-body text-sm text-ink-DEFAULT"
                style={{
                  backgroundColor:
                    idx % 2 === 0 ? "rgb(13,11,15,0.3)" : "transparent",
                }}
              >
                {editingId === p.id ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") {
                        setEditingId(null);
                        setEditValue("");
                      }
                    }}
                    className="bg-ink-void border border-vermillion/50 text-ink-DEFAULT font-body text-sm px-2 py-0.5 w-full max-w-[140px] focus:outline-none"
                  />
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(p.id);
                      setEditValue(p.name);
                    }}
                    className="hover:text-gold transition-colors cursor-text text-left w-full"
                  >
                    {p.name}
                  </button>
                )}
              </td>
              {Array.from({ length: numGames }, (_, gi) => {
                const gameNumber = gi + 1;
                const cellPicks = picks.filter(
                  (pick) =>
                    pick.participant_id === p.id &&
                    pick.game_number === gameNumber
                );

                const hasPicks = cellPicks.length > 0;
                const allFilled = cellPicks.length === maxHeroes;

                return (
                  <td
                    key={gi}
                    className="text-center py-2 px-1 border-b border-ink-border/50"
                  >
                    <button
                      onClick={() => handleCellClick(p, gameNumber)}
                      className="flex flex-wrap items-center justify-center gap-0.5 cursor-pointer
                                 hover:bg-vermillion-wash/10 rounded transition-colors min-h-[36px] min-w-[60px] p-1"
                      title={`Game ${gameNumber} - ${p.name}`}
                    >
                      {hasPicks ? (
                        cellPicks.map((pick) => (
                          <div key={pick.id} className="w-6 h-6 shrink-0">
                            <HeroCard
                              name={pick.hero_name}
                              size="sm"
                            />
                          </div>
                        ))
                      ) : (
                        <span className="font-mono text-[9px] text-ink-mist/40">
                          —
                        </span>
                      )}
                      {hasPicks && !allFilled && (
                        <span className="font-mono text-[9px] text-vermillion/60 ml-0.5">
                          +{maxHeroes - cellPicks.length}
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

      <HeroPickerModal
        key={`${modalParticipant?.id}-${modalGameNumber}`}
        open={modalOpen}
        onOpenChange={setModalOpen}
        participant={modalParticipant}
        gameNumber={modalGameNumber ?? 0}
        tournamentId={id!}
        maxHeroes={maxHeroes}
        currentPicks={modalCurrentPicks}
      />
    </div>
  );
}
