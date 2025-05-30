declare module 'react-tournament-brackets' {
    import { ReactNode } from 'react';
  
    export interface Team {
      id: number | null;
      name: string;
      score?: number | null;
    }
  
    export interface Side {
      team: Team | null;
      score: number | null;
      sourceGame?: Game;
    }
  
    export interface Game {
      id: number | string;
      name: string;
      scheduled: number;
      sides: {
        home: Side;
        visitor: Side;
      };
    }
  
    export interface IRenderSeedProps {
      seed: Game;
      breakpoint: number;
    }
  
    export const SingleEliminationBracket: React.FC<{
      games: Game[];
      renderSeedComponent: (props: IRenderSeedProps) => ReactNode;
    }>;
  }