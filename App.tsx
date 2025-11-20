import React, { useState, useCallback } from 'react';
import { Search, BrainCircuit, Sparkles, ArrowRight, LayoutDashboard, FileText } from 'lucide-react';
import { gatherAndEnhance, generateAnalytics } from './services/geminiService';
import { AgentStatus, ResearchResult } from './types';
import { Loader } from './components/Loader';
import { AnalyticsCharts } from './components/Charts';
import { SourceList } from './components/SourceList';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<AgentStatus>(AgentStatus.IDLE);
  const [result, setResult] = useState<ResearchResult | null>(null);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setStatus(AgentStatus.SEARCHING);
    setResult(null);

    try {
      // Step 1: Gather and Enhance
      const { text, groundingChunks } = await gatherAndEnhance(query);
      
      setStatus(AgentStatus.ANALYZING);

      // Step 2: Analyze
      const analytics = await generateAnalytics(text);

      // Split text into summary and body if possible (based on our prompt structure)
      // Our prompt asks for SECTION 1 and SECTION 2.
      const parts = text.split('SECTION 2:');
      const summaryRaw = parts[0]?.replace('SECTION 1:', '').replace('EXECUTIVE SUMMARY', '').trim();
      const enhancedContent = parts[1]?.replace('ENHANCED DEEP DIVE', '').trim() || text;

      setResult({
        summary: summaryRaw,
        enhancedContent: enhancedContent,
        groundingChunks,
        analytics
      });

      setStatus(AgentStatus.COMPLETED);
    } catch (error) {
      console.error(error);
      setStatus(AgentStatus.ERROR);
    }
  }, [query]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Intellect<span className="text-blue-400">Node</span>
            </span>
          </div>
          <div className="text-xs font-medium text-slate-500 border border-slate-800 px-3 py-1 rounded-full">
            v1.0.0 • Powered by Gemini 2.5
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Search / Input Section */}
        <section className={`transition-all duration-500 ease-in-out ${result ? 'mb-8' : 'mb-0 min-h-[60vh] flex flex-col justify-center'}`}>
          <div className={`max-w-2xl mx-auto text-center ${result ? 'hidden' : 'block'}`}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              What shall we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">master</span> today?
            </h1>
            <p className="text-slate-400 mb-10 text-lg">
              Enter a topic. I will gather resources, study them, enhance the clarity, and present detailed analytics.
            </p>
          </div>

          <div className="max-w-3xl mx-auto w-full relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-30 group-hover:opacity-50 transition duration-500 blur"></div>
            <form onSubmit={handleSearch} className="relative flex bg-slate-900 rounded-xl p-2 items-center border border-slate-700 shadow-2xl">
              <Search className="w-6 h-6 text-slate-500 ml-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Quantum computing, History of Jazz, React 19 features..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 px-4 py-3 text-lg outline-none"
                disabled={status === AgentStatus.SEARCHING || status === AgentStatus.ANALYZING}
              />
              <button
                type="button" // Change to submit if you want enter key to work, but button click is safe
                onClick={() => handleSearch()}
                disabled={!query || status === AgentStatus.SEARCHING || status === AgentStatus.ANALYZING}
                className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-lg transition-colors border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </section>

        {/* Loading State */}
        {(status === AgentStatus.SEARCHING || status === AgentStatus.ANALYZING) && (
          <Loader status={status === AgentStatus.SEARCHING ? "Gathering global resources..." : "Enhancing & Analyzing data..."} />
        )}

        {/* Error State */}
        {status === AgentStatus.ERROR && (
          <div className="text-center py-20 text-red-400">
            <p>Something went wrong during the research process. Please try again.</p>
          </div>
        )}

        {/* Results Dashboard */}
        {status === AgentStatus.COMPLETED && result && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 space-y-8">
            
            {/* Top Row: Summary & Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Left: Summary Card */}
              <div className="xl:col-span-1 bg-slate-800/30 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700/50">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <h2 className="font-semibold text-white">Executive Summary</h2>
                </div>
                <div className="prose prose-invert prose-sm text-slate-300 flex-1 leading-relaxed">
                  {result.summary}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-500">
                  <span>Reading time: {result.analytics.readingTimeMinutes} min</span>
                  <span className={`px-2 py-1 rounded bg-slate-800 border ${
                    result.analytics.sentiment > 60 ? 'border-green-500/30 text-green-400' : 
                    result.analytics.sentiment < 40 ? 'border-red-500/30 text-red-400' : 
                    'border-slate-600 text-slate-400'
                  }`}>
                    {result.analytics.sentiment > 60 ? 'Positive Tone' : result.analytics.sentiment < 40 ? 'Critical Tone' : 'Neutral Tone'}
                  </span>
                </div>
              </div>

              {/* Right: Analytics Visualization */}
              <div className="xl:col-span-2">
                 <div className="flex items-center gap-2 mb-4">
                  <LayoutDashboard className="w-5 h-5 text-purple-400" />
                  <h2 className="font-semibold text-white">Structural Analytics</h2>
                </div>
                <AnalyticsCharts data={result.analytics} />
              </div>
            </div>

            {/* Bottom Row: Deep Dive Content */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
               <div className="flex items-center gap-2 mb-6">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <h2 className="font-semibold text-white text-xl">Enhanced Deep Dive</h2>
                </div>
              
              <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-loose">
                {/* Rendering standard text with simple whitespace handling. For real markdown, we'd use a library, but standard text with bullets works well here. */}
                <div className="whitespace-pre-wrap">
                  {result.enhancedContent}
                </div>
              </div>

              <SourceList chunks={result.groundingChunks} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;