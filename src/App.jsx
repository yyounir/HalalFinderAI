import React, { useState, useEffect, useRef } from 'react'; 
import { 
  Search, 
  RefreshCw,
  UploadCloud,
} from 'lucide-react';

import Header from './components/Header.jsx';
import AiResponse from './components/airesponse.jsx';
import SavedList from './components/saved.jsx';
import BottomBar from './components/bottombar.jsx';
import Tips from './components/tips.jsx';

// --- API Configurations ---
// Use a Vite environment variable if provided, otherwise default to same-origin (empty string)
// Default to localhost in development for convenience; production can set VITE_BACKEND_URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? 'http://127.0.0.1:5000' : '');

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
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || 'Failed to fetch saved foods');
      }

      if (!contentType.includes('application/json')) {
        throw new Error('Backend not found. Start the Flask backend or set VITE_BACKEND_URL to the API URL.');
      }

      const data = await response.json();
      setSavedFoods(data);
    } catch (err) {
      console.error("Failed to fetch saved items. Please try again later", err);
      setError(err.message || 'Failed to fetch saved items.');
    }
  };

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

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || err.reason || 'File analysis failed');
      }

      const data = await response.json();
      setResult({
        productName: data.productName || file.name,
        verdict: data.verdict || 'uncertain',
        reason: data.reason || 'No reason provided by server.',
        confidence: data.confidence || 0,
        flaggedIngredients: data.flaggedIngredients || []
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
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || 'Save failed');
      }
      if (!contentType.includes('application/json')) {
        throw new Error('Backend not found. Start the Flask backend or set VITE_BACKEND_URL to the API URL.');
      }
      setResult(prev => ({ ...prev, saved: true }));
      fetchSavedFoods();
    } catch (err) {
      setError(err.message || "Could not save to list due to database error.");
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

  const updateInDatabase = async (id, updates = {}) => {
    try {
      const response = await fetch(`${BACKEND_URL}/update_food/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: updates.productName,
          verdict: updates.verdict,
          reason: updates.reason,
          confidence: updates.confidence
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSavedFoods(prev => prev.map(s => s.id === id ? (data.item || data) : s));
        return data.item || data;
      }
      return null;
    } catch (err) {
      console.error('Update failed', err);
      return null;
    }
  };

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

      setResult({
        productName: textToAnalyze.length > 30 ? textToAnalyze.substring(0, 30) + '...' : textToAnalyze,
        verdict: data.verdict || 'uncertain',
        reason: data.reason || 'No reason provided by server.',
        confidence: data.confidence || 0,
        flaggedIngredients: data.flaggedIngredients || []
      });

    } catch (err) {
      setError(err.message || "Analysis failed. Try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-24 font-sans">
      <Header />

      <main className="max-w-md mx-auto px-4 pt-6">
        {activeTab === 'check' && (
          <div className="space-y-6">
            <div className="bg-[#bfffd1] dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold mb-2">Check Ingredients</h2>
              <textarea
                className="w-full border bg-[#dfffe8] dark:bg-slate-700 text-[#00601a] dark:text-slate-100 resize-y font-[bold] text-l duration-[0.2s] p-4 rounded-[30px] border-solid border-[#dfffe8] dark:border-slate-600 focus:duration-[0.2s] focus:border focus:rounded-[14px] focus:border-solid focus:border-[#00601a]"
                placeholder="Brand, Ingredient, or Place"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
              />
              
              <p className='text-sm mt-3 text-[#00601a] dark:text-slate-300'>HalalChecker uses AI, as a reminder please double check responses and consult official websites if you're not sure!</p>
              
              <div className="mt-4">
                <input
                  ref={fileInputRef}
                  id="hidden-file-input"
                  type="file"
                  accept="image/*"
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
                  disabled={isUploading || isAnalyzing}
                  className="w-full py-4 mt-2 rounded-[25px] bg-[#009027] hover:bg-[#00601a] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-md active:bg-green-950"
                >
                  {isUploading ? <RefreshCw className="animate-spin w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
                  {isUploading ? 'Uploading & Analyzing...' : 'Upload & Analyze'}
                </button>
                
                {selectedFile && <p className="text-xs text-slate-500 mt-2">Selected: {selectedFile.name}</p>}
              </div>

              <button
                disabled={isAnalyzing || isUploading || !ingredients.trim()}
                onClick={() => analyzeIngredients()}
                className="w-full py-4 mt-4 rounded-[25px] bg-[#009027] hover:bg-[#00601a] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-md active:bg-green-950"
              >
                {isAnalyzing ? <RefreshCw className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
                {isAnalyzing ? "Analyzing Text..." : "Verify Ingredients"}
              </button>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900 text-rose-600 dark:text-rose-300 rounded-xl text-sm border border-rose-200 dark:border-rose-800">
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
            updateFood={updateInDatabase}
          />
        )}
      </main>

      <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;