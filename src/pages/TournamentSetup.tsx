import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import TournamentForm from "@/components/TournamentForm";
import {
  useTournament,
  useParticipants,
  useUpdateTournament,
} from "@/hooks/useTournament";

export default function TournamentSetup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: tournament, isLoading } = useTournament(id ?? "");
  const { data: participants } = useParticipants(id ?? "");
  const updateTournament = useUpdateTournament();

  const handleSubmit = async (values: {
    name: string;
    mode: "solo" | "trios";
    num_participants: number;
    num_games: number;
    teamNames?: string[];
  }) => {
    if (!id) return;
    await updateTournament.mutateAsync({
      id,
      name: values.name,
    });

    toast.success("Tournament updated", {
      description: `Name changed to "${values.name}"`,
    });

    navigate(`/tournament/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-display text-lg text-gold animate-pulse tracking-wide">
          Loading...
        </div>
      </div>
    );
  }

  if (!id || !tournament) {
    return (
      <div className="text-center py-20">
        <h1 className="font-display text-3xl text-ink-DEFAULT mb-4">
          Tournament Not Found
        </h1>
        <Link
          to="/"
          className="font-body text-amber hover:text-gold-light transition-colors"
        >
          Create a new tournament
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl mx-auto"
    >
      <Link
        to={`/tournament/${id}`}
        className="font-body text-sm text-ink-mist hover:text-amber transition-colors"
      >
        Back to tournament
      </Link>

      <h1 className="font-display text-3xl font-bold text-ink-DEFAULT mt-4 mb-8">
        Tournament Setup
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="bg-ink-surface border border-ink-border rounded-lg p-8"
      >
        <TournamentForm
          defaultValues={{
            name: tournament.name,
            mode: tournament.mode,
            num_participants: tournament.num_participants,
            num_games: tournament.num_games,
            teamNames: participants?.map((p) => p.name) || [],
          }}
          onSubmit={handleSubmit}
          isSubmitting={updateTournament.isPending}
          submitLabel="Update Tournament"
        />

        <div className="mt-6 pt-6 border-t border-ink-border">
          <p className="font-body text-xs text-ink-mist">
            Mode, participant count, and game count cannot be changed after creation.
            Only the tournament name can be edited.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
