export const queryKeys = {
  tournament: (id: string) => ["tournament", id] as const,
  participants: (tournamentId: string) =>
    ["participants", tournamentId] as const,
  picks: (tournamentId: string) => ["picks", tournamentId] as const,
  gamePicks: (tournamentId: string, gameNumber: number) =>
    ["picks", tournamentId, gameNumber] as const,
};
