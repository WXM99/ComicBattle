import { useState, FC } from 'react';
import { CHARACTERS, STAGES, ACTION_ICONS, GRID_SIZE } from './constants';
import { Character, Stage, GamePhase, PlayerState, ActionType, TurnResult } from './types';
import GridDisplay from './components/GridDisplay';
import ComicPanel from './components/ComicPanel';
import { initializePlayer, resolvePhase } from './services/gameEngine';
import { generatePanelImage } from './services/geminiService';

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
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);

  const startGame = () => {
    // Select random enemy
    const enemyChar = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
    
    setP1State(initializePlayer(p1Char, 1, true));
    setP2State(initializePlayer(enemyChar, GRID_SIZE - 1, false));
    setPhase('BATTLE_INPUT');
    setP1Queue([]);
    setResults([]);
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
      const resolution = resolvePhase(tempP1, tempP2, p1Queue[i], p2Queue[i], i + 1, selectedStage);
      
      tempP1 = resolution.p1Next;
      tempP2 = resolution.p2Next;

      // Generate Image for this phase
      const imgUrl = await generatePanelImage(
        tempP1.character,
        tempP2.character,
        selectedStage,
        resolution.result.description,
        true
      );

      newResults.push({ ...resolution.result, imgUrl });
      
      // Update immediate state for visual progress
      setResults(prev => [...prev, { ...resolution.result, imgUrl }]);
      setP1State(tempP1);
      setP2State(tempP2);

      // Check Death mid-turn
      if (tempP1.currentHp <= 0 || tempP2.currentHp <= 0) {
        break;
      }
    }

    setIsProcessingTurn(false);
    
    if (tempP1.currentHp <= 0 || tempP2.currentHp <= 0) {
      setPhase('GAME_OVER');
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
               className={`cursor-pointer border-4 p-6 transition-all ${p1Char.id === char.id ? 'border-red-500 bg-zinc-800 scale-105' : 'border-gray-600 hover:border-white'}`}
             >
               <div className={`h-32 w-full ${char.color} mb-4 shadow-inner`}></div>
               <h3 className="text-2xl font-bold mb-2">{char.name}</h3>
               <p className="text-sm text-gray-300 mb-4">{char.description}</p>
               <div className="text-xs font-mono">
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
                className={`cursor-pointer border-4 p-6 transition-all ${selectedStage.id === stage.id ? 'border-blue-500 bg-zinc-800 scale-105' : 'border-gray-600 hover:border-white'}`}
             >
               <h3 className="text-xl font-bold mb-2">{stage.name}</h3>
               <p className="text-sm text-gray-400 italic">Hazard: {stage.hazard}</p>
               <p className="text-xs text-gray-500">{stage.description}</p>
             </div>
           ))}
        </div>
        
        <div className="text-center">
           <button 
             onClick={startGame}
             className="bg-red-600 text-white text-2xl px-12 py-4 font-bold border-4 border-black shadow-[6px_6px_0px_#fff] hover:translate-y-1 hover:shadow-none transition-all"
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
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-comic relative overflow-hidden">
        <div className="absolute inset-0 speed-lines opacity-20"></div>
        <h1 className="text-8xl mb-4 text-red-600 z-10">K.O.</h1>
        <h2 className="text-4xl mb-12 z-10">WINNER: {winner}</h2>
        <button 
          onClick={() => setPhase('MENU')}
          className="z-10 border-4 border-white px-8 py-3 hover:bg-white hover:text-black transition-colors"
        >
          RETURN TO MENU
        </button>
      </div>
    );
  }

  // BATTLE UI
  return (
    <div className="min-h-screen bg-gray-100 text-black font-comic flex flex-col max-w-5xl mx-auto shadow-2xl border-x-8 border-black">
      
      {/* Header Status */}
      <div className="p-4 bg-black text-white flex justify-between items-center border-b-4 border-red-600">
        <div className="w-1/3">
          <div className="text-xl font-bold">{p1State?.character.name}</div>
          <div className="w-full h-4 bg-gray-700 mt-1 relative border border-white">
            <div className="h-full bg-green-500 transition-all duration-300" style={{width: `${(p1State!.currentHp / p1State!.character.maxHp) * 100}%`}}></div>
          </div>
          <div className="w-full h-2 bg-gray-800 mt-1 relative">
             <div className="h-full bg-blue-400 transition-all duration-300" style={{width: `${(p1State!.currentEnergy / p1State!.character.maxEnergy) * 100}%`}}></div>
          </div>
          <div className="text-xs mt-1">HP: {p1State?.currentHp} | ENG: {p1State?.currentEnergy}</div>
        </div>

        <div className="text-4xl font-bold italic text-red-500">VS</div>

        <div className="w-1/3 text-right">
          <div className="text-xl font-bold">{p2State?.character.name}</div>
           <div className="w-full h-4 bg-gray-700 mt-1 relative border border-white">
            <div className="h-full bg-green-500 transition-all duration-300 ml-auto" style={{width: `${(p2State!.currentHp / p2State!.character.maxHp) * 100}%`}}></div>
          </div>
          <div className="w-full h-2 bg-gray-800 mt-1 relative">
             <div className="h-full bg-blue-400 transition-all duration-300 ml-auto" style={{width: `${(p2State!.currentEnergy / p2State!.character.maxEnergy) * 100}%`}}></div>
          </div>
          <div className="text-xs mt-1">HP: {p2State?.currentHp} | ENG: {p2State?.currentEnergy}</div>
        </div>
      </div>

      {/* Stage Area */}
      <div className="flex-1 bg-white relative p-4 flex flex-col">
        <h3 className="text-center text-sm text-gray-500 mb-2 uppercase tracking-widest">Turn {turnCount} - {selectedStage.name}</h3>
        
        {/* Comic Strip Display */}
        <div className="grid grid-cols-3 gap-2 mb-4 h-64 md:h-80">
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
        {p1State && p2State && <GridDisplay p1={p1State} p2={p2State} />}

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
                 <button onClick={() => handleActionSelect(ActionType.MOVE_BACKWARD)} className="btn-action bg-gray-200 hover:bg-gray-300 p-3 rounded border-b-4 border-gray-400">⬅️ Back</button>
                 <button onClick={() => handleActionSelect(ActionType.MOVE_FORWARD)} className="btn-action bg-gray-200 hover:bg-gray-300 p-3 rounded border-b-4 border-gray-400">FWD ➡️</button>
                 <button onClick={() => handleActionSelect(ActionType.JUMP)} className="btn-action bg-blue-100 hover:bg-blue-200 p-3 rounded border-b-4 border-blue-300">Jump ⬆️</button>
                 <button onClick={() => handleActionSelect(ActionType.ATTACK)} className="btn-action bg-red-100 hover:bg-red-200 p-3 rounded border-b-4 border-red-300">Attack 👊</button>
                 <button onClick={() => handleActionSelect(ActionType.BLOCK)} className="btn-action bg-green-100 hover:bg-green-200 p-3 rounded border-b-4 border-green-300">Block 🛡️</button>
                 <button 
                    onClick={() => handleActionSelect(ActionType.SKILL)} 
                    className={`btn-action p-3 rounded border-b-4 ${p1State!.currentEnergy >= p1State!.character.skillCost ? 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' : 'bg-gray-300 opacity-50 cursor-not-allowed'}`}
                 >
                   SKILL ⚡ ({p1State!.character.skillCost})
                 </button>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                 <button onClick={clearQueue} className="text-red-600 underline text-sm">Clear</button>
                 <button 
                    onClick={executeTurn}
                    disabled={p1Queue.length !== 3}
                    className="bg-black text-white px-12 py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-transform"
                 >
                   END TURN
                 </button>
              </div>
            </>
          ) : (
            <div className="text-center text-2xl animate-pulse">
              {phase === 'BATTLE_RESOLUTION' ? "RESOLVING FATE..." : "..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;