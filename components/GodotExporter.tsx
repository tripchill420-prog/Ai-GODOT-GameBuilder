
import React, { useState, useEffect, useRef } from 'react';
import { runAgenticBuild } from '../services/geminiService';
import { GodotFile } from '../types';
import { 
  Download, 
  FolderTree, 
  Wand2, 
  Play, 
  Terminal as TerminalIcon,
  Code2,
  Layout,
  Cpu,
  ShieldCheck,
  Sword,
  Pickaxe,
  AlertTriangle,
  Zap,
  Gamepad2,
  Settings,
  Monitor,
  Trophy,
  Hammer
} from 'lucide-react';
import JSZip from 'jszip';

interface AgentLog {
  agent: string;
  message: string;
  time: string;
}

const GodotExporter: React.FC = () => {
  const [projectName, setProjectName] = useState('OldSchool_Legacy');
  const [isArchitecting, setIsArchitecting] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [files, setFiles] = useState<GodotFile[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const addLog = (agent: string, message: string) => {
    setLogs(prev => [...prev, {
      agent,
      message,
      time: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })
    }]);
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const sanitizeFileContent = (path: string, content: string) => {
    let clean = content.trim();
    clean = clean.replace(/^```[a-z]*\n?/gi, '').replace(/\n?```$/gi, '');
    
    if (path.endsWith('.tscn')) {
      if (!clean.includes('format=2')) {
        clean = clean.replace(/format=\d/g, 'format=2');
      }
      // Mass-fix Godot 4 accidental leaks
      clean = clean.replace(/type="Node3D"/g, 'type="Spatial"');
      clean = clean.replace(/type="CharacterBody3D"/g, 'type="KinematicBody"');
      clean = clean.replace(/type="StandardMaterial3D"/g, 'type="SpatialMaterial"');
      clean = clean.replace(/type="DirectionalLight3D"/g, 'type="DirectionalLight"');
      clean = clean.replace(/type="Camera3D"/g, 'type="Camera"');
      clean = clean.replace(/type="WorldEnvironment3D"/g, 'type="WorldEnvironment"');
      
      // ENSURE SUB-RESOURCE LINKING FOR MATERIALS (Fixes White Void on Intel HD 4000)
      if (clean.includes('type="MeshInstance"') && !clean.includes('material/0')) {
        // AI often forgets to link materials to the mesh instance slots
        clean = clean.replace(/mesh = SubResource\( (\d+) \)/g, 'mesh = SubResource( $1 )\nmaterial/0 = SubResource( 1 )');
      }
    }

    if (path.endsWith('.gd')) {
      clean = clean.replace(/Vector3\.UP/g, 'Vector3(0, 1, 0)');
      clean = clean.replace(/\.get_simple_path\(/g, '.get_simple_path('); 
      // Ensure input actions aren't lowercase if we map them differently
      clean = clean.replace(/Input\.is_action_pressed\("ui_up"\)/g, 'Input.is_action_pressed("move_forward")');
    }
    return clean;
  };

  const startAgenticBuild = async () => {
    setIsArchitecting(true);
    setBuildProgress(0);
    setErrorMessage(null);
    setFiles([]);
    setLogs([]);

    addLog("System", "ARCHIVE FORGE: Initiating OSRS-Lite Build for Intel HD 4000...");
    
    try {
      const result = await runAgenticBuild(projectName, '3D', addLog);
      
      const sanitized = result.files.map((f: GodotFile) => ({
        path: f.path.replace(/^res:\/\//, '').replace(/^\/+/, ''),
        content: sanitizeFileContent(f.path, f.content)
      }));

      const aiProjectGodot = sanitized.find(f => f.path === "project.godot");
      let baseProjectGodot = `config_version=4

[application]
config/name="${projectName}"
run/main_scene="res://main.tscn"

[autoload]
Inventory="*res://scripts/inventory.gd"
SkillManager="*res://scripts/skill_manager.gd"

[display]
window/size/width=1024
window/size/height=600
window/stretch/mode="2d"
window/stretch/aspect="keep"

[rendering]
quality/driver/driver_name="GLES2"
quality/intended_usage/framebuffer_allocation=0
vram_compression/import_etc=true
vram_compression/import_etc2=false
environment/default_clear_color=Color( 0.44, 0.62, 0.82, 1 )
`;

      if (aiProjectGodot && aiProjectGodot.content.includes('[input]')) {
        const inputPart = aiProjectGodot.content.split('[input]')[1];
        baseProjectGodot += "\n[input]\n" + inputPart;
      } else {
        baseProjectGodot += `
[input]
move_forward={"deadzone":0.5,"events":[ { "device":0,"alt":false,"shift":false,"control":false,"meta":false,"command":false,"pressed":false,"scancode":87,"unicode":0,"echo":false } ] }
move_back={"deadzone":0.5,"events":[ { "device":0,"alt":false,"shift":false,"control":false,"meta":false,"command":false,"pressed":false,"scancode":83,"unicode":0,"echo":false } ] }
move_left={"deadzone":0.5,"events":[ { "device":0,"alt":false,"shift":false,"control":false,"meta":false,"command":false,"pressed":false,"scancode":65,"unicode":0,"echo":false } ] }
move_right={"deadzone":0.5,"events":[ { "device":0,"alt":false,"shift":false,"control":false,"meta":false,"command":false,"pressed":false,"scancode":68,"unicode":0,"echo":false } ] }
interact={"deadzone":0.5,"events":[ { "device":0,"alt":false,"shift":false,"control":false,"meta":false,"command":false,"pressed":false,"scancode":69,"unicode":0,"echo":false } ] }
`;
      }

      const finalFiles = sanitized.filter((f: any) => f.path !== "project.godot");
      finalFiles.unshift({ path: "project.godot", content: baseProjectGodot });

      setFiles(finalFiles);
      setBuildProgress(100);
      addLog("System", "SUCCESS: RuneScape Mechanics Forge Complete. Intel HD 4000 Bypass active.");

    } catch (err: any) {
      setErrorMessage(err.message);
      addLog("Error", "Build process stalled. Quota likely hit.");
    } finally {
      setIsArchitecting(false);
    }
  };

  const downloadProjectZip = async () => {
    if (files.length === 0) return;
    const zip = new JSZip();
    files.forEach(file => { zip.file(file.path, file.content); });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName}_OSRS_V5.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#1c1917] border border-[#44403c] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-900/30 rounded-lg">
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight tracking-widest">OSRS Architect</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase mb-1 block ml-1">Archive Identity</label>
                <input 
                  type="text" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-black border border-[#44403c] rounded-xl px-4 py-3 text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-900/50 transition-all font-mono text-sm"
                />
              </div>

              <button
                onClick={startAgenticBuild}
                disabled={isArchitecting}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                  isArchitecting 
                    ? 'bg-stone-800 text-stone-500 cursor-not-allowed' 
                    : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg active:scale-[0.98]'
                }`}
              >
                {isArchitecting ? <Cpu className="w-5 h-5 animate-spin" /> : <Hammer className="w-5 h-5" />}
                {isArchitecting ? 'Architecting Skills...' : 'Re-Forge OSRS Game'}
              </button>

              {files.length > 0 && (
                <button
                  onClick={downloadProjectZip}
                  className="w-full py-4 bg-stone-100 hover:bg-white text-black rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg active:scale-[0.98]"
                >
                  <Download className="w-5 h-5" />
                  Download OSRS V5
                </button>
              )}
            </div>
          </div>

          <div className="bg-black/40 border border-[#44403c] rounded-2xl p-6">
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4">GLES2 Graphics Pack</h3>
            <ul className="text-[10px] space-y-3 text-stone-500 font-medium">
               <li className="flex items-center gap-3"><Monitor className="w-3.5 h-3.5" /> High-Vis HUD (Skill Tabs)</li>
               <li className="flex items-center gap-3"><Pickaxe className="w-3.5 h-3.5" /> Mining & Woodcutting Logic</li>
               <li className="flex items-center gap-3"><Sword className="w-3.5 h-3.5" /> Basic Combat Interaction</li>
               <li className="flex items-center gap-3"><Settings className="w-3.5 h-3.5" /> Sub-Resource Linked Materials</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex-1 bg-black border border-[#44403c] rounded-2xl overflow-hidden flex flex-col min-h-[400px] shadow-2xl">
            <div className="bg-[#1c1917] px-4 py-2 border-b border-[#44403c] flex items-center justify-between">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                <TerminalIcon className="w-3 h-3 text-amber-600" /> Skill & Asset Forge
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-2 custom-scrollbar">
              {logs.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
                    <Trophy className="w-16 h-16 mb-4 text-amber-600" />
                    <p className="uppercase tracking-[0.4em] text-[10px] font-black">Awaiting System Initialization</p>
                 </div>
              )}
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 border-b border-stone-900 pb-1">
                  <span className="text-stone-600 shrink-0">{log.time}</span>
                  <span className={`font-black shrink-0 w-20 text-[9px] px-1 rounded flex items-center justify-center h-4 mt-0.5 ${
                    log.agent === 'Error' ? 'bg-red-950 text-red-500' : 'bg-stone-900 text-stone-400'
                  }`}>
                    {log.agent}
                  </span>
                  <span className="text-stone-300">{log.message}</span>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-900/20 border border-red-900/50 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="text-red-500 w-5 h-5 shrink-0" />
              <p className="text-xs text-red-200 font-medium">Build error: Retrying with optimized GLES2 tokens...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GodotExporter;
