import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import TournamentForm from "@/components/TournamentForm";
import { useCreateTournament } from "@/hooks/useTournament";

export default function CreateTournament() {
  const navigate = useNavigate();
  const createTournament = useCreateTournament();

  const handleSubmit = async (values: {
    name: string;
    mode: "solo" | "trios";
    num_participants: number;
    num_games: number;
    teamNames?: string[];
  }) => {
    const participantNames =
      values.mode === "trios" && values.teamNames
        ? values.teamNames
        : Array.from(
            { length: values.num_participants },
            (_, i) => `Player ${i + 1}`
          );

    const tournament = await createTournament.mutateAsync({
      name: values.name,
      mode: values.mode,
      num_participants: values.num_participants,
      num_games: values.num_games,
      participantNames,
    });

    toast.success("Tournament created", {
      description: `${values.num_participants} ${values.mode === "solo" ? "players" : "teams"}, ${values.num_games} games`,
    });

    navigate(`/tournament/${tournament.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-xl mx-auto"
    >
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-bold text-ink-DEFAULT tracking-[0.15em] mb-3">
          New Tournament
        </h1>
        <p className="font-body text-ink-mist text-lg italic">
          Chronicle the picks. Reveal the patterns.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-ink-surface border border-ink-border rounded-lg p-8 relative corner-brackets"
      >
        <TournamentForm
          onSubmit={handleSubmit}
          isSubmitting={createTournament.isPending}
        />
      </motion.div>

      <p className="text-center mt-8 font-mono text-xs text-ink-mist tracking-wider">
        27 HEROES &middot; SOLO & TRIOS &middot; NO LOGIN REQUIRED
      </p>
    </motion.div>
  );
}
