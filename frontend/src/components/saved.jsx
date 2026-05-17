import React from 'react';
import { Bookmark, Trash2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

/*
  SavedList component
  - Demonstrates passing data (array of saved items) and a function (deleteFromDatabase)
  - Think of `savedFoods` as a Java List<Result> parameter and `deleteFromDatabase` as a method parameter.
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
    case 'halal': return <CheckCircle className="w-6 h-6" />;
    case 'haram': return <XCircle className="w-6 h-6" />;
    default: return <AlertTriangle className="w-6 h-6" />;
  }
};

export default function SavedList({ savedFoods = [], deleteFromDatabase }) {
  if (!savedFoods || savedFoods.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 border-dashed">
        <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-400 mx-auto mb-3" />
        <p className="text-slate-500 dark:text-slate-300">Your saved items is empty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {savedFoods.map(item => (
        <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getStatusColor(item.verdict)}`}>
            {getStatusIcon(item.verdict)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm truncate">{item.productName}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-300 truncate uppercase tracking-wider">{item.verdict} • {new Date(item.timestamp).toLocaleDateString()}</p>
          </div>
          <button onClick={() => deleteFromDatabase(item.id)} className="text-rose-400 hover:text-rose-600 p-2 hover:bg-rose-50 dark:hover:bg-rose-900 rounded-lg transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
