import React, { useState, useEffect, useRef } from 'react'; // Imports the React library. Needed to defineReact components and use JSX.
import './App.css'; // Imports the CSS file specifically for this App component, applying styles

// import AIResponseCard from "./components/AIResponseCard";
import Header from "./components/Header";
import AiResponse from "./components/airesponse";
import SavedList from "./components/saved";
import BottomBar from "./components/bottombar";
import Tips from "./components/tips";
import { 
  Search, 
  Camera, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck,
  RefreshCw,
  Bookmark,
  UploadCloud,
  Trash2,
  BookmarkPlus
} from 'lucide-react';

// --- API Configurations ---
const BACKEND_URL = "http://127.0.0.1:5000";

const App = () => {
  const [activeTab, setActiveTab] = useState('check');
  const [ingredients, setIngredients] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
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

  // Upload a file to backend for analysis. Sends multipart/form-data.
  const analyzeFile = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);

      const response = await fetch(`${BACKEND_URL}/detect_file`, {
        method: 'POST',
        body: form
      });

      if (!response.ok) throw new Error('File analysis failed. Is the backend running and endpoint /detect_file available?');

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setResult({
        productName: data.productName || file.name,
        verdict: data.verdict || 'uncertain',
        reason: data.reason || 'No reason provided by server.',
        confidence: data.confidence || 0
      });
    } catch (err) {
      setError(err.message || 'File analysis failed.');
    } finally {
      setIsUploading(false);
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
      <Header />

      <main className="max-w-md mx-auto px-4 pt-6">
        {/* CHECK TAB */}
        {activeTab === 'check' && (
          <div className="space-y-6">
            <div className="bg-[#bfffd1] rounded-3xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-2">Check Ingredients</h2>
              <textarea
                className="w-full border bg-[#dfffe8] text-[#00601a] resize-y font-[bold] text-l duration-[0.2s] p-4 rounded-[30px] border-solid border-[#dfffe8] focus:duration-[0.2s] focus:border focus:rounded-[14px] focus:border-solid focus:border-[#00601a]"
                placeholder="Brand, Ingredient, or Place"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
              />
              <p className='text-sm'>HalalChecker uses AI, as a reminder please double check responses and consult official websites if you're not sure!</p>
              <div className="mt-4">
                <input
                  ref={fileInputRef}
                  id="hidden-file-input"
                  type="file"
                  accept="image/*,text/plain"
                  onChange={async (e) => {
                    const f = e.target.files?.[0] || null;
                    if (!f) return;
                    setSelectedFile(f);
                    await analyzeFile(f);
                  }}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full py-4 mt-4 rounded-4xl bg-[#009027] hover:bg-[#00601a] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-md active:bg-green-950"
                >
                  <UploadCloud className="w-5 h-5" />
                  {isUploading ? 'Uploading...' : 'Upload & Analyze'}
                </button>
                {selectedFile && <p className="text-xs text-slate-500 mt-2">Selected: {selectedFile.name}</p>}
              </div>
              <button
                disabled={isAnalyzing || !ingredients.trim()}
                onClick={() => analyzeIngredients()}
                className="w-full py-4 mt-4 rounded-4xl bg-[#009027] hover:bg-[#00601a] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-md active:bg-green-950"
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
              <AiResponse
                result={result}
                isSaving={isSaving}
                saveToDatabase={saveToDatabase}
              />
            )}
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="space-y-4">
            <Tips />
          </div>
        )}

        {activeTab === 'saved' && (
          <SavedList
            savedFoods={savedFoods}
            deleteFromDatabase={deleteFromDatabase}
          />
        )}
      </main>

      <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App; // Exports the 'App' component so it can be imported and used in other files (like index.js).
                   // `export default` makes it the primary export of this module.