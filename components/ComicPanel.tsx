import { FC } from 'react';

interface Props {
  imgUrl?: string;
  description: string;
  loading: boolean;
}

const ComicPanel: FC<Props> = ({ imgUrl, description, loading }) => {
  return (
    <div className="w-full aspect-square bg-white comic-border p-2 relative overflow-hidden flex flex-col">
      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-gray-100 speed-lines">
          <div className="text-2xl font-comic animate-pulse">DRAWING...</div>
        </div>
      ) : imgUrl ? (
        <div className="flex-1 relative overflow-hidden">
          <img src={imgUrl} alt="Fight Scene" className="w-full h-full object-cover grayscale contrast-125" />
          {/* Simulated Sound Effect Overlay */}
          <div className="absolute top-2 right-2 text-4xl font-comic text-red-600 transform rotate-12 drop-shadow-[2px_2px_0_#fff]">
            BAM!
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-200">
          <span className="text-gray-500 font-comic">Waiting for input...</span>
        </div>
      )}
      
      <div className="h-auto min-h-[3rem] bg-white border-t-2 border-black p-2 text-sm font-bold font-mono leading-tight">
        {description || "The fighters prepare for the next move..."}
      </div>
    </div>
  );
};

export default ComicPanel;