
import React, { useState } from 'react';
import { generateGodotCode } from '../services/geminiService';
import { GodotFile } from '../types';
import { 
  Download, 
  FolderTree, 
  Settings, 
  FileCode, 
  Layers, 
  Rocket, 
  Check, 
  Trash2, 
  Cpu,
  ShieldAlert,
  Pickaxe,
  Home,
  Save,
  Moon,
  Zap,
  Activity,
  Wand2,
  BoxSelect,
  Laptop,
  Play,
  AlertCircle,
  HelpCircle,
  RefreshCcw
} from 'lucide-react';
import JSZip from 'jszip';

const getProjectGodot = (name: string) => `config_version=5

[application]
config/name="${name || 'WastelandRPG'}"
run/main_scene="res://main.tscn"
config/features=PackedStringArray("4.6", "GL Compatibility")

[display]
window/size/viewport_width=1280
window/size/viewport_height=720
window/size/resizable=true
window/stretch/mode="canvas_items"

[input]
move_forward={ "deadzone": 0.5, "events": [ { "class": "InputEventKey", "keycode": 87 } ] }
move_backward={ "deadzone": 0.5, "events": [ { "class": "InputEventKey", "keycode": 83 } ] }
move_left={ "deadzone": 0.5, "events": [ { "class": "InputEventKey", "keycode": 65 } ] }
move_right={ "deadzone": 0.5, "events": [ { "class": "InputEventKey", "keycode": 68 } ] }
interact={ "deadzone": 0.5, "events": [ { "class": "InputEventKey", "keycode": 69 } ] }
action={ "deadzone": 0.5, "events": [ { "class": "InputEventMouseButton", "button_index": 1 } ] }
inventory={ "deadzone": 0.5, "events": [ { "class": "InputEventKey", "keycode": 73 } ] }

[rendering]
renderer/rendering_method="gl_compatibility"
renderer/rendering_method.mobile="gl_compatibility"
textures/vram_compression/import_etc2_astc=true
viewport/transparent_background=true
`;

const getMainTscn = (is3D: boolean) => is3D ? `[gd_scene load_steps=2 format=3 uid="uid://main"]

[node name="World3D" type="Node3D"]

[node name="DirectionalLight3D" type="DirectionalLight3D" parent="."]
transform = Transform3D(1, 0, 0, 0, 0.707107, 0.707107, 0, -0.707107, 0.707107, 0, 5, 0)
shadow_enabled = true

[node name="Player" type="CharacterBody3D" parent="."]
transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0)

[node name="Camera3D" type="Camera3D" parent="Player"]
transform = Transform3D(1, 0, 0, 0, 0.5, 0.866025, 0, -0.866025, 0.5, 0, 10, 5)

[node name="Ground" type="CSGBox3D" parent="."]
use_collision = true
size = Vector3(100, 0.1, 100)
` : `[gd_scene load_steps=1 format=3 uid="uid://main"]

[node name="World2D" type="Node2D"]

[node name="Player" type="CharacterBody2D" parent="."]
position = Vector2(640, 360)

[node name="Camera2D" type="Camera2D" parent="Player"]
position_smoothing_enabled = true
`;

const GodotExporter: React.FC = () => {
  const [projectName, setProjectName] = useState('MyFullSurvivalRPG');
  const [isArchitecting, setIsArchitecting] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [zipping, setZipping] = useState(false);
  const [dimension, setDimension] = useState<'2D' | '3D'>('3D');
  const [files, setFiles] = useState<GodotFile[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const buildFullGame = async () => {
    setIsArchitecting(true);
    setBuildProgress(0);
    setErrorMessage(null);
    setFiles([]);

    const coreFiles: GodotFile[] = [
      { path: "project.godot", content: getProjectGodot(projectName) },
      { path: "main.tscn", content: getMainTscn(dimension === '3D') }
    ];

    try {
      setStatusText('Architecting Global Managers (Save & Inventory)...');
      setBuildProgress(20);
      const coreResult = await generateGodotCode(
        `CORE MANAGERS: Create 'SaveManager' and 'InventoryManager' using 'class_name' for global access. Include basic item data structures. Target: Godot 4.6.`, 
        [], [], dimension
      );
      
      setStatusText('Designing Player Controller & Survival Systems...');
      setBuildProgress(50);
      const logicResult = await generateGodotCode(
        `PLAYER & STATS: Create a complete Player Controller that interacts with the global InventoryManager and a 'VitalStats' class. Use WASD movement. Target: Godot 4.6.`, 
        [], [], dimension
      );

      setStatusText('Designing UI & Interaction Logic...');
      setBuildProgress(80);
      const uiResult = await generateGodotCode(
        `UI & INTERACTION: Create an Inventory UI that references the global InventoryManager type and a HUD for Vitals. Include simple Enemy AI. Target: Godot 4.6.`, 
        [], [], dimension
      );

      const allGeneratedFiles = [...coreResult.files, ...logicResult.files, ...uiResult.files];
      
      setFiles(() => {
        let merged = [...allGeneratedFiles];
        coreFiles.forEach(cf => {
          const idx = merged.findIndex(f => f.path === cf.path);
          if (idx === -1) merged.unshift(cf);
          else merged[idx] = cf;
        });
        return merged;
      });

      setBuildProgress(100);
      setStatusText('Full Survival Architecture Generated!');

    } catch (err: any) {
      console.error("Architecting failed", err);
      setErrorMessage("Architectural Error: " + (err.message || "Project generation failed. Check API key."));
    } finally {
      setIsArchitecting(false);
    }
  };

  const downloadProjectZip = async () => {
    if (files.length === 0) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      files.forEach(file => {
        zip.file(file.path, file.content);
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName}_Godot46_Complete.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP creation failed", err);
    } finally {
      setZipping(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-stone-900/50 border border-stone-800 rounded-2xl p-8 space-y-8 shadow-2xl">
          <div className="flex items-center justify-between border-b border-stone-800 pb-6">
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <Wand2 className="w-6 h-6 text-blue-500" /> Full Game Architect
              </h2>
              <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-1">
                Godot 4.6 Cross-Script Reference Optimization
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-stone-950 p-1.5 rounded-xl border border-stone-800">
               <button 
                onClick={() => setDimension('3D')}
                className={`px-6 py-2 rounded-lg text-[10px] font-black transition-all ${dimension === '3D' ? 'bg-blue-600 text-white shadow-lg' : 'text-stone-500 hover:text-stone-300'}`}
               >
                 3D
               </button>
               <button 
                onClick={() => setDimension('2D')}
                className={`px-6 py-2 rounded-lg text-[10px] font-black transition-all ${dimension === '2D' ? 'bg-blue-600 text-white shadow-lg' : 'text-stone-500 hover:text-stone-300'}`}
               >
                 2D ISO
               </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-stone-950/50 border border-stone-800 p-6 rounded-2xl flex items-center justify-between gap-8 group hover:border-blue-600/30 transition-all">
              <div className="flex-1">
                <h3 className="text-white font-black text-sm uppercase mb-1">Project Identity</h3>
                <input 
                  type="text" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  className="bg-transparent border-none text-blue-400 font-mono text-xl focus:ring-0 w-full p-0"
                  placeholder="Enter Project Name..."
                />
              </div>
            </div>

            <div className="bg-blue-900/10 border border-blue-800/30 p-4 rounded-xl flex items-start gap-4">
               <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
               <p className="text-[10px] text-blue-200/70 leading-relaxed font-medium">
                 <strong className="text-blue-400">PATCH APPLIED:</strong> We now enforce <code className="bg-blue-900/40 px-1 rounded">class_name</code> globally. If you see <code className="text-red-400">"Identifier not declared"</code> in Godot, please go to <strong className="text-white">Project -> Reload Current Project</strong>. This forces Godot to re-scan the class database.
               </p>
            </div>

            {errorMessage && (
              <div className="bg-red-900/20 border border-red-800/50 p-4 rounded-xl flex items-center gap-4 text-red-400">
                <ShieldAlert className="w-6 h-6 shrink-0" />
                <p className="text-xs font-bold uppercase">{errorMessage}</p>
              </div>
            )}

            {!files.length && !isArchitecting ? (
              <button 
                onClick={buildFullGame}
                className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg uppercase tracking-[0.2em] shadow-[0_0_50px_rgba(37,99,235,0.2)] transition-all flex items-center justify-center gap-4 active:scale-[0.98]"
              >
                <Play className="w-6 h-6 fill-current" />
                Build Full RPG Project
              </button>
            ) : isArchitecting ? (
              <div className="bg-stone-950 p-8 rounded-2xl border border-stone-800 space-y-6">
                 <div className="flex justify-between items-end">
                    <div className="space-y-1">
                       <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest animate-pulse">Gemini 3 Pro Architecting</span>
                       <h4 className="text-white font-black text-sm uppercase">{statusText}</h4>
                    </div>
                    <span className="text-xl font-mono text-blue-400 font-bold">{buildProgress}%</span>
                 </div>
                 <div className="h-2 w-full bg-stone-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-500 shadow-[0_0_15px_rgba(37,99,235,0.5)]" 
                      style={{ width: `${buildProgress}%` }}
                    />
                 </div>
              </div>
            ) : (
              <div className="flex gap-4">
                 <button 
                    onClick={buildFullGame}
                    className="flex-1 py-5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border border-stone-700"
                 >
                    Re-Architect
                 </button>
                 <button 
                    onClick={downloadProjectZip}
                    disabled={zipping}
                    className="flex-[2] py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-4"
                 >
                    {zipping ? <Activity className="animate-spin w-5 h-5" /> : <Download className="w-5 h-5" />}
                    Download Complete Game (.ZIP)
                 </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6 flex-1 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
                <FolderTree className="w-4 h-4" /> Manifest
              </h3>
              {files.length > 0 && (
                <span className="text-[10px] font-mono bg-blue-600/10 text-blue-400 px-2 py-0.5 rounded border border-blue-600/20">
                  {files.length} FILES
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar max-h-[400px]">
              {files.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-800 opacity-30 text-center px-8">
                  <FileCode className="w-16 h-16 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Architecture</p>
                </div>
              ) : (
                files.map((file) => (
                  <div key={file.path} className="group flex items-center justify-between p-3 bg-stone-950 border border-stone-800 rounded-xl hover:border-blue-600/50 transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="shrink-0 p-1.5 bg-stone-900 rounded-lg">
                        {file.path.endsWith('.gd') ? <FileCode className="w-4 h-4 text-orange-500" /> : 
                         file.path.endsWith('.tscn') ? <Layers className="w-4 h-4 text-blue-400" /> : 
                         <Settings className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-mono text-stone-300 truncate">{file.path}</p>
                        <p className="text-[8px] font-bold text-stone-600 uppercase tracking-tighter">
                          {Math.ceil(file.content.length / 1024)} KB Source
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Troubleshooting Section */}
          <div className="bg-stone-900/80 border border-orange-900/30 rounded-2xl p-6 shadow-xl">
             <div className="flex items-center gap-3 mb-4">
                <HelpCircle className="w-5 h-5 text-orange-500" />
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Fixing Parse Errors</h4>
             </div>
             <div className="space-y-4">
                <div className="flex gap-3">
                   <div className="shrink-0 p-1 bg-orange-500/10 rounded text-orange-500"><RefreshCcw className="w-3 h-3" /></div>
                   <p className="text-[9px] text-stone-400 leading-relaxed font-medium">
                     If Godot says <code className="text-orange-300">"Identifier not declared"</code>, use <strong className="text-white">Project -> Reload Current Project</strong>.
                   </p>
                </div>
                <div className="flex gap-3">
                   <div className="shrink-0 p-1 bg-blue-500/10 rounded text-blue-500"><Check className="w-3 h-3" /></div>
                   <p className="text-[9px] text-stone-400 leading-relaxed font-medium">
                     Ensure <code className="text-blue-300">save_manager.gd</code> and <code className="text-blue-300">inventory_manager.gd</code> are at the top of your file list.
                   </p>
                </div>
             </div>
          </div>

          <div className="bg-blue-600/5 border border-blue-600/20 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-4">
                <Laptop className="w-5 h-5 text-blue-400" />
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Mac Deployment</h4>
             </div>
             <div className="space-y-3">
                <GuideStep num="01" text="Extract ZIP and Import to Godot 4.6." />
                <GuideStep num="02" text="Global Managers will auto-register via class_name." />
                <GuideStep num="03" text="CMD+R to run your full RPG." />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GuideStep: React.FC<{num: string, text: string}> = ({num, text}) => (
  <div className="flex gap-3">
    <span className="text-[10px] font-black text-blue-500">{num}</span>
    <p className="text-[10px] text-stone-400 font-medium leading-relaxed">{text}</p>
  </div>
);

export default GodotExporter;
