
import React from 'react';
import GodotExporter from './components/GodotExporter';
import { 
  Sword, 
  Scroll,
  Cpu,
  Shield,
  Zap
} from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0a09] text-stone-200">
      {/* Header */}
      <header className="bg-[#1c1917]/90 backdrop-blur-md border-b border-[#44403c] p-4 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="bg-amber-700 p-2.5 rounded-xl transform -rotate-2 shadow-xl shadow-amber-900/40">
              <Sword className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">OldSchool Architect</h1>
              <div className="flex items-center gap-2 text-[9px] uppercase font-black text-amber-600 mt-1">
                <Cpu className="w-3 h-3" />
                <span>Godot 3.5.3 GLES2 · Late 2012 Optimization</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden lg:flex items-center gap-4 bg-black px-4 py-2 rounded-xl border border-[#44403c]">
                <div className="flex flex-col items-end">
                   <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Renderer</span>
                   <span className="text-[10px] text-white font-bold uppercase tracking-tight">GLES 2.0 (Legacy)</span>
                </div>
                <div className="w-[1px] h-6 bg-[#44403c]"></div>
                <Zap className="text-amber-500 w-4 h-4 animate-pulse" />
             </div>
             <Shield className="text-stone-800 w-6 h-6 hover:text-amber-700 transition-colors" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-8 pb-20">
        <GodotExporter />
      </main>

      {/* Footer */}
      <footer className="bg-[#1c1917] border-t border-[#44403c] p-3 fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
          <div className="flex items-center gap-6 font-mono text-[9px] font-bold text-stone-600 uppercase tracking-widest">
            <span className="flex items-center gap-2 text-amber-800"><div className="w-1.5 h-1.5 rounded-full bg-amber-800 animate-pulse"></div> ARCHIVE_STABLE</span>
            <span>INTEL_HD_4000: COMPATIBLE</span>
            <span>OSX: 10.15_CATALINA</span>
          </div>
          <p className="text-[10px] uppercase font-black text-stone-700 tracking-[0.3em]">
            RPG Forge v3.0 / Godot 3.5.3
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
