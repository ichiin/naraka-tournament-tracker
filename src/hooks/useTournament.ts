import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { queryKeys } from "@/lib/queryKeys";

export interface Tournament {
  id: string;
  name: string;
  mode: "solo" | "trios";
  num_participants: number;
  num_games: number;
  created_at: string;
}

export interface Participant {
  id: string;
  tournament_id: string;
  name: string;
  created_at: string;
}

export interface Pick {
  id: string;
  tournament_id: string;
  participant_id: string;
  game_number: number;
  hero_name: string;
}

export interface CreateTournamentInput {
  name: string;
  mode: "solo" | "trios";
  num_participants: number;
  num_games: number;
  participantNames: string[];
}

async function fetchTournament(id: string): Promise<Tournament> {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

async function fetchParticipants(tournamentId: string): Promise<Participant[]> {
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

async function fetchPicks(tournamentId: string): Promise<Pick[]> {
  const { data, error } = await supabase
    .from("picks")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("game_number", { ascending: true });
  if (error) throw error;
  return data;
}

export function useTournament(id: string) {
  return useQuery({
    queryKey: queryKeys.tournament(id),
    queryFn: () => fetchTournament(id),
    enabled: !!id,
  });
}

export function useParticipants(tournamentId: string) {
  return useQuery({
    queryKey: queryKeys.participants(tournamentId),
    queryFn: () => fetchParticipants(tournamentId),
    enabled: !!tournamentId,
  });
}

export function usePicks(tournamentId: string) {
  return useQuery({
    queryKey: queryKeys.picks(tournamentId),
    queryFn: () => fetchPicks(tournamentId),
    enabled: !!tournamentId,
  });
}

export function useCreateTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTournamentInput) => {
      const { data: tournament, error: tError } = await supabase
        .from("tournaments")
        .insert({
          name: input.name,
          mode: input.mode,
          num_participants: input.num_participants,
          num_games: input.num_games,
        })
        .select()
        .single();

      if (tError) throw tError;
      if (!tournament) throw new Error("Failed to create tournament");

      const participantRows = input.participantNames.map((name) => ({
        tournament_id: tournament.id,
        name,
      }));

      const { error: pError } = await supabase
        .from("participants")
        .insert(participantRows);

      if (pError) throw pError;

      return tournament;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournament"] });
    },
  });
}

export function useSavePicks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tournamentId,
      participantId,
      gameNumber,
      heroes,
    }: {
      tournamentId: string;
      participantId: string;
      gameNumber: number;
      heroes: string[];
    }) => {
      const { error: delError } = await supabase
        .from("picks")
        .delete()
        .eq("tournament_id", tournamentId)
        .eq("participant_id", participantId)
        .eq("game_number", gameNumber);

      if (delError) throw delError;

      if (heroes.length > 0) {
        const pickRows = heroes.map((hero) => ({
          tournament_id: tournamentId,
          participant_id: participantId,
          game_number: gameNumber,
          hero_name: hero,
        }));

        const { error: insError } = await supabase
          .from("picks")
          .insert(pickRows);

        if (insError) throw insError;
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.picks(vars.tournamentId),
      });
    },
  });
}

export function useUpdateTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
    }: {
      id: string;
      name: string;
    }) => {
      const { error } = await supabase
        .from("tournaments")
        .update({ name })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tournament(vars.id),
      });
    },
  });
}
