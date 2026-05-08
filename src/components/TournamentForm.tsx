import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  name: z.string().min(1, "Tournament name is required"),
  mode: z.enum(["solo", "trios"]),
  num_participants: z.number().int().min(2, "Minimum 2 participants"),
  num_games: z.number().int().min(1, "Minimum 1 game"),
  teamNames: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.mode === "trios" && data.teamNames) {
      return data.teamNames.every((n) => n.trim().length > 0);
    }
    return true;
  },
  {
    message: "All team names are required",
    path: ["teamNames"],
  }
);

type FormValues = z.infer<typeof formSchema>;

interface TournamentFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export default function TournamentForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Create Tournament",
}: TournamentFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      mode: "solo",
      num_participants: 2,
      num_games: 1,
      teamNames: [],
      ...defaultValues,
    },
  });

  const mode = form.watch("mode");
  const numParticipants = form.watch("num_participants");
  const teamNames = form.watch("teamNames") || [];

  useEffect(() => {
    if (mode === "trios") {
      const current = form.getValues("teamNames") || [];
      if (current.length !== numParticipants) {
        const filled = Array.from({ length: numParticipants }, (_, i) =>
          current[i] || `Team ${i + 1}`
        );
        form.setValue("teamNames", filled);
      }
    }
  }, [mode, numParticipants, form]);

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="font-body text-sm text-ink-DEFAULT tracking-wide"
          >
            Tournament Name
          </Label>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="NBPL Season 1 Finals"
            className="bg-ink-void border-ink-border text-ink-DEFAULT font-body placeholder:text-ink-mist/50
                       focus-visible:ring-vermillion/50 h-11"
          />
          {form.formState.errors.name && (
            <p className="text-xs text-vermillion">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="font-body text-sm text-ink-DEFAULT tracking-wide">
            Game Mode
          </Label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => form.setValue("mode", "solo")}
              className={`flex-1 py-2.5 font-display text-sm tracking-wider border transition-all duration-300
                ${mode === "solo"
                  ? "border-jade bg-jade/10 text-jade"
                  : "border-ink-border bg-ink-void text-ink-mist hover:border-ink-mist/50"
                }`}
            >
              Solo
            </button>
            <button
              type="button"
              onClick={() => form.setValue("mode", "trios")}
              className={`flex-1 py-2.5 font-display text-sm tracking-wider border transition-all duration-300
                ${mode === "trios"
                  ? "border-vermillion bg-vermillion/10 text-vermillion"
                  : "border-ink-border bg-ink-void text-ink-mist hover:border-ink-mist/50"
                }`}
            >
              Trios
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="num_participants"
              className="font-body text-sm text-ink-DEFAULT tracking-wide"
            >
              {mode === "solo" ? "Players" : "Teams"}
            </Label>
            <Input
              id="num_participants"
              type="number"
              min={2}
              {...form.register("num_participants", { valueAsNumber: true })}
              className="bg-ink-void border-ink-border text-ink-DEFAULT font-mono
                         focus-visible:ring-vermillion/50 h-11"
            />
            {form.formState.errors.num_participants && (
              <p className="text-xs text-vermillion">
                {form.formState.errors.num_participants.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="num_games"
              className="font-body text-sm text-ink-DEFAULT tracking-wide"
            >
              Games
            </Label>
            <Input
              id="num_games"
              type="number"
              min={1}
              {...form.register("num_games", { valueAsNumber: true })}
              className="bg-ink-void border-ink-border text-ink-DEFAULT font-mono
                         focus-visible:ring-vermillion/50 h-11"
            />
            {form.formState.errors.num_games && (
              <p className="text-xs text-vermillion">
                {form.formState.errors.num_games.message}
              </p>
            )}
          </div>
        </div>

        {mode === "trios" && (
          <div className="space-y-3">
            <Label className="font-body text-sm text-ink-DEFAULT tracking-wide">
              Team Names
            </Label>
            <div className="space-y-2">
              {Array.from({ length: numParticipants }, (_, i) => (
                <Input
                  key={i}
                  value={teamNames[i] || ""}
                  onChange={(e) => {
                    const updated = [...teamNames];
                    updated[i] = e.target.value;
                    form.setValue("teamNames", updated);
                  }}
                  placeholder={`Team ${i + 1}`}
                  className="bg-ink-void border-ink-border text-ink-DEFAULT font-body
                             focus-visible:ring-vermillion/50 h-10"
                />
              ))}
            </div>
            {form.formState.errors.teamNames && (
              <p className="text-xs text-vermillion">
                {form.formState.errors.teamNames.message}
              </p>
            )}
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 bg-vermillion hover:bg-vermillion/80 text-white font-display text-sm
                   tracking-[0.2em] uppercase transition-all duration-300 border-vermillion
                   hover:shadow-[0_0_20px_rgba(197,48,48,0.4)] animate-pulse-glow"
      >
        {isSubmitting ? "Creating..." : submitLabel}
      </Button>
    </form>
  );
}
