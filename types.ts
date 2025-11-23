export enum ActionType {
  MOVE_FORWARD = 'MOVE_FORWARD',
  MOVE_BACKWARD = 'MOVE_BACKWARD',
  JUMP = 'JUMP',
  ATTACK = 'ATTACK',
  BLOCK = 'BLOCK',
  SKILL = 'SKILL',
  NONE = 'NONE'
}

export interface Character {
  id: string;
  name: string;
  description: string;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  color: string;
  avatarPrompt: string;
  skillName: string;
  skillCost: number;
}

export interface Stage {
  id: string;
  name: string;
  description: string;
  visualPrompt: string;
  hazard: string;
}

export interface PlayerState {
  character: Character;
  currentHp: number;
  currentEnergy: number;
  position: number; // 0-6 Grid
  isBlocking: boolean;
  isJumping: boolean; // True if currently in the air (for the current sub-turn)
  facingRight: boolean;
}

export interface TurnResult {
  p1Action: ActionType;
  p2Action: ActionType;
  description: string;
  imgUrl?: string;
  p1HpChange: number;
  p2HpChange: number;
  p1EnergyChange: number;
  p2EnergyChange: number;
  phaseIndex: number; // 1, 2, or 3
  p1Quote?: string;
  p2Quote?: string;
}

export type GamePhase = 'MENU' | 'SELECTION' | 'BATTLE_INPUT' | 'BATTLE_RESOLUTION' | 'GAME_OVER';