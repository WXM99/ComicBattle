import { Character, Stage, ActionType } from './types';

export const GRID_SIZE = 6;
export const INITIAL_ENERGY_PERCENT = 0.30;

export const CHARACTERS: Character[] = [
  {
    id: 'c1',
    name: 'Kenshiro "Iron Fist"',
    description: 'A wandering martial artist searching for the ultimate truth. Uses a barrage of high-speed punches.',
    hp: 100,
    maxHp: 100,
    energy: 30,
    maxEnergy: 100,
    color: 'bg-red-600',
    avatarPrompt: 'muscular martial artist with scars, ripped shirt, determined look, manga style',
    skillName: 'North Star Barrage',
    skillCost: 40
  },
  {
    id: 'c2',
    name: 'Rei "The Shadow"',
    description: 'A cybernetic ninja blending ancient techniques with future tech. Extremely fast and elusive.',
    hp: 85,
    maxHp: 85,
    energy: 30,
    maxEnergy: 100,
    color: 'bg-purple-600',
    avatarPrompt: 'sleek cybernetic ninja, glowing visor, smoke effects, speed lines, manga style',
    skillName: 'Void Slash',
    skillCost: 35
  },
  {
    id: 'c3',
    name: 'Baron "Steam" Gear',
    description: 'A towering steampunk golem powered by a coal furnace heart. Slow but hits like a truck.',
    hp: 120,
    maxHp: 120,
    energy: 30,
    maxEnergy: 100,
    color: 'bg-yellow-700',
    avatarPrompt: 'huge steampunk robot, steam venting, brass gears, glowing furnace chest, manga style',
    skillName: 'Inferno Vent',
    skillCost: 50
  },
  {
    id: 'c4',
    name: 'Hana "Inkweaver"',
    description: 'A master calligrapher who wields a giant brush. Her attacks flow like liquid ink.',
    hp: 90,
    maxHp: 90,
    energy: 30,
    maxEnergy: 100,
    color: 'bg-blue-900',
    avatarPrompt: 'female warrior in traditional hakama, wielding giant calligraphy brush, ink splashes, manga style',
    skillName: 'Dragon Stroke',
    skillCost: 45
  },
  {
    id: 'c5',
    name: 'Unit 404 "Glitch"',
    description: 'A corrupted manga character aware of the fourth wall. Moves with jagged, pixelated glitches.',
    hp: 95,
    maxHp: 95,
    energy: 30,
    maxEnergy: 100,
    color: 'bg-green-500',
    avatarPrompt: 'distorted manga character, pixelated edges, static noise aura, creepy smile, glitch art style',
    skillName: 'Reality Crash',
    skillCost: 50
  },
  {
    id: 'c6',
    name: 'Axel "Riff"',
    description: 'A punk rocker using sound waves to shatter defenses. Loud, fast, and aggressive.',
    hp: 90,
    maxHp: 90,
    energy: 30,
    maxEnergy: 100,
    color: 'bg-pink-600',
    avatarPrompt: 'punk rocker with mohawk, leather jacket, electric guitar weapon, sound waves visible, manga style',
    skillName: 'Amp Overload',
    skillCost: 40
  },
  // New Characters
  {
    id: 'c7',
    name: 'Miko "Origami" Fold',
    description: 'A paper master who can fold reality. Fragile but versatile.',
    hp: 80,
    maxHp: 80,
    energy: 30,
    maxEnergy: 100,
    color: 'bg-indigo-400',
    avatarPrompt: 'mystical girl surrounded by floating origami cranes, paper charms, traditional japanese shrine maiden outfit, manga style',
    skillName: 'Thousand Paper Cuts',
    skillCost: 35
  },
  {
    id: 'c8',
    name: 'Ryu "The Ink Demon"',
    description: 'A cursed warrior whose body is made of living ink. Can morph his limbs into weapons.',
    hp: 110,
    maxHp: 110,
    energy: 30,
    maxEnergy: 100,
    color: 'bg-gray-900',
    avatarPrompt: 'demonic figure made of dripping black ink, glowing white eyes, claws extending, horror manga style',
    skillName: 'Abyssal Spikes',
    skillCost: 45
  },
  {
    id: 'c9',
    name: 'Kenji "Drift" King',
    description: 'A delinquent biker who fights with a chain and a tire iron. Uses dirty tactics.',
    hp: 100,
    maxHp: 100,
    energy: 30,
    maxEnergy: 100,
    color: 'bg-orange-600',
    avatarPrompt: 'japanese delinquent "yankee" style, pompadour hair, long coat with kanji, holding a chain, manga style',
    skillName: 'Chain Reaction',
    skillCost: 40
  }
];

export const STAGES: Stage[] = [
  {
    id: 's1',
    name: 'Neo-Tokyo Ruins',
    description: 'A crumbling cityscape where concrete meets neon. Standard fighting ground.',
    visualPrompt: 'ruined cyberpunk city street, broken concrete, neon signs flickering, manga background',
    hazard: 'None'
  },
  {
    id: 's2',
    name: 'The Midnight Train',
    description: 'Roof of a speeding train. High speed background.',
    visualPrompt: 'top of a moving train, speed lines in background, moon in sky, dynamic perspective',
    hazard: 'Wind Pressure'
  },
  {
    id: 's3',
    name: 'Silent Dojo',
    description: 'A traditional dojo with tatami mats. Serene but tense.',
    visualPrompt: 'traditional japanese dojo interior, tatami mats, torn shoji screens, dramatic shadows',
    hazard: 'None'
  },
  {
    id: 's4',
    name: 'Gale Force Canyon',
    description: 'A narrow bridge in a windy canyon. The wind pushes fighters to the right.',
    visualPrompt: 'narrow stone bridge over canyon, wind lines, swirling leaves, dramatic height',
    hazard: 'Strong Wind (Pushes Right)'
  },
  {
    id: 's5',
    name: 'Crystal Cavern',
    description: 'A cave full of sharp crystals. Hitting the walls causes extra damage.',
    visualPrompt: 'underground cave, glowing sharp crystals, jagged rocks, claustrophobic',
    hazard: 'Spiked Walls (Edge Damage)'
  },
  {
    id: 's6',
    name: 'Zero-G Station',
    description: 'A space station with fluctuating gravity. Jumps travel further.',
    visualPrompt: 'sci-fi space station corridor, floating debris, stars outside window, zero gravity',
    hazard: 'Low Gravity (High Jump)'
  },
  // New Stages
  {
    id: 's7',
    name: 'Mangaka Desk',
    description: 'Fight on a giant drawing desk amidst oversized pens and rulers. Ink spills make movement costly.',
    visualPrompt: 'giant manga drawing desk, oversized pens, rulers, ink bottles, paper texture background, surreal perspective',
    hazard: 'Sticky Ink (Move Cost +5)'
  },
  {
    id: 's8',
    name: 'Neon Rain District',
    description: 'A cyberpunk slum under constant acid rain. The moisture interferes with tech and skills.',
    visualPrompt: 'cyberpunk slums, heavy rain, neon reflections on wet ground, wires sparking, gloomy atmosphere',
    hazard: 'Short Circuit (Skill Cost +10)'
  },
  {
    id: 's9',
    name: 'Spirit Torii Path',
    description: 'A mystical path of infinite Torii gates. The spirits drain your energy slowly.',
    visualPrompt: 'endless path of red torii gates, floating spirit orbs, mist, mysterious forest, anime background',
    hazard: 'Spirit Drain (-5 Energy/Turn)'
  }
];

export const ACTION_ICONS: Record<ActionType, string> = {
  [ActionType.MOVE_FORWARD]: '➡️',
  [ActionType.MOVE_BACKWARD]: '⬅️',
  [ActionType.JUMP]: '⬆️',
  [ActionType.ATTACK]: '👊',
  [ActionType.BLOCK]: '🛡️',
  [ActionType.SKILL]: '⚡',
  [ActionType.NONE]: '❌'
};