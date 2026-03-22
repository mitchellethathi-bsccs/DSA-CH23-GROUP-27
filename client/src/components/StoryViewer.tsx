import { useEffect } from 'react';
import api from '../utils/api';

export default function StoryViewer({ story, onClose }: any) {
  useEffect(() => {
    if (story) {
      api.put(`/stories/${story._id}/view`).catch(console.error);
    }
    
    // Auto-close after 5s
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [story, onClose]);

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <button onClick={onClose} className="absolute right-6 top-6 text-white bg-white/20 p-2 rounded-full hover:bg-white/40 transition-colors z-20 backdrop-blur-md">
        <span className="material-symbols-outlined">close</span>
      </button>
      <div className="relative max-w-sm w-full h-[80vh] bg-surface-container flex flex-col items-center justify-center rounded-3xl overflow-hidden shadow-2xl animate-[scaleIn_0.2s_ease-out]">
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10 drop-shadow-md">
          <div className="flex items-center gap-3">
            <img src={story.user.avatar} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
            <span className="text-white font-bold drop-shadow-lg">{story.user.name}</span>
          </div>
        </div>
        
        {story.image && (
          <img src={story.image} className="absolute inset-0 w-full h-full object-cover" />
        )}
        
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 ${!story.image && 'bg-gradient-to-br from-indigo-500 to-purple-800 opacity-100'}`}></div>
        
        {story.content && (
          <div className="z-10 p-8 text-center max-w-[80%]">
            <h2 className={`text-white text-2xl font-bold leading-relaxed ${story.image ? 'bg-black/40 p-4 rounded-xl backdrop-blur-sm' : ''}`}>{story.content}</h2>
          </div>
        )}
        
        <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
          <div className="h-1 bg-white flex-1 rounded-full overflow-hidden">
             <div className="h-full bg-white w-full origin-left animate-[progress_5s_linear_forwards]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
