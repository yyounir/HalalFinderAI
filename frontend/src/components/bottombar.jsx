import React from 'react';
import { Search, Bookmark, Lightbulb } from 'lucide-react';

/*
  BottomBar component
  - `activeTab` and `setActiveTab` are passed from parent (App).
  - Similar to passing (String activeTab, Consumer<String> setActiveTab) in Java.
*/

export default function BottomBar({ activeTab, setActiveTab }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pointer-events-none">
      <div className="bg-green-100 max-w-md mx-auto h-20 bg-green/90 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-around pointer-events-auto">
        <button onClick={() => setActiveTab('check')} className={`flex flex-col items-center gap-1 px-13 py-2 rounded-full ${activeTab === 'check' ? 'duration-[0.2s] bg-green-600 text-green-100' : 'hover:bg-green-200 text-green-600 duration-[0.2s] active:bg-green-300 active:duration-[0.2s]'}`}>
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-bold tracking-widest">CHECK</span>
        </button>
        
        <button onClick={() => setActiveTab('saved')} className={`flex flex-col items-center gap-1 px-13 py-2 rounded-full ${activeTab === 'saved' ? 'duration-[0.2s] bg-green-600 text-green-100' : 'hover:bg-green-200 text-green-600 duration-[0.2s] active:bg-green-300 active:duration-[0.2s]'}`}>
          <Bookmark className="w-6 h-6" />
          <span className="text-[10px] font-bold tracking-widest">SAVED</span>
        </button>
        <button onClick={() => setActiveTab('tips')} className={`flex flex-col items-center gap-1 px-13 py-2 rounded-full ${activeTab === 'tips' ? 'duration-[0.2s] bg-green-600 text-green-100' : 'hover:bg-green-200 text-green-600 duration-[0.2s] active:bg-green-300 active:duration-[0.2s]'}`}>
          <Lightbulb className="w-6 h-6" />
          <span className="text-[10px] font-bold tracking-widest">TIPS</span>
        </button>
      </div>
    </nav>
  );
}
