export type Team = {
  id?: number;
  name: string;
};

export type Tournament = {
  id: number;
  name: string;
  teams: string; // JSON string of Team[]
  startDate: string;
  endDate: string;
  location: string;
  matches?: Match[];
};

export type Match = {
  id?: number;
  tournament_id?: number | null;
  team1: string;
  team2: string;
  date: string;
  location: string;
  status: "Предстоящий" | "Идет" | "Завершен";
  score1: number;
  score2: number;
  shotsOnGoal1?: number;
  shotsOnGoal2?: number;
  shotsOnTarget1?: number;
  shotsOnTarget2?: number;
  yellowCards1?: number;
  yellowCards2?: number;
  redCards1?: number;
  redCards2?: number;
  corners1?: number;
  corners2?: number;
  possession1?: number;
  possession2?: number;
  start_time?: string | null;
  duration?: number | null;
  goalScorers1?: string[] | null;
  goalScorers2?: string[] | null;
  yellowCardPlayers1?: string[] | null;
  yellowCardPlayers2?: string[] | null;
  redCardPlayers1?: string[] | null;
  redCardPlayers2?: string[] | null;
  match_type?: string | null;
  referee?: string | null;
  stage?: "Групповой этап" | "Четвертьфинал" | "Полуфинал" | "Финал" | null;
};