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

export interface BanPickPool {
  id: string;
  tournament_id: string;
  pool_number: number;
  name: string;
  win_player_name: string;
  loss_player_name: string;
  created_at: string;
}

export interface BanPickPick {
  id: string;
  tournament_id: string;
  round_number: number;
  game_number: number;
  pool_id: string;
  player_slot: number;
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

export function useUpdateParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from("participants")
        .update({ name })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
  });
}

async function fetchBanPickPools(tournamentId: string): Promise<BanPickPool[]> {
  const { data, error } = await supabase
    .from("banpick_pools")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("pool_number", { ascending: true });
  if (error) throw error;
  return data;
}

async function fetchBanPickPicks(tournamentId: string): Promise<BanPickPick[]> {
  const { data, error } = await supabase
    .from("banpick_picks")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("round_number", { ascending: true });
  if (error) throw error;
  return data;
}

export function useBanPickPools(tournamentId: string) {
  return useQuery({
    queryKey: queryKeys.banpickPools(tournamentId),
    queryFn: () => fetchBanPickPools(tournamentId),
    enabled: !!tournamentId,
  });
}

export function useBanPickPicks(tournamentId: string) {
  return useQuery({
    queryKey: queryKeys.banpickPicks(tournamentId),
    queryFn: () => fetchBanPickPicks(tournamentId),
    enabled: !!tournamentId,
  });
}

export function useInitializeBanPickPools() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: string) => {
      const poolRows = [1, 2, 3, 4].map((poolNumber) => ({
        tournament_id: tournamentId,
        pool_number: poolNumber,
        name: `Pool ${poolNumber}`,
        win_player_name: "",
        loss_player_name: "",
      }));

      const { data, error } = await supabase
        .from("banpick_pools")
        .insert(poolRows)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.banpickPools(tournamentId),
      });
    },
  });
}

export function useUpdateBanPickPool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      tournamentId: string;
      updates: { name?: string; win_player_name?: string; loss_player_name?: string };
    }) => {
      const { error } = await supabase
        .from("banpick_pools")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.banpickPools(vars.tournamentId),
      });
    },
  });
}

export function useSaveBanPickPick() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tournamentId,
      roundNumber,
      gameNumber,
      poolId,
      playerSlot,
      heroName,
    }: {
      tournamentId: string;
      roundNumber: number;
      gameNumber: number;
      poolId: string;
      playerSlot: number;
      heroName: string;
    }) => {
      const { error: delError } = await supabase
        .from("banpick_picks")
        .delete()
        .eq("tournament_id", tournamentId)
        .eq("round_number", roundNumber)
        .eq("game_number", gameNumber)
        .eq("player_slot", playerSlot);

      if (delError) throw delError;

      const { error: insError } = await supabase
        .from("banpick_picks")
        .insert({
          tournament_id: tournamentId,
          round_number: roundNumber,
          game_number: gameNumber,
          pool_id: poolId,
          player_slot: playerSlot,
          hero_name: heroName,
        });

      if (insError) throw insError;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.banpickPicks(vars.tournamentId),
      });
    },
  });
}

export function useDeleteBanPickPick() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tournamentId,
      roundNumber,
      gameNumber,
      playerSlot,
    }: {
      tournamentId: string;
      roundNumber: number;
      gameNumber: number;
      playerSlot: number;
    }) => {
      const { error } = await supabase
        .from("banpick_picks")
        .delete()
        .eq("tournament_id", tournamentId)
        .eq("round_number", roundNumber)
        .eq("game_number", gameNumber)
        .eq("player_slot", playerSlot);

      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.banpickPicks(vars.tournamentId),
      });
    },
  });
}

export function useClearAllBanPickPicks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: string) => {
      const { error } = await supabase
        .from("banpick_picks")
        .delete()
        .eq("tournament_id", tournamentId);

      if (error) throw error;
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.banpickPicks(tournamentId),
      });
    },
  });
}
