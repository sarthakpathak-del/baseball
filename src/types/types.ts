/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum PitchType {
  Fastball = 'fastball',
  Curveball = 'curveball',
  Changeup = 'changeup',
}

export enum GameStage {
  PitcherWindup = 'pitcher_windup',
  InFlight = 'in_flight',
  FlightTracking = 'flight_tracking',
  ResultStrike = 'result_strike',
  ResultBall = 'result_ball',
  ResultFoul = 'result_foul',
  ResultHit = 'result_hit',
  ResultHomerun = 'result_homerun',
  Resetting = 'resetting',
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

export interface HitRecord {
  id: string;
  resultType: 'Homerun' | 'Single' | 'Double' | 'Triple' | 'Foul';
  distance: number;
  exitVelocity: number;
  launchAngle: number;
  horizontalAngle: number;
  pitchType: PitchType;
  pitchSpeed: number;
  blowPower: number;
  timestamp: string;
}
