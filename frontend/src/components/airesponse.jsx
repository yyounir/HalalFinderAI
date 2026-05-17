import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, BookmarkPlus } from 'lucide-react';

/*
  AiResponse component
  - Props (React) behave like method parameters in Java (passed-in values).
  - Example (Java-style): public void render(Result result, boolean isSaving, Runnable save){...}
  - In React we receive a `props` object; here we destructure it: ({ result, isSaving, saveToDatabase })
*/

const getStatusColor = (verdict) => {
  // Return a set of Tailwind classes that include light + dark variants
  switch (verdict) {
    case 'halal':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-200 dark:bg-emerald-900 dark:border-emerald-700';
    case 'haram':
      return 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-200 dark:bg-rose-900 dark:border-rose-700';
    default:
      return 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-200 dark:bg-amber-900 dark:border-amber-700';
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
    <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-300">
      <div className={`p-4 sm:p-6 text-center border-b ${getStatusColor(result.verdict)}`}>
        <div className="flex justify-center mb-2">{getStatusIcon(result.verdict)}</div>
        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-widest">{result.verdict}</h3>
        <p className="text-sm sm:text-base font-medium mt-1 opacity-90">{result.productName}</p>
      </div>
      <div className="p-4 sm:p-6 space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{result.reason}</p>
        <button 
          onClick={saveToDatabase}
          disabled={isSaving || result.saved}
          className={`w-full py-4 mt-4 rounded-4xl bg-green-100 dark:bg-slate-700 flex items-center justify-center gap-2 font-bold text-sm transition-all ${
            result.saved 
              ? 'border-emerald-500 text-green-700 dark:text-emerald-200 bg-green-200 dark:bg-emerald-900 active:bg-green-300' 
              : 'border-indigo-600 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900 active:bg-green-300'
          }`}
        >
          {result.saved ? <CheckCircle className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
          {result.saved ? "Saved to your Database" : "Save to Database"}
        </button>
        {/* Check Next button: appears at the very bottom of the check section when an AI response is present */}
        <div className="pt-2">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 mt-2 rounded-4xl bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            aria-label="Check next product"
          >
            Check Next
          </button>
        </div>
      </div>
    </div>
  );
}
