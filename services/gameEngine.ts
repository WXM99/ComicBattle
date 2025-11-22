import { ActionType, PlayerState, TurnResult, Stage } from '../types';
import { GRID_SIZE, INITIAL_ENERGY_PERCENT } from '../constants';

// Helper to clamp grid position
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

export const initializePlayer = (character: any, startPos: number, facingRight: boolean): PlayerState => ({
  character: { ...character },
  currentHp: character.hp,
  currentEnergy: Math.floor(character.maxEnergy * INITIAL_ENERGY_PERCENT),
  position: startPos,
  isBlocking: false,
  isJumping: false,
  facingRight
});

// Simulates one phase (1 of 3 actions per turn)
export const resolvePhase = (
  p1: PlayerState,
  p2: PlayerState,
  p1Action: ActionType,
  p2Action: ActionType,
  phaseIndex: number,
  stage: Stage
): { p1Next: PlayerState, p2Next: PlayerState, result: TurnResult } => {

  // Clone states to mutate
  let nextP1 = { ...p1, isBlocking: false, isJumping: false };
  let nextP2 = { ...p2, isBlocking: false, isJumping: false };

  let log = "";
  let p1HpDelta = 0;
  let p2HpDelta = 0;
  let p1EnergyDelta = 0;
  let p2EnergyDelta = 0;

  // --- STAGE MECHANICS (Pre-Move) ---
  // s6: Zero-G Station - Jumps go 3 spaces instead of 2
  const jumpDist = stage.id === 's6' ? 3 : 2;
  
  // s7: Mangaka Desk - Ink makes movement sticky (costs energy)
  const moveCost = stage.id === 's7' ? 5 : 0;

  // s8: Neon Rain - Skills cost more
  const extraSkillCost = stage.id === 's8' ? 10 : 0;

  // s9: Spirit Drain - Constant energy drain
  if (stage.id === 's9') {
    p1EnergyDelta -= 5;
    p2EnergyDelta -= 5;
    log += "Spirits drain energy... ";
  }

  // 1. Resolve Movement & Costs first
  
  // P1 Move
  if (p1Action === ActionType.MOVE_FORWARD) {
     nextP1.position = clamp(nextP1.position + 1, 0, GRID_SIZE);
     nextP1.currentEnergy -= moveCost;
     if (moveCost > 0) log += "Ink slows P1! ";
  }
  if (p1Action === ActionType.MOVE_BACKWARD) {
    nextP1.position = clamp(nextP1.position - 1, 0, GRID_SIZE);
    nextP1.currentEnergy -= moveCost;
  }
  if (p1Action === ActionType.JUMP) {
     nextP1.isJumping = true;
     nextP1.position = clamp(nextP1.position + jumpDist, 0, GRID_SIZE);
     if (stage.id === 's6') log += "(Zero-G Jump!) ";
  }
  if (p1Action === ActionType.SKILL) nextP1.currentEnergy -= (p1.character.skillCost + extraSkillCost);

  // P2 Move
  if (p2Action === ActionType.MOVE_FORWARD) {
    nextP2.position = clamp(nextP2.position - 1, 0, GRID_SIZE); // P2 moves Left
    nextP2.currentEnergy -= moveCost;
    if (moveCost > 0) log += "Ink slows P2! ";
  }
  if (p2Action === ActionType.MOVE_BACKWARD) {
    nextP2.position = clamp(nextP2.position + 1, 0, GRID_SIZE);
    nextP2.currentEnergy -= moveCost;
  }
  if (p2Action === ActionType.JUMP) {
    nextP2.isJumping = true;
    nextP2.position = clamp(nextP2.position - jumpDist, 0, GRID_SIZE);
    if (stage.id === 's6') log += "(Zero-G Jump!) ";
  }
  if (p2Action === ActionType.SKILL) nextP2.currentEnergy -= (p2.character.skillCost + extraSkillCost);

  // Set Blocking state
  if (p1Action === ActionType.BLOCK) nextP1.isBlocking = true;
  if (p2Action === ActionType.BLOCK) nextP2.isBlocking = true;

  // --- STAGE MECHANICS (Post-Move, Pre-Combat) ---
  // s4: Gale Force Canyon - Wind pushes everyone right (+1) if possible
  if (stage.id === 's4') {
    if (nextP1.position < GRID_SIZE) nextP1.position += 1;
    if (nextP2.position < GRID_SIZE) nextP2.position += 1;
    log += "The wind howls! ";
  }

  // 2. Collision & Position correction
  const distance = Math.abs(nextP1.position - nextP2.position);

  // 3. Combat Resolution
  
  // P1 Attacks
  const p1Hits = (p1Action === ActionType.ATTACK && distance <= 1 && !nextP2.isJumping);
  const p1SkillHits = (p1Action === ActionType.SKILL && distance <= 3); // Skill has range 3
  const p1JumpHit = (p1Action === ActionType.JUMP && nextP1.position === nextP2.position); // Mario stomp logic

  // P2 Attacks
  const p2Hits = (p2Action === ActionType.ATTACK && distance <= 1 && !nextP1.isJumping);
  const p2SkillHits = (p2Action === ActionType.SKILL && distance <= 3);
  const p2JumpHit = (p2Action === ActionType.JUMP && nextP2.position === nextP1.position);

  // --- Damage P2 ---
  if (p1Hits) {
    if (nextP2.isBlocking) {
      log += `${p2.character.name} BLOCKS ${p1.character.name}'s punch! `;
      p2HpDelta -= 2; // Chip damage
      p2EnergyDelta += 20; // BLOCK RECOVERY: 20%
    } else {
      log += `${p1.character.name} HITS ${p2.character.name}! `;
      p2HpDelta -= 10;
      p1EnergyDelta += 10; // HIT RECOVERY: 10%
    }
  }
  
  if (p1SkillHits) {
    if (nextP2.isBlocking) {
       log += `${p2.character.name} barely survives ${p1.character.skillName}! `;
       p2HpDelta -= 15; // Skill penetrates block partially
       p2EnergyDelta += 20; // BLOCK RECOVERY: 20%
    } else {
      log += `${p1.character.name} lands ${p1.character.skillName}! `;
      p2HpDelta -= 30;
      // NO ENERGY RECOVERY ON SKILL HIT
    }
  }

  if (p1JumpHit) {
    log += `${p1.character.name} lands on ${p2.character.name}! `;
    p2HpDelta -= 15;
    nextP2.position = clamp(nextP2.position + 1, 0, GRID_SIZE);
  }

  // --- Damage P1 ---
  if (p2Hits) {
    if (nextP1.isBlocking) {
      log += `${p1.character.name} BLOCKS ${p2.character.name}'s attack! `;
      p1HpDelta -= 2;
      p1EnergyDelta += 20; // BLOCK RECOVERY: 20%
    } else {
      log += `${p2.character.name} HITS ${p1.character.name}! `;
      p1HpDelta -= 10;
      p2EnergyDelta += 10; // HIT RECOVERY: 10%
    }
  }

  if (p2SkillHits) {
     if (nextP1.isBlocking) {
       log += `${p1.character.name} withstands ${p2.character.skillName}! `;
       p1HpDelta -= 15;
       p1EnergyDelta += 20; // BLOCK RECOVERY: 20%
     } else {
      log += `${p2.character.name} unleashed ${p2.character.skillName}! `;
      p1HpDelta -= 30;
      // NO ENERGY RECOVERY ON SKILL HIT
     }
  }

  if (p2JumpHit) {
    log += `${p2.character.name} crushes ${p1.character.name} from above! `;
    p1HpDelta -= 15;
    nextP1.position = clamp(nextP1.position - 1, 0, GRID_SIZE);
  }

  // --- STAGE MECHANICS (Damage / Wall Splat) ---
  // s5: Crystal Cavern - If damage taken and at edge, extra damage
  if (stage.id === 's5') {
    if (p1HpDelta < 0 && (nextP1.position === 0 || nextP1.position === GRID_SIZE)) {
      log += " Wall Splat! ";
      p1HpDelta -= 5;
    }
    if (p2HpDelta < 0 && (nextP2.position === 0 || nextP2.position === GRID_SIZE)) {
      log += " Wall Splat! ";
      p2HpDelta -= 5;
    }
  }

  // Apply changes
  nextP1.currentHp = Math.max(0, nextP1.currentHp + p1HpDelta);
  nextP2.currentHp = Math.max(0, nextP2.currentHp + p2HpDelta);
  
  // Cap Energy
  nextP1.currentEnergy = clamp(nextP1.currentEnergy + p1EnergyDelta, 0, nextP1.character.maxEnergy);
  nextP2.currentEnergy = clamp(nextP2.currentEnergy + p2EnergyDelta, 0, nextP2.character.maxEnergy);

  // Describe non-combat movement if empty log
  if (!log) {
    if (p1Action === ActionType.MOVE_FORWARD || p1Action === ActionType.JUMP) log += `${p1.character.name} approaches. `;
    else if (p1Action === ActionType.MOVE_BACKWARD) log += `${p1.character.name} retreats. `;
    
    if (p2Action === ActionType.MOVE_FORWARD || p2Action === ActionType.JUMP) log += `${p2.character.name} closes in.`;
    else if (p2Action === ActionType.MOVE_BACKWARD) log += `${p2.character.name} keeps distance.`;
    
    if (p1Action === ActionType.BLOCK && p2Action === ActionType.BLOCK) log = "Both fighters take a defensive stance. Menacing...";
  }

  return {
    p1Next: nextP1,
    p2Next: nextP2,
    result: {
      p1Action,
      p2Action,
      description: log,
      p1HpChange: p1HpDelta,
      p2HpChange: p2HpDelta,
      p1EnergyChange: p1EnergyDelta,
      p2EnergyChange: p2EnergyDelta,
      phaseIndex
    }
  };
};