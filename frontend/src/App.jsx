import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Camera, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck,
  RefreshCw,
  Bookmark,
  Trash2,
  BookmarkPlus
} from 'lucide-react';

// --- API Configurations ---
const BACKEND_URL = "http://127.0.0.1:5000";

const App = () => {
  const [activeTab, setActiveTab] = useState('check');
  const [ingredients, setIngredients] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [savedFoods, setSavedFoods] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch saved foods from backend on mount and tab change
  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedFoods();
    }
  }, [activeTab]);

  const fetchSavedFoods = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/saved_foods`);
      if (response.ok) {
        const data = await response.json();
        setSavedFoods(data);
      }
    } catch (err) {
      console.error("Failed to fetch saved items. Is the Flask server running?", err);
    }
  };

  const saveToDatabase = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/save_food`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: result.productName || "Scanned Product",
          verdict: result.verdict,
          reason: result.reason,
          confidence: result.confidence
        })
      });
      if (response.ok) {
        setResult(prev => ({ ...prev, saved: true }));
        fetchSavedFoods();
      }
    } catch (err) {
      setError("Could not save to list. Ensure Flask backend is running.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteFromDatabase = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/delete_food/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setSavedFoods(savedFoods.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // SECURE ANALYSIS: Now sends data to our Flask backend instead of Google directly!
  const analyzeIngredients = async (textToAnalyze = ingredients) => {
    if (!textToAnalyze.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${BACKEND_URL}/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToAnalyze })
      });

      if (!response.ok) {
        throw new Error("Backend analysis failed. Is the Flask server running?");
      }

      const data = await response.json();
      
      if (data.error) {
         throw new Error(data.error);
      }

      // Map the backend JSON response to our frontend state
      setResult({
        productName: textToAnalyze.length > 30 ? textToAnalyze.substring(0, 30) + '...' : textToAnalyze,
        verdict: data.verdict || 'uncertain',
        reason: data.reason || 'No reason provided by server.',
        confidence: data.confidence || 0
      });

    } catch (err) {
      setError(err.message || "Analysis failed. Try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-6">
        <div className="max-w-md mx-auto w-full flex items-center gap-2">
          <ShieldCheck className="text-indigo-600 w-6 h-6" />
          <h1 className="text-xl font-bold">HalalFinder<span className="text-indigo-600">AI</span></h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6">
        {/* CHECK TAB */}
        {activeTab === 'check' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-2">Check Ingredients</h2>
              <textarea
                className="w-full h-32 p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm mb-4 resize-none"
                placeholder="Example: Sugar, Gelatin, Red 40, E471..."
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
              />
              <button
                disabled={isAnalyzing || !ingredients.trim()}
                onClick={() => analyzeIngredients()}
                className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-md"
              >
                {isAnalyzing ? <RefreshCw className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
                {isAnalyzing ? "Analyzing..." : "Verify Ingredients"}
              </button>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm border border-rose-200">
                {error}
              </div>
            )}

            {result && (
              <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
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
                    className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm border-2 transition-all ${
                      result.saved 
                        ? 'border-emerald-500 text-emerald-600 bg-emerald-50' 
                        : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    {result.saved ? <CheckCircle className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
                    {result.saved ? "Saved to your Database" : "Save to Database"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SAVED TAB */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold px-2">Saved Foods</h2>
            {savedFoods.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed">
                <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Your database is empty.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedFoods.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getStatusColor(item.verdict)}`}>
                      {getStatusIcon(item.verdict)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{item.productName}</h4>
                      <p className="text-xs text-slate-500 truncate uppercase tracking-wider">{item.verdict} • {new Date(item.timestamp).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => deleteFromDatabase(item.id)} className="text-rose-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
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
    </div>
  );
};

export default App;