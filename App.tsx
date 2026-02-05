
import React from 'react';
import GodotExporter from './components/GodotExporter';
import { 
  Skull, 
  Terminal,
  Cpu,
  Monitor,
  Activity
} from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-200">
      {/* Header */}
      <header className="bg-stone-900/80 backdrop-blur-md border-b border-stone-800 p-4 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2.5 rounded-xl transform -rotate-3 shadow-xl shadow-blue-900/30">
              <Cpu className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">Wasteland RPG</h1>
              <div className="flex items-center gap-2 text-[9px] uppercase font-black text-stone-500 mt-1">
                <Monitor className="w-3 h-3" />
                <span>Godot 4.6 Bridge / Mac Mini Late Optimization</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden lg:flex items-center gap-4 bg-stone-950 px-4 py-2 rounded-xl border border-stone-800">
                <div className="flex flex-col items-end">
                   <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Engine Mode</span>
                   <span className="text-[10px] text-white font-bold uppercase tracking-tight">GL Compatibility</span>
                </div>
                <div className="w-[1px] h-6 bg-stone-800"></div>
                <Activity className="text-emerald-500 w-4 h-4 animate-pulse" />
             </div>
             <Skull className="text-stone-800 w-6 h-6 hover:text-red-900 transition-colors cursor-help" />
          </div>
        </div>
      </header>

      {/* Development Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-8 pb-20">
        <GodotExporter />
      </main>

      {/* Bottom Status Bar */}
      <footer className="bg-stone-900 border-t border-stone-800 p-3 fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
          <div className="flex items-center gap-6 font-mono text-[9px] font-bold text-stone-600 uppercase tracking-widest">
            <span className="flex items-center gap-2 text-emerald-800"><div className="w-1.5 h-1.5 rounded-full bg-emerald-800 animate-pulse"></div> SYST_ONLINE</span>
            <span>INTEL_HD_ACCEL: ON</span>
            <span>OS: MAC_10.15_STABLE</span>
          </div>
          <p className="text-[10px] uppercase font-black text-stone-700 tracking-[0.3em]">
            Architect v2.5 / Gemini 3
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
