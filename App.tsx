import { useState, FC, useEffect, useRef } from 'react';
import { CHARACTERS, STAGES, ACTION_ICONS, GRID_SIZE } from './constants';
import { Character, Stage, GamePhase, PlayerState, ActionType, TurnResult } from './types';
import GridDisplay from './components/GridDisplay';
import ComicPanel from './components/ComicPanel';
import { initializePlayer, resolvePhase } from './services/gameEngine';
import { generatePanelImage, getCharacterPortraitImage, getStagePreviewImage, getCharacterTokenImage } from './services/geminiService';

const App: FC = () => {
  const [phase, setPhase] = useState<GamePhase>('MENU');
  const [p1Char, setP1Char] = useState<Character>(CHARACTERS[0]);
  const [selectedStage, setSelectedStage] = useState<Stage>(STAGES[0]);
  
  // Game State
  const [p1State, setP1State] = useState<PlayerState | null>(null);
  const [p2State, setP2State] = useState<PlayerState | null>(null);
  const [turnCount, setTurnCount] = useState(1);
  
  // Action Queue
  const [p1Queue, setP1Queue] = useState<ActionType[]>([]);
  
  // Results
  const [results, setResults] = useState<TurnResult[]>([]);
  const [matchHistory, setMatchHistory] = useState<TurnResult[]>([]);
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);

  // Scroll to bottom of match history on game over
  const comicEndRef = useRef<HTMLDivElement>(null);

  const startGame = () => {
    // Select random enemy
    const enemyChar = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
    
    setP1State(initializePlayer(p1Char, 1, true));
    setP2State(initializePlayer(enemyChar, GRID_SIZE - 1, false));
    setPhase('BATTLE_INPUT');
    setP1Queue([]);
    setResults([]);
    setMatchHistory([]);
    setTurnCount(1);
  };

  const handleActionSelect = (action: ActionType) => {
    if (p1Queue.length < 3) {
      // Check resources
      if (action === ActionType.SKILL && p1State && p1State.currentEnergy < p1State.character.skillCost) {
        alert("Not enough energy!");
        return;
      }
      setP1Queue([...p1Queue, action]);
    }
  };

  const clearQueue = () => setP1Queue([]);

  const executeTurn = async () => {
    if (!p1State || !p2State) return;
    if (p1Queue.length !== 3) return;

    setPhase('BATTLE_RESOLUTION');
    setIsProcessingTurn(true);
    setResults([]); // Clear previous comic strip

    // AI generates 3 random moves
    const p2Queue: ActionType[] = [];
    for (let i = 0; i < 3; i++) {
      const possibleActions = [
        ActionType.MOVE_FORWARD, ActionType.MOVE_BACKWARD, ActionType.ATTACK, ActionType.BLOCK, ActionType.JUMP
      ];
      // AI Resource Check
      if (p2State.currentEnergy >= p2State.character.skillCost) {
        possibleActions.push(ActionType.SKILL);
      }
      p2Queue.push(possibleActions[Math.floor(Math.random() * possibleActions.length)]);
    }

    let tempP1 = { ...p1State };
    let tempP2 = { ...p2State };
    const newResults: TurnResult[] = [];

    // Loop through 3 phases
    for (let i = 0; i < 3; i++) {
      const p1Action = p1Queue[i];
      const p2Action = p2Queue[i];
      
      const resolution = resolvePhase(tempP1, tempP2, p1Action, p2Action, i + 1, selectedStage);
      
      tempP1 = resolution.p1Next;
      tempP2 = resolution.p2Next;

      // Fetch "Static" Image for this phase
      const imgUrl = await generatePanelImage(
        tempP1.character,
        tempP2.character,
        selectedStage,
        resolution.result.description,
        p1Action,
        p2Action
      );

      const resultWithImage = { ...resolution.result, imgUrl };
      newResults.push(resultWithImage);
      
      // Update immediate state for visual progress
      setResults(prev => [...prev, resultWithImage]);
      setP1State(tempP1);
      setP2State(tempP2);

      // Check Death mid-turn
      if (tempP1.currentHp <= 0 || tempP2.currentHp <= 0) {
        break;
      }
      
      // Small delay for dramatic effect
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setIsProcessingTurn(false);
    setMatchHistory(prev => [...prev, ...newResults]);
    
    if (tempP1.currentHp <= 0 || tempP2.currentHp <= 0) {
      setPhase('GAME_OVER');
      // Scroll to end of comic after render
      setTimeout(() => comicEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);
    } else {
      setTurnCount(tc => tc + 1);
      setP1Queue([]);
      setPhase('BATTLE_INPUT');
    }
  };

  // --- RENDERERS ---

  if (phase === 'MENU') {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-4 font-comic text-white">
        <h1 className="text-6xl md:text-8xl mb-8 text-center bg-white text-black px-4 py-2 transform -rotate-3 shadow-[8px_8px_0px_#f00]">
          MANGA CLASH
        </h1>
        <button 
          onClick={() => setPhase('SELECTION')}
          className="text-2xl hover:bg-red-600 hover:text-black border-4 border-white px-8 py-4 transition-all shadow-[4px_4px_0px_rgba(255,255,255,0.5)]"
        >
          START GAME
        </button>
      </div>
    );
  }

  if (phase === 'SELECTION') {
    return (
      <div className="min-h-screen bg-zinc-900 text-white p-8 font-comic overflow-y-auto">
        <h2 className="text-4xl mb-8 text-center">SELECT FIGHTER</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {CHARACTERS.map(char => (
             <div 
               key={char.id}
               onClick={() => setP1Char(char)}
               className={`cursor-pointer border-4 p-4 transition-all relative overflow-hidden group ${p1Char.id === char.id ? 'border-red-500 bg-zinc-800 scale-105 shadow-[0_0_20px_rgba(255,0,0,0.5)]' : 'border-gray-600 hover:border-white'}`}
             >
               <div className="w-full h-48 mb-4 bg-gray-800 relative overflow-hidden border-2 border-black">
                  <img src={getCharacterPortraitImage(char)} alt={char.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
               </div>
               <h3 className="text-2xl font-bold mb-2">{char.name}</h3>
               <p className="text-sm text-gray-300 mb-4 h-10">{char.description}</p>
               <div className="text-xs font-mono bg-black/30 p-2 rounded">
                 HP: {char.maxHp} | NRG: {char.maxEnergy}
                 <br/>
                 Skill: {char.skillName} (Cost: {char.skillCost})
               </div>
             </div>
          ))}
        </div>

        <h2 className="text-4xl mb-8 text-center">SELECT STAGE</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
           {STAGES.map(stage => (
             <div
                key={stage.id}
                onClick={() => setSelectedStage(stage)}
                className={`cursor-pointer border-4 p-4 transition-all group ${selectedStage.id === stage.id ? 'border-blue-500 bg-zinc-800 scale-105 shadow-[0_0_20px_rgba(0,0,255,0.5)]' : 'border-gray-600 hover:border-white'}`}
             >
               <div className="w-full h-32 mb-4 bg-gray-800 relative overflow-hidden border-2 border-black">
                 <img src={getStagePreviewImage(stage)} alt={stage.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
               </div>
               <h3 className="text-xl font-bold mb-2">{stage.name}</h3>
               <p className="text-sm text-gray-400 italic">Hazard: {stage.hazard}</p>
               <p className="text-xs text-gray-500">{stage.description}</p>
             </div>
           ))}
        </div>
        
        <div className="text-center pb-8">
           <button 
             onClick={startGame}
             className="bg-red-600 text-white text-3xl px-16 py-4 font-bold border-4 border-black shadow-[8px_8px_0px_#fff] hover:translate-y-1 hover:shadow-none transition-all uppercase"
           >
             FIGHT!
           </button>
        </div>
      </div>
    );
  }

  if (phase === 'GAME_OVER') {
    const winner = p1State && p1State.currentHp > 0 ? p1State.character.name : (p2State && p2State.currentHp > 0 ? p2State.character.name : "DRAW");
    
    return (
      <div className="min-h-screen bg-zinc-800 font-comic flex flex-col items-center py-4 md:py-10 overflow-y-auto">
        {/* Title */}
        <div className="bg-white text-black text-2xl md:text-4xl px-4 md:px-8 py-2 md:py-4 mb-4 md:mb-8 border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,0.5)] md:shadow-[8px_8px_0_rgba(0,0,0,0.5)] transform -rotate-1">
          THE FULL MANGA
        </div>

        {/* Comic Book Page Container */}
        <div className="w-full max-w-6xl bg-white p-2 md:p-12 border-x-8 border-black shadow-2xl min-h-[80vh]">
          {/* Forced 3 columns on all screens */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 auto-rows-[120px] md:auto-rows-[250px]">
            {matchHistory.map((turn, index) => {
              const isFinalShot = index === matchHistory.length - 1;

              return (
                <div key={index} className={`relative border-2 md:border-4 border-black group overflow-hidden ${isFinalShot ? 'border-red-600 border-4 md:border-8' : ''}`}>
                  <img 
                    src={turn.imgUrl} 
                    alt="Scene" 
                    className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                  />
                  
                  {/* Panel Number */}
                  <div className="absolute top-0 left-0 bg-black text-white px-1 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs z-10">
                    {index + 1}
                  </div>

                  {/* Narration Box */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white/90 border-t-2 border-black p-1 text-[10px] md:text-sm font-bold leading-tight z-20 truncate">
                    {turn.description}
                  </div>

                  {/* SPEECH BUBBLES */}
                  {turn.p1Quote && (
                    <div className="absolute top-2 left-2 max-w-[80%] z-30 animate-pulse delay-100">
                      <div className="bg-white/70 border border-black px-2 py-1 text-[10px] md:text-sm font-bold rounded-lg rounded-bl-none shadow-[1px_1px_0_rgba(0,0,0,0.2)] text-black uppercase transform -rotate-2 backdrop-blur-sm">
                         {turn.p1Quote}
                      </div>
                    </div>
                  )}

                  {turn.p2Quote && (
                    <div className="absolute top-6 right-2 max-w-[80%] z-30 animate-pulse delay-300 flex justify-end">
                      <div className="bg-white/70 border border-black px-2 py-1 text-[10px] md:text-sm font-bold rounded-lg rounded-br-none shadow-[1px_1px_0_rgba(0,0,0,0.2)] text-black uppercase transform rotate-2 backdrop-blur-sm">
                        {turn.p2Quote}
                      </div>
                    </div>
                  )}

                  {/* K.O. Stamp on last frame */}
                  {isFinalShot && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl md:text-8xl text-red-600 font-bold border-4 border-white bg-black/50 px-2 md:px-4 rotate-12 animate-pulse z-40">
                      K.O.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div ref={comicEndRef} className="mt-8 md:mt-16 text-center border-t-4 border-black pt-8 border-dashed">
            <h2 className="text-3xl md:text-5xl mb-4 uppercase">Winner: {winner}</h2>
            <div className="flex justify-center gap-4">
               <button 
                onClick={() => setPhase('MENU')}
                className="bg-black text-white text-lg md:text-xl px-6 py-2 md:px-8 md:py-3 hover:bg-red-600 transition-colors border-2 border-transparent"
              >
                BACK TO MENU
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // BATTLE UI
  return (
    <div className="min-h-screen bg-gray-100 text-black font-comic flex flex-col max-w-5xl mx-auto shadow-2xl border-x-8 border-black">
      
      {/* Header Status - UPDATED FOR MOBILE STACKING */}
      <div className="p-2 md:p-4 bg-black text-white flex flex-col md:flex-row justify-between items-center border-b-4 border-red-600 gap-2 md:gap-0">
        <div className="w-full md:w-1/3 flex items-center gap-2">
          <img src={p1State ? getCharacterTokenImage(p1State.character) : ''} className="w-10 h-10 border border-white bg-white rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xl font-bold truncate">{p1State?.character.name}</div>
            <div className="w-full h-4 bg-gray-700 mt-1 relative border border-white">
              <div className="h-full bg-green-500 transition-all duration-300" style={{width: `${(p1State!.currentHp / p1State!.character.maxHp) * 100}%`}}></div>
            </div>
            <div className="w-full h-2 bg-gray-800 mt-1 relative">
              <div className="h-full bg-blue-400 transition-all duration-300" style={{width: `${(p1State!.currentEnergy / p1State!.character.maxEnergy) * 100}%`}}></div>
            </div>
          </div>
        </div>

        <div className="text-2xl md:text-5xl font-bold italic text-red-500 mx-4">VS</div>

        <div className="w-full md:w-1/3 text-right flex items-center gap-2 flex-row-reverse">
          <img src={p2State ? getCharacterTokenImage(p2State.character) : ''} className="w-10 h-10 border border-white bg-white rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xl font-bold truncate">{p2State?.character.name}</div>
             <div className="w-full h-4 bg-gray-700 mt-1 relative border border-white">
              <div className="h-full bg-green-500 transition-all duration-300 ml-auto" style={{width: `${(p2State!.currentHp / p2State!.character.maxHp) * 100}%`}}></div>
            </div>
            <div className="w-full h-2 bg-gray-800 mt-1 relative">
               <div className="h-full bg-blue-400 transition-all duration-300 ml-auto" style={{width: `${(p2State!.currentEnergy / p2State!.character.maxEnergy) * 100}%`}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Area */}
      <div className="flex-1 bg-white relative p-2 md:p-4 flex flex-col">
        <h3 className="text-center text-sm text-gray-500 mb-2 uppercase tracking-widest">Turn {turnCount} - {selectedStage.name}</h3>
        
        {/* Comic Strip Display - UPDATED FOR MOBILE STACKING (1 col vs 3 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
           {[0, 1, 2].map(i => (
             <ComicPanel 
               key={i}
               imgUrl={results[i]?.imgUrl}
               description={results[i]?.description}
               loading={phase === 'BATTLE_RESOLUTION' && !results[i]}
             />
           ))}
        </div>

        {/* Grid Visualizer */}
        {p1State && p2State && <GridDisplay p1={p1State} p2={p2State} stage={selectedStage} />}

        {/* Input Controls */}
        <div className="mt-auto border-t-4 border-black p-4 bg-zinc-100">
          {phase === 'BATTLE_INPUT' ? (
            <>
              <div className="flex justify-center gap-2 mb-4 min-h-[3rem]">
                 {p1Queue.map((act, idx) => (
                   <div key={idx} className="w-16 h-16 bg-black text-white flex items-center justify-center text-3xl rounded shadow-lg animate-bounce">
                     {ACTION_ICONS[act]}
                   </div>
                 ))}
                 {Array.from({length: 3 - p1Queue.length}).map((_, i) => (
                   <div key={i} className="w-16 h-16 border-2 border-dashed border-gray-400 rounded"></div>
                 ))}
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                 <button onClick={() => handleActionSelect(ActionType.MOVE_BACKWARD)} className="btn-action bg-gray-200 hover:bg-gray-300 p-3 rounded border-b-4 border-gray-400 w-24">⬅️ Back</button>
                 <button onClick={() => handleActionSelect(ActionType.MOVE_FORWARD)} className="btn-action bg-gray-200 hover:bg-gray-300 p-3 rounded border-b-4 border-gray-400 w-24">FWD ➡️</button>
                 <button onClick={() => handleActionSelect(ActionType.JUMP)} className="btn-action bg-blue-100 hover:bg-blue-200 p-3 rounded border-b-4 border-blue-300 w-24">Jump ⬆️</button>
                 <button onClick={() => handleActionSelect(ActionType.ATTACK)} className="btn-action bg-red-100 hover:bg-red-200 p-3 rounded border-b-4 border-red-300 w-24">Attack 👊</button>
                 <button onClick={() => handleActionSelect(ActionType.BLOCK)} className="btn-action bg-green-100 hover:bg-green-200 p-3 rounded border-b-4 border-green-300 w-24">Block 🛡️</button>
                 <button 
                    onClick={() => handleActionSelect(ActionType.SKILL)} 
                    className={`btn-action p-3 rounded border-b-4 w-32 ${p1State!.currentEnergy >= p1State!.character.skillCost ? 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' : 'bg-gray-300 opacity-50 cursor-not-allowed'}`}
                 >
                   SKILL ⚡ ({p1State!.character.skillCost})
                 </button>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                 <button onClick={clearQueue} className="text-red-600 underline text-sm">Clear</button>
                 <button 
                    onClick={executeTurn}
                    disabled={p1Queue.length !== 3}
                    className="bg-black text-white px-12 py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-transform border-2 border-white shadow-[4px_4px_0_rgba(0,0,0,0.5)]"
                 >
                   END TURN
                 </button>
              </div>
            </>
          ) : (
            <div className="text-center text-2xl animate-pulse font-bold tracking-wider">
              {phase === 'BATTLE_RESOLUTION' ? "RESOLVING FATE..." : "..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;