import { Character, Stage, ActionType } from "../types";

// ==========================================
// NANO BANANA ASSET LIBRARY (STATIC RESOURCES)
// ==========================================

// --- UTILS ---
const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// --- SVG DEFS & FILTERS ---
const COMMON_DEFS = `
  <defs>
    <filter id="manga-sketch">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
    </filter>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <pattern id="halftone-dot" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.5" fill="#000" opacity="0.15"/>
    </pattern>
    <linearGradient id="metal-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ddd"/>
      <stop offset="50%" stop-color="#fff"/>
      <stop offset="100%" stop-color="#999"/>
    </linearGradient>
    <linearGradient id="speed-gradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
      <stop offset="50%" stop-color="rgba(255,255,255,0.8)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
  </defs>
`;

// --- BACKGROUND SCENES ---
const STAGE_BGS: Record<string, string> = {
  // s1: Neo-Tokyo
  s1: `
    <rect width="600" height="400" fill="#222"/>
    <path d="M50,400 L50,100 L150,50 L150,400 Z" fill="#333" stroke="#555"/>
    <path d="M200,400 L200,150 L300,120 L300,400 Z" fill="#2a2a2a" stroke="#555"/>
    <path d="M400,400 L400,80 L550,40 L550,400 Z" fill="#444" stroke="#555"/>
    <rect x="60" y="120" width="80" height="20" fill="#f0f" opacity="0.5" filter="url(#glow)"/>
    <rect x="60" y="160" width="80" height="20" fill="#0ff" opacity="0.5" filter="url(#glow)"/>
    <rect x="410" y="100" width="10" height="200" fill="#ff0" opacity="0.5" filter="url(#glow)"/>
    <rect width="600" height="400" fill="url(#halftone-dot)"/>
  `,
  // s2: Midnight Train
  s2: `
    <rect width="600" height="400" fill="#001"/>
    <circle cx="100" cy="50" r="40" fill="#ffeb3b" filter="url(#glow)"/>
    <path d="M0,400 L200,350 L400,350 L600,400 Z" fill="#333" stroke="#fff" stroke-width="2"/>
    <line x1="0" y1="360" x2="600" y2="360" stroke="#555" stroke-width="2" stroke-dasharray="20,10"/>
    <path d="M0,0 L600,0 L600,400 L0,400 Z" fill="url(#halftone-dot)" opacity="0.3"/>
    <path d="M0,100 L600,100" stroke="white" stroke-width="2" stroke-dasharray="100,50" opacity="0.5">
       <animate attributeName="stroke-dashoffset" from="0" to="-150" dur="0.2s" repeatCount="indefinite"/>
    </path>
  `,
  // s3: Silent Dojo
  s3: `
    <rect width="600" height="400" fill="#eaddcf"/>
    <rect x="0" y="300" width="600" height="100" fill="#d4c5a9"/>
    <path d="M50,0 L50,300 M550,0 L550,300" stroke="#5c4033" stroke-width="20"/>
    <rect x="100" y="50" width="400" height="200" fill="#fff" stroke="#000" stroke-width="5"/>
    <text x="300" y="150" font-family="serif" font-size="80" text-anchor="middle" fill="#000" opacity="0.2">武道</text>
    <path d="M0,300 L600,300" stroke="#000" stroke-width="5"/>
  `,
  // s4: Gale Force Canyon
  s4: `
    <rect width="600" height="400" fill="#87CEEB"/>
    <path d="M0,400 L100,200 L200,400 Z" fill="#8B4513" stroke="black"/>
    <path d="M400,400 L500,150 L600,400 Z" fill="#8B4513" stroke="black"/>
    <rect x="0" y="350" width="600" height="50" fill="#A0522D"/>
    <path d="M0,50 L600,50" stroke="white" stroke-width="2" opacity="0.5" stroke-dasharray="50,20"/>
    <path d="M0,150 L600,150" stroke="white" stroke-width="3" opacity="0.5" stroke-dasharray="100,50"/>
  `,
  // s5: Crystal Cavern
  s5: `
    <rect width="600" height="400" fill="#1a1a2e"/>
    <path d="M0,0 L200,100 L0,400 Z" fill="#16213e"/>
    <path d="M600,0 L400,100 L600,400 Z" fill="#16213e"/>
    <path d="M100,350 L150,250 L200,350 Z" fill="#0ff" opacity="0.6" filter="url(#glow)"/>
    <path d="M450,350 L500,200 L550,350 Z" fill="#f0f" opacity="0.6" filter="url(#glow)"/>
    <rect width="600" height="400" fill="url(#halftone-dot)" opacity="0.5"/>
  `,
  // s6: Zero-G Station
  s6: `
    <rect width="600" height="400" fill="#000"/>
    <circle cx="300" cy="200" r="1" fill="white" box-shadow="0 0 10px white"/> 
    <rect x="0" y="50" width="600" height="300" fill="none" stroke="#555" stroke-width="2"/>
    <line x1="0" y1="50" x2="100" y2="350" stroke="#555"/>
    <line x1="600" y1="50" x2="500" y2="350" stroke="#555"/>
    <circle cx="50" cy="50" r="2" fill="white"/>
    <circle cx="550" cy="350" r="2" fill="white"/>
    <path d="M200,200 L400,200" stroke="#0ff" stroke-width="2" opacity="0.3"/>
  `,
  // s7: Mangaka Desk
  s7: `
    <rect width="600" height="400" fill="#fff"/>
    <rect x="50" y="50" width="500" height="300" fill="white" stroke="black" stroke-width="1"/>
    <path d="M400,50 L450,0 L470,0 L420,50 Z" fill="black"/> <!-- Pen tip -->
    <rect x="420" y="-100" width="50" height="150" fill="#333" transform="rotate(45 420 50)"/>
    <circle cx="100" cy="300" r="30" fill="black" opacity="0.8"/> <!-- Ink blot -->
    <path d="M100,300 Q120,320 100,340" stroke="black" fill="none"/>
  `,
  // s8: Neon Rain District
  s8: `
    <rect width="600" height="400" fill="#050510"/>
    <line x1="50" y1="0" x2="50" y2="400" stroke="#333" stroke-width="40"/>
    <line x1="550" y1="0" x2="550" y2="400" stroke="#333" stroke-width="40"/>
    <line x1="100" y1="0" x2="80" y2="400" stroke="#00f" stroke-width="1" opacity="0.5"/>
    <line x1="200" y1="0" x2="180" y2="400" stroke="#00f" stroke-width="1" opacity="0.5"/>
    <line x1="300" y1="0" x2="280" y2="400" stroke="#00f" stroke-width="1" opacity="0.5"/>
    <text x="50" y="100" fill="#f0f" font-family="sans-serif" writing-mode="tb" filter="url(#glow)">BAR</text>
  `,
  // s9: Spirit Torii Path
  s9: `
    <rect width="600" height="400" fill="#2c3e50"/>
    <path d="M100,400 L150,200 L450,200 L500,400 Z" fill="#555"/>
    <g transform="translate(200, 150) scale(0.5)">
      <path d="M-100,200 L-80,0 L80,0 L100,200" fill="none" stroke="#b00" stroke-width="20"/>
      <path d="M-120,40 L120,40" stroke="#b00" stroke-width="20"/>
      <path d="M-110,180 L110,180" stroke="#b00" stroke-width="10"/>
    </g>
    <circle cx="300" cy="300" r="10" fill="#fff" opacity="0.5" filter="url(#glow)"/>
    <circle cx="100" cy="350" r="15" fill="#fff" opacity="0.3" filter="url(#glow)"/>
  `
};

const STAGE_BGS_DEFAULT = `
  <rect width="600" height="400" fill="#fff"/>
  <path d="M0,400 L300,200 L600,400" fill="#ddd"/>
  <rect width="600" height="400" fill="url(#halftone-dot)"/>
`;

// --- CHARACTER ASSETS ---

// Generic parts reused if needed
const GENERIC_SHADING = `<path d="M-30,10 L-20,30 L-25,80 L-40,10" fill="black" opacity="0.3"/>`;

// Character Definitions
const CHAR_DEFS: Record<string, any> = {
  // Kenshiro (Jotaro-style)
  c1: {
    head: `
      <path d="M-25,-35 L25,-35 L30,-10 L-30,-10 Z" fill="#111" stroke="#fff" stroke-width="2"/> <!-- Cap -->
      <path d="M-22,-10 L-22,12 Q0,25 22,12 L22,-10" fill="#faccba" stroke="#000" stroke-width="2"/> <!-- Face -->
      <rect x="-25" y="-12" width="50" height="5" fill="#000"/> <!-- Shadow under cap -->
      <circle cx="-10" cy="0" r="2" fill="#000"/> <circle cx="10" cy="0" r="2" fill="#000"/> <!-- Eyes -->
    `,
    body: `
      <path d="M-40,10 L-55,100 L55,100 L40,10 Z" fill="#222" stroke="#000" stroke-width="3"/> <!-- Coat -->
      <path d="M-30,10 L0,90 L30,10" fill="#500"/> <!-- Shirt -->
      <path d="M-35,10 L-35,100" stroke="gold" stroke-width="2"/> <!-- Chain -->
    `,
    color: '#b00'
  },
  // Rei (Ninja)
  c2: {
    head: `
      <path d="M-20,-30 Q0,-40 20,-30 L20,10 Q0,20 -20,10 Z" fill="#333" stroke="#ccc"/>
      <rect x="-18" y="-10" width="36" height="8" fill="#0ff" filter="url(#glow)"/>
    `,
    body: `
      <path d="M-25,10 L-30,80 L30,80 L25,10 Z" fill="#111" stroke="#555"/>
      <path d="M-25,10 L-10,80 M25,10 L10,80" stroke="#333"/>
      <circle cx="0" cy="40" r="10" fill="#0ff" opacity="0.5" filter="url(#glow)"/>
    `,
    color: '#0ff'
  },
  // Baron (Steampunk)
  c3: {
    head: `
      <rect x="-25" y="-30" width="50" height="40" fill="#b8860b" stroke="#000" rx="5"/>
      <circle cx="-10" cy="-15" r="8" fill="#fff" stroke="#000" stroke-width="3"/>
      <line x1="-25" y1="0" x2="25" y2="0" stroke="#000"/>
      <rect x="-5" y="-35" width="10" height="10" fill="#555"/>
    `,
    body: `
      <circle cx="0" cy="50" r="45" fill="#8b4513" stroke="#000" stroke-width="3"/>
      <circle cx="0" cy="50" r="20" fill="#ff4500" filter="url(#glow)"/>
      <rect x="-50" y="20" width="100" height="10" fill="#555"/>
    `,
    color: '#cd853f'
  },
  // Hana (Ink)
  c4: {
    head: `
      <circle cx="0" cy="-10" r="22" fill="#faccba" stroke="#000"/>
      <path d="M-25,-20 Q0,-50 25,-20 L25,10 L-25,10 Z" fill="#111"/> <!-- Hair -->
      <path d="M15,-20 L30,10 L20,20" fill="red"/> <!-- Ribbon -->
    `,
    body: `
      <path d="M-30,10 L-40,90 L40,90 L30,10 Z" fill="#fff" stroke="#000"/>
      <path d="M-30,10 L0,50 L30,10" fill="none" stroke="#000"/>
      <rect x="-35" y="60" width="70" height="20" fill="red"/> <!-- Hakama Sash -->
    `,
    color: '#009'
  },
  // Glitch
  c5: {
    head: `
      <rect x="-20" y="-30" width="40" height="40" fill="#0f0" stroke="black"/>
      <rect x="-15" y="-20" width="10" height="10" fill="black"/>
      <rect x="5" y="-20" width="10" height="10" fill="black"/>
      <path d="M-10,0 L10,0" stroke="black" stroke-width="3"/>
    `,
    body: `
      <rect x="-25" y="10" width="50" height="70" fill="#000"/>
      <text x="-20" y="50" fill="#0f0" font-family="monospace" font-size="20">ERR</text>
    `,
    color: '#0f0'
  },
  // Axel (Punk)
  c6: {
    head: `
      <path d="M-20,-15 L-20,10 Q0,25 20,10 L20,-15" fill="#faccba" stroke="#000"/>
      <path d="M0,-15 L0,-50" stroke="#f0f" stroke-width="15" stroke-linecap="round"/> <!-- Mohawk -->
      <rect x="-20" y="-10" width="40" height="5" fill="black"/> <!-- Shades -->
    `,
    body: `
      <path d="M-30,10 L-35,80 L35,80 L30,10 Z" fill="#222"/>
      <path d="M-20,10 L-10,40 L0,10 L10,40 L20,10" fill="none" stroke="#fff"/>
      <line x1="-30" y1="30" x2="40" y2="60" stroke="#f00" stroke-width="5"/> <!-- Guitar Strap -->
    `,
    color: '#f0f'
  },
  // Miko (Origami)
  c7: {
    head: `
      <circle cx="0" cy="-10" r="20" fill="#faccba"/>
      <path d="M-25,-10 L0,-30 L25,-10" fill="#4b0082"/>
    `,
    body: `
      <path d="M-30,10 L-40,90 L40,90 L30,10 Z" fill="#fff" stroke="#f00"/>
      <path d="M-20,10 L-40,40 M20,10 L40,40" stroke="#f00"/>
      <rect x="-10" y="20" width="20" height="20" fill="none" stroke="red" transform="rotate(45 0 30)"/>
    `,
    color: '#9370db'
  },
  // Ryu (Demon)
  c8: {
    head: `
      <circle cx="0" cy="-15" r="25" fill="#000"/>
      <circle cx="-10" cy="-15" r="3" fill="#fff" filter="url(#glow)"/>
      <circle cx="10" cy="-15" r="3" fill="#fff" filter="url(#glow)"/>
      <path d="M-10,0 Q0,10 10,0" stroke="#fff" fill="none"/>
      <path d="M-20,-35 L-25,-55 L-15,-40" fill="#000"/> <!-- Horn L -->
      <path d="M20,-35 L25,-55 L15,-40" fill="#000"/> <!-- Horn R -->
    `,
    body: `
      <path d="M-35,10 Q-50,50 -20,90 L20,90 Q50,50 35,10 Z" fill="#000"/>
      <path d="M-35,10 L-50,60" stroke="#000" stroke-width="5"/> <!-- Spikes -->
    `,
    color: '#000'
  },
  // Kenji (Yankee)
  c9: {
    head: `
      <path d="M-20,-20 Q-30,-50 0,-45 Q30,-50 20,-20" fill="#220033" stroke="#fff"/> <!-- Pompadour -->
      <path d="M-20,-20 L-20,10 Q0,25 20,10 L20,-20" fill="#faccba" stroke="#000"/>
    `,
    body: `
      <path d="M-35,10 L-40,90 L40,90 L35,10 Z" fill="#220033" stroke="#gold" stroke-width="2"/> <!-- Uniform -->
      <path d="M-10,10 L0,40 L10,10" fill="#fff"/> <!-- Open shirt -->
      <circle cx="-15" cy="30" r="3" fill="#gold"/>
      <circle cx="15" cy="30" r="3" fill="#gold"/>
    `,
    color: '#ffa500'
  }
};

const GET_CHAR_ASSET = (id: string) => CHAR_DEFS[id] || CHAR_DEFS['c1'];

// --- RENDER HELPERS ---

const renderFist = (scale: number, color: string) => `
  <g transform="scale(${scale})">
    <circle r="30" fill="${color}" stroke="black" stroke-width="2"/>
    <path d="M-15,-10 L15,-10 M-15,0 L15,0 M-15,10 L15,10" stroke="black" stroke-width="2"/>
    <path d="M-20,-20 L-20,20" stroke="black" stroke-width="2"/>
  </g>
`;

const renderSpeedLines = () => `
  <g opacity="0.5">
    ${Array.from({length: 20}).map(() => {
       const y = Math.random() * 400;
       const w = Math.random() * 200 + 100;
       return `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="black" stroke-width="${Math.random()*3}"/>`;
    }).join('')}
    ${Array.from({length: 20}).map(() => {
       const y = Math.random() * 400;
       const start = 600 - (Math.random() * 200 + 100);
       return `<line x1="${start}" y1="${y}" x2="600" y2="${y}" stroke="black" stroke-width="${Math.random()*3}"/>`;
    }).join('')}
  </g>
`;

const renderGogogo = (x: number, y: number) => `
  <g transform="translate(${x}, ${y})">
    <text font-family="sans-serif" font-weight="900" font-size="60" fill="none" stroke="purple" stroke-width="4" x="0" y="0">ゴ</text>
    <text font-family="sans-serif" font-weight="900" font-size="60" fill="black" x="2" y="2">ゴ</text>
    <text font-family="sans-serif" font-weight="900" font-size="40" fill="none" stroke="purple" stroke-width="4" x="40" y="-20">ゴ</text>
    <text font-family="sans-serif" font-weight="900" font-size="40" fill="black" x="42" y="-18">ゴ</text>
  </g>
`;

// ==========================================
// EXPORTED GENERATORS
// ==========================================

export const getCharacterPortraitImage = (char: Character): string => {
  const assets = GET_CHAR_ASSET(char.id);
  const svg = `
    <svg width="200" height="200" viewBox="-50 -50 100 100" xmlns="http://www.w3.org/2000/svg">
      ${COMMON_DEFS}
      <rect x="-50" y="-50" width="100" height="100" fill="url(#speed-gradient)"/>
      <g transform="scale(1.2) translate(0, 10)">
        ${assets.body}
        ${assets.head}
      </g>
      <rect x="-50" y="-50" width="100" height="100" fill="url(#halftone-dot)" opacity="0.2"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

export const getCharacterTokenImage = (char: Character): string => {
  const assets = GET_CHAR_ASSET(char.id);
  const svg = `
    <svg width="60" height="60" viewBox="-30 -30 60 60" xmlns="http://www.w3.org/2000/svg">
      ${COMMON_DEFS}
      <g transform="scale(0.8)">
        ${assets.head}
      </g>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

export const getStagePreviewImage = (stage: Stage): string => {
  const bgContent = STAGE_BGS[stage.id] || STAGE_BGS_DEFAULT;
  const svg = `
    <svg width="300" height="200" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      ${COMMON_DEFS}
      ${bgContent}
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

export const generatePanelImage = async (
  p1: Character,
  p2: Character,
  stage: Stage,
  description: string,
  p1Action: ActionType,
  p2Action: ActionType
): Promise<string> => {

  const width = 600;
  const height = 400;
  const p1Assets = GET_CHAR_ASSET(p1.id);
  const p2Assets = GET_CHAR_ASSET(p2.id);

  // Background
  let svgContent = STAGE_BGS[stage.id] || STAGE_BGS_DEFAULT;

  // --- COMPOSITION LOGIC ---
  const isP1Attacking = p1Action === ActionType.ATTACK || p1Action === ActionType.SKILL;
  const isP2Attacking = p2Action === ActionType.ATTACK || p2Action === ActionType.SKILL;

  // Determine Camera/Focus
  let p1Scale = 1, p2Scale = 1;
  let p1X = 150, p2X = 450;
  let p1Y = 250, p2Y = 250;
  let p1Z = 0, p2Z = 0; // z-index

  if (p1Action === ActionType.SKILL) {
    p1Scale = 1.5; p1X = 200; p1Z = 10;
    p2Scale = 0.8; p2X = 500; p2Z = 0;
  } else if (p2Action === ActionType.SKILL) {
    p2Scale = 1.5; p2X = 400; p2Z = 10;
    p1Scale = 0.8; p1X = 100; p1Z = 0;
  } else if (isP1Attacking && !isP2Attacking) {
    p1Scale = 1.2; p1X = 250; p1Z = 5;
    p2X = 400;
  } else if (!isP1Attacking && isP2Attacking) {
    p2Scale = 1.2; p2X = 350; p2Z = 5;
    p1X = 200;
  }

  // Helper to draw character
  const drawChar = (char: Character, assets: any, x: number, y: number, scale: number, facingRight: boolean, action: ActionType, isHit: boolean) => {
    const dir = facingRight ? 1 : -1;
    let content = `<g transform="translate(${x}, ${y}) scale(${dir * scale}, ${scale})">`;
    
    // Aura for Skill
    if (action === ActionType.SKILL) {
       content += `<ellipse cx="0" cy="50" rx="60" ry="100" fill="${char.color.replace('bg-', '').replace('-500', '').replace('-600', '')}" opacity="0.3" filter="url(#glow)"/>`;
       // Speed lines radiating
       content += `<path d="M0,0 L-100,-200 M0,0 L100,-200 M0,0 L0,-200" stroke="${char.color}" stroke-width="2" opacity="0.5"/>`;
    }

    // Body
    content += assets.body;
    
    // Head (Bobbing animation if idle)
    const headY = action === ActionType.NONE ? -5 : 0;
    content += `<g transform="translate(0, ${headY})">${assets.head}</g>`;

    // Arms / Action Specifics
    if (isHit) {
      // Hit flash
      content += `<path d="M-50,-50 L50,50 M50,-50 L-50,50" stroke="red" stroke-width="10" opacity="0.8"/>`;
      // Recoil
      content = `<g transform="translate(${x}, ${y}) rotate(${facingRight ? -20 : 20}) scale(${dir * scale}, ${scale})">` + content.substring(content.indexOf('>') + 1);
    } else if (action === ActionType.ATTACK) {
       // Ora Ora Rush
       content += `
         <g transform="translate(40, -20)">
            ${renderFist(1, '#faccba')}
         </g>
         <g transform="translate(60, 10)">
            ${renderFist(0.8, '#faccba')}
         </g>
         <g transform="translate(30, 30)">
            ${renderFist(0.8, '#faccba')}
         </g>
       `;
    } else if (action === ActionType.BLOCK) {
       content += `<path d="M-20,20 L20,0" stroke="black" stroke-width="10" stroke-linecap="round"/>`;
       content += `<path d="M-20,0 L20,20" stroke="black" stroke-width="10" stroke-linecap="round"/>`;
    } else if (action === ActionType.SKILL) {
       // Dramatic Pose (Point)
       content += `<path d="M10,20 L50,-40" stroke="black" stroke-width="8"/>`;
       content += `<circle cx="50" cy="-40" r="10" fill="#faccba" stroke="black"/>`; // Finger
       // Kanij overlay handled in composition
    } else {
       // Idle Arms
       content += `<path d="M-20,20 L-20,60" stroke="black" stroke-width="8" stroke-linecap="round"/>`;
       content += `<path d="M20,20 L20,60" stroke="black" stroke-width="8" stroke-linecap="round"/>`;
    }

    content += `</g>`;
    return content;
  };

  // Check Hits
  const dist = Math.abs(p1X - p2X); // abstract visual distance
  const p1IsHit = (p2Action === ActionType.ATTACK || p2Action === ActionType.SKILL) && p1Action !== ActionType.BLOCK && p1Action !== ActionType.JUMP;
  const p2IsHit = (p1Action === ActionType.ATTACK || p1Action === ActionType.SKILL) && p2Action !== ActionType.BLOCK && p2Action !== ActionType.JUMP;

  // Render Order (Z-sort)
  const p1Svg = drawChar(p1, p1Assets, p1X, p1Y, p1Scale, true, p1Action, p1IsHit);
  const p2Svg = drawChar(p2, p2Assets, p2X, p2Y, p2Scale, false, p2Action, p2IsHit);

  if (p1Z > p2Z) {
    svgContent += p2Svg + p1Svg;
  } else {
    svgContent += p1Svg + p2Svg;
  }

  // --- FX OVERLAY ---
  
  // Speed Lines for attacks
  if (isP1Attacking || isP2Attacking) {
    svgContent += renderSpeedLines();
  }

  // Impact Sparks
  if (p1IsHit || p2IsHit) {
     svgContent += `
       <path d="M300,200 L320,150 L350,190 L400,180 L360,220 L400,260 L350,250 L320,300 L300,250 L280,300 L250,250 L200,260 L240,220 L200,180 L250,190 L280,150 Z" 
             fill="white" stroke="black" stroke-width="3"
             transform="translate(${randomRange(-50, 50)}, ${randomRange(-50, 50)})"
       />
     `;
     svgContent += `<text x="300" y="250" font-family="Impact" font-size="80" fill="red" stroke="white" stroke-width="2" transform="rotate(-15, 300, 250)">BAM!</text>`;
  }

  // Skill Text (Kanji)
  if (p1Action === ActionType.SKILL) {
    svgContent += `<text x="50" y="100" font-family="serif" font-size="60" font-weight="bold" fill="url(#speed-gradient)" stroke="black" stroke-width="2">ORA ORA ORA!</text>`;
    svgContent += renderGogogo(50, 50);
  }
  if (p2Action === ActionType.SKILL) {
    svgContent += `<text x="300" y="100" font-family="serif" font-size="60" font-weight="bold" fill="url(#speed-gradient)" stroke="black" stroke-width="2">MUDA MUDA!</text>`;
    svgContent += renderGogogo(400, 50);
  }

  // Block SFX
  if (p1Action === ActionType.BLOCK && isP2Attacking) {
    svgContent += `<text x="150" y="200" font-family="Impact" font-size="40" fill="blue" stroke="white">BLOCK</text>`;
  }
  if (p2Action === ActionType.BLOCK && isP1Attacking) {
    svgContent += `<text x="400" y="200" font-family="Impact" font-size="40" fill="blue" stroke="white">BLOCK</text>`;
  }

  // Wrap in SVG
  const svgString = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      ${COMMON_DEFS}
      ${svgContent}
      <rect width="100%" height="100%" fill="none" stroke="black" stroke-width="8"/>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
};