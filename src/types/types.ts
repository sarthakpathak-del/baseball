export enum GameStage {
  PitcherWindup = 'PitcherWindup',
  InFlight = 'InFlight',
  ResultStrike = 'ResultStrike',
  ResultBall = 'ResultBall',
  ResultFoul = 'ResultFoul',
  ResultHit = 'ResultHit',
  ResultHomerun = 'ResultHomerun',
  ResultOut = 'ResultOut',
  BallFlying = 'BallFlying',
  Resetting = 'Resetting',
  GameOver = 'GameOver',
}

export enum PitchType {
  Fastball = 'Fastball',
  Curveball = 'Curveball',
  Changeup = 'Changeup',
}

export interface GameStats {
  score: number;
  homeruns: number;
  singles: number;
  doubles: number;
  triples: number;
  strikes: number;
  balls: number;
  streak: number;
  maxDistance: number;
  totalPitches: number;
}

export type HitQuality = 'perfect' | 'good' | 'late' | 'early' | 'miss';

export type SwingResultReason = 'hit' | 'miss' | 'fieldedOut';
