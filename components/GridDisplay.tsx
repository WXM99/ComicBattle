import { FC } from 'react';
import { GRID_SIZE } from '../constants';
import { PlayerState, Stage } from '../types';
import { getCharacterTokenImage, getStagePreviewImage } from '../services/geminiService';

interface Props {
  p1: PlayerState;
  p2: PlayerState;
  stage?: Stage;
}

const GridDisplay: FC<Props> = ({ p1, p2, stage }) => {
  // Create array of grid indexes
  const gridCells = Array.from({ length: GRID_SIZE + 1 }, (_, i) => i);

  // Background style based on stage
  const bgStyle = stage ? {
    backgroundImage: `url(${getStagePreviewImage(stage)})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundBlendMode: 'overlay',
    backgroundColor: 'rgba(255,255,255,0.8)'
  } : {};

  return (
    <div 
      className="w-full my-6 relative h-32 border-y-4 border-black flex items-end justify-between px-2 overflow-hidden"
      style={bgStyle}
    >
      {/* Decorative floor line */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-black z-0"></div>

      {gridCells.map((idx) => {
        const isP1Here = p1.position === idx;
        const isP2Here = p2.position === idx;

        return (
          <div key={idx} className="flex-1 h-full relative flex justify-center items-end border-r border-black/10 last:border-none z-10">
            <span className="absolute bottom-2 text-xs font-mono font-bold text-black/50 bg-white/50 px-1">{idx}</span>
            
            {/* Player 1 Avatar */}
            {isP1Here && (
              <div 
                className={`absolute transition-all duration-300 ${p1.isJumping ? 'bottom-16' : 'bottom-2'} z-20 flex flex-col items-center`}
              >
                <img 
                  src={getCharacterTokenImage(p1.character)} 
                  alt="P1" 
                  className="w-20 h-20 object-contain drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] transform hover:scale-110 transition-transform"
                />
                <div className="bg-red-600 text-white text-xs px-2 font-bold skew-x-[-10deg] border border-black">P1</div>
                {p1.isBlocking && <div className="absolute -top-6 text-2xl animate-bounce">🛡️</div>}
              </div>
            )}

            {/* Player 2 Avatar */}
            {isP2Here && (
              <div 
                 className={`absolute transition-all duration-300 ${p2.isJumping ? 'bottom-16' : 'bottom-2'} z-20 flex flex-col items-center`}
              >
                 {/* Flip P2 image */}
                <img 
                  src={getCharacterTokenImage(p2.character)} 
                  alt="P2" 
                  className="w-20 h-20 object-contain drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] transform scale-x-[-1] hover:scale-x-[-1.1] hover:scale-y-110 transition-transform"
                />
                <div className="bg-blue-600 text-white text-xs px-2 font-bold skew-x-[-10deg] border border-black">P2</div>
                {p2.isBlocking && <div className="absolute -top-6 text-2xl animate-bounce">🛡️</div>}
              </div>
            )}
            
            {/* Collision Indicator */}
            {isP1Here && isP2Here && (
               <div className="absolute bottom-12 text-6xl font-comic text-red-600 z-30 animate-pulse drop-shadow-[4px_4px_0_#fff]">
                 💥
               </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GridDisplay;