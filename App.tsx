import React, { useState, useEffect } from 'react';
import { analyzeQuranTopic } from './services/geminiService';
import { SearchResult, LoadingState } from './types';
import ResultCard from './components/ResultCard';
import { SearchIcon, BookIcon, SpinnerIcon, SettingsIcon } from './components/Icons';

function App() {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [customKey, setCustomKey] = useState('');

  useEffect(() => {
    // Load existing key from storage on mount to populate the settings input
    const storedKey = localStorage.getItem('nur_custom_api_key');
    if (storedKey) {
        setCustomKey(storedKey);
    }
  }, []);

  const saveSettings = () => {
    if (customKey.trim()) {
        localStorage.setItem('nur_custom_api_key', customKey.trim());
    } else {
        localStorage.removeItem('nur_custom_api_key');
    }
    setShowSettings(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoadingState(LoadingState.ANALYZING);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeQuranTopic(topic);
      setResult(data);
      setLoadingState(LoadingState.SUCCESS);
    } catch (err) {
      console.error(err);
      setError("We encountered an issue analyzing the Quran for this topic. Please try again or check your API key.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setTopic(''); setResult(null); setLoadingState(LoadingState.IDLE); }}>
            <div className="text-emerald-600">
              <BookIcon />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-emerald-950">Nur <span className="text-slate-400 font-normal">Quranic Search</span></h1>
          </div>
          
          <button 
            onClick={() => setShowSettings(true)}
            className="text-slate-400 hover:text-emerald-600 transition-colors p-2 rounded-full hover:bg-slate-100"
            title="Settings"
          >
            <SettingsIcon />
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">API Configuration</h3>
                    <p className="text-slate-500 text-sm mb-4">
                        Enter your own Gemini API key to use your personal quota. 
                        Your key is stored locally in your browser.
                    </p>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Gemini API Key</label>
                        <input 
                            type="password" 
                            value={customKey}
                            onChange={(e) => setCustomKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-sm"
                        />
                        <p className="text-xs text-slate-400">Leave blank to use the default system key.</p>
                    </div>
                </div>
                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3">
                    <button 
                        onClick={() => setShowSettings(false)}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={saveSettings}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-sm"
                    >
                        Save Key
                    </button>
                </div>
            </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Search Section */}
        <div className={`transition-all duration-500 ease-in-out ${result ? 'mb-8' : 'min-h-[60vh] flex flex-col justify-center items-center'}`}>
            
          {!result && (
            <div className="text-center mb-10 space-y-4 max-w-lg">
               <h2 className="text-4xl font-bold text-emerald-950 font-arabic">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</h2>
               <p className="text-slate-500">Enter a topic, emotion, or question. Nur will analyze the Holy Quran to find relevant verses, recitation, and meanings for you.</p>
            </div>
          )}

          <form onSubmit={handleSearch} className="w-full relative shadow-lg rounded-2xl group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
              <SearchIcon />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 rounded-2xl border-0 ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-lg transition-shadow"
              placeholder="e.g. Patience, Inheritance, Treatment of Parents..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loadingState === LoadingState.ANALYZING}
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
                <button 
                    type="submit"
                    disabled={!topic.trim() || loadingState === LoadingState.ANALYZING}
                    className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loadingState === LoadingState.ANALYZING ? <SpinnerIcon /> : "Search"}
                </button>
            </div>
          </form>

          {/* Loading Indicator */}
          {loadingState === LoadingState.ANALYZING && (
             <div className="mt-12 text-center space-y-4 animate-pulse">
                <div className="inline-block p-4 rounded-full bg-emerald-50 text-emerald-600 mb-2">
                    <BookIcon />
                </div>
                <h3 className="text-xl font-medium text-slate-700">Reflecting on the Holy Quran...</h3>
                <p className="text-slate-500 max-w-md mx-auto">Analyzing verses related to "{topic}". This requires deep contemplation and may take a moment.</p>
             </div>
          )}
        </div>

        {/* Error State */}
        {loadingState === LoadingState.ERROR && (
           <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
              <p>{error}</p>
           </div>
        )}

        {/* Results Section */}
        {loadingState === LoadingState.SUCCESS && result && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-3xl p-8 text-white shadow-xl">
               <h2 className="text-2xl font-bold mb-4 border-b border-emerald-700 pb-2">Guidance on: {result.topic}</h2>
               <p className="text-emerald-50 leading-relaxed opacity-90">{result.summary}</p>
            </div>

            <div className="flex items-center gap-4 my-8">
               <div className="h-px bg-slate-200 flex-1"></div>
               <span className="text-slate-400 text-sm font-medium uppercase tracking-widest">Relevant Verses</span>
               <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            {/* Verses List */}
            <div className="space-y-6">
              {result.verses.map((verse, index) => (
                <ResultCard key={`${verse.surahNumber}-${verse.ayahNumber}-${index}`} verse={verse} />
              ))}
            </div>

            <div className="text-center pt-10 pb-20 text-slate-400 text-sm">
                <p>AI generated content. Please verify with a scholar for critical religious matters.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;