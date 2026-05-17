import React from 'react';
import { Search, Bookmark } from 'lucide-react';

/*
  BottomBar component
  - `activeTab` and `setActiveTab` are passed from parent (App).
  - Similar to passing (String activeTab, Consumer<String> setActiveTab) in Java.
*/

export default function BottomBar({ activeTab, setActiveTab }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pointer-events-none">
      <div className="max-w-md mx-auto h-16 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-full shadow-lg flex items-center justify-around pointer-events-auto">
        <button onClick={() => setActiveTab('check')} className={`flex flex-col items-center gap-1 transition-all px-6 py-2 rounded-full ${activeTab === 'check' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-bold tracking-widest">CHECK</span>
        </button>
        <button onClick={() => setActiveTab('saved')} className={`flex flex-col items-center gap-1 transition-all px-6 py-2 rounded-full ${activeTab === 'saved' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Bookmark className="w-6 h-6" />
          <span className="text-[10px] font-bold tracking-widest">SAVED</span>
        </button>
      </div>
    </nav>
  );
}
