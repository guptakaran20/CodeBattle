export interface LiveBattle {
  id: string;
  player1: string;
  player2: string;
  rating1: number;
  rating2: number;
  language: string;
  status: "Accepted" | "Wrong Answer" | "Coding" | "Time Limit Exceeded";
  timer: string;
}

export const liveBattles: LiveBattle[] = [
  {
    id: "b1",
    player1: "Dev_Alpha",
    player2: "CodeMaster",
    rating1: 1842,
    rating2: 1798,
    language: "C++",
    status: "Coding",
    timer: "12:43"
  },
  {
    id: "b2",
    player1: "Algo_Rhythm",
    player2: "SyntaxError",
    rating1: 2105,
    rating2: 2088,
    language: "Python",
    status: "Accepted",
    timer: "03:12"
  },
  {
    id: "b3",
    player1: "NullPointer",
    player2: "ByteMe",
    rating1: 1450,
    rating2: 1475,
    language: "Java",
    status: "Wrong Answer",
    timer: "08:55"
  },
  {
    id: "b4",
    player1: "SpeedCoder",
    player2: "O_N_Squared",
    rating1: 1950,
    rating2: 1945,
    language: "Go",
    status: "Coding",
    timer: "01:04"
  }
];
