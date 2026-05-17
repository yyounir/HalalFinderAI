import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, BookmarkPlus } from 'lucide-react';

/*
  AiResponse component
  - Props (React) behave like method parameters in Java (passed-in values).
  - Example (Java-style): public void render(Result result, boolean isSaving, Runnable save){...}
  - In React we receive a `props` object; here we destructure it: ({ result, isSaving, saveToDatabase })
*/

const getStatusColor = (verdict) => {
  switch (verdict) {
    case 'halal': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'haram': return 'text-rose-600 bg-rose-50 border-rose-200';
    default: return 'text-amber-600 bg-amber-50 border-amber-200';
  }
};

const getStatusIcon = (verdict) => {
  switch (verdict) {
    case 'halal': return <CheckCircle className="w-8 h-8" />;
    case 'haram': return <XCircle className="w-8 h-8" />;
    default: return <AlertTriangle className="w-8 h-8" />;
  }
};

export default function AiResponse({ result, isSaving, saveToDatabase }) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
      <div className={`p-6 text-center border-b ${getStatusColor(result.verdict)}`}>
        <div className="flex justify-center mb-2">{getStatusIcon(result.verdict)}</div>
        <h3 className="text-2xl font-black uppercase tracking-widest">{result.verdict}</h3>
        <p className="text-sm font-medium mt-1">{result.productName}</p>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">{result.reason}</p>
        <button 
          onClick={saveToDatabase}
          disabled={isSaving || result.saved}
          className={`w-full py-4 mt-4 rounded-4xl bg-green-100 flex items-center justify-center gap-2 font-bold text-sm transition-all ${
            result.saved 
              ? 'border-emerald-500 text-green-700 bg-green-200' 
              : 'border-indigo-600 text-green-700 hover:bg-green-200'
          }`}
        >
          {result.saved ? <CheckCircle className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
          {result.saved ? "Saved to your Database" : "Save to Database"}
        </button>
      </div>
    </div>
  );
}
