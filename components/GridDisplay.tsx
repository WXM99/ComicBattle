import { FC } from 'react';
import { GRID_SIZE } from '../constants';
import { PlayerState } from '../types';

interface Props {
  p1: PlayerState;
  p2: PlayerState;
}

const GridDisplay: FC<Props> = ({ p1, p2 }) => {
  // Create array of grid indexes
  const gridCells = Array.from({ length: GRID_SIZE + 1 }, (_, i) => i);

  return (
    <div className="w-full my-6 relative h-24 bg-halftone border-y-4 border-black flex items-end justify-between px-2">
      {/* Decorative floor line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black"></div>

      {gridCells.map((idx) => {
        const isP1Here = p1.position === idx;
        const isP2Here = p2.position === idx;

        return (
          <div key={idx} className="flex-1 h-full relative flex justify-center items-end border-r border-black/10 last:border-none">
            <span className="absolute bottom-1 text-xs text-gray-400 font-mono">{idx}</span>
            
            {/* Player 1 Avatar */}
            {isP1Here && (
              <div 
                className={`absolute transition-all duration-300 ${p1.isJumping ? 'bottom-12' : 'bottom-2'} z-10`}
              >
                <div className={`w-12 h-12 ${p1.character.color} rounded-sm border-2 border-black flex items-center justify-center text-white font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)]`}>
                  P1
                </div>
                {p1.isBlocking && <div className="absolute -top-4 left-2 text-lg">🛡️</div>}
              </div>
            )}

            {/* Player 2 Avatar */}
            {isP2Here && (
              <div 
                 className={`absolute transition-all duration-300 ${p2.isJumping ? 'bottom-12' : 'bottom-2'} z-10`}
              >
                <div className={`w-12 h-12 ${p2.character.color} rounded-sm border-2 border-black flex items-center justify-center text-white font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)]`}>
                  P2
                </div>
                {p2.isBlocking && <div className="absolute -top-4 left-2 text-lg">🛡️</div>}
              </div>
            )}
            
            {/* Collision Indicator */}
            {isP1Here && isP2Here && (
               <div className="absolute bottom-8 text-4xl font-comic text-red-600 z-20 animate-pulse">
                 VS
               </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GridDisplay;