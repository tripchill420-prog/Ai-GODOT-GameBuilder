
import { GoogleGenAI, Type } from "@google/genai";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const runAgenticBuild = async (
  projectName: string,
  dimension: '2D' | '3D',
  onLog: (agent: string, message: string) => void
) => {
  const model = "gemini-3-flash-preview";

  const finalPrompt = `
    ACT AS: Senior Godot 3.5.3 (GLES2) Game Architect.
    TASK: Generate a feature-rich 3D RuneScape-style RPG optimized for Late 2012 Mac Mini (Intel HD 4000).
    
    CRITICAL COMPATIBILITY (GODOT 3.5.3):
    - NO Node3D, NO StandardMaterial3D, NO CharacterBody3D.
    - USE Spatial, KinematicBody, SpatialMaterial, format=2.
    - EVERY MESH MUST HAVE A MATERIAL LINKED TO 'material/0' TO PREVENT THE WHITE VOID BUG.
    - USE GLES2 compliant lighting: DirectionalLight + WorldEnvironment (Ambient Light).

    GAMEPLAY FEATURES:
    1. MOVEMENT: WASD + Arrows for movement. Right-click to rotate camera (Camera attached to a spatial gimbal).
    2. INTERACTION: 'E' or 'Click' to interact with resource nodes.
    3. SKILLS SYSTEM (scripts/skill_manager.gd):
       - Tracks Attack, Strength, Mining, Woodcutting XP.
       - Leveling logic: XP = 83 * (2^(lvl/7) - 1).
    4. RESOURCE NODES:
       - Trees (Woodcutting): Disappear for 10s after being chopped, give Wood.
       - Rocks (Mining): Give Ore, turn grey for 5s while "depleted".
    5. COMBAT: Basic "Click to Attack" enemy logic for a simple Mob (KinematicBody).
    6. UI/HUD (ui/hud.tscn):
       - OSRS Style Layout: 
         - Top Left: Stat bars (HP, Prayer/Mana placeholder).
         - Bottom Right: Inventory (Grid of slots) and Skill Panel (Grid of levels).
         - Top Right: Minimap placeholder (Circular ColorRect).
    
    GRAPHICS OPTIMIZATION:
    - Use "low-poly" aesthetics with vibrant "flat" colors via SpatialMaterial.
    - Set 'albedo_color' explicitly for every sub_resource.
    - Use WorldEnvironment to set background color to a nice sky blue.

    FILES TO GENERATE:
    - project.godot: Full config + WASD input map + Autoloads (Inventory, SkillManager).
    - main.tscn: The World (Ground, 5 Trees, 5 Rocks, 1 Enemy, 1 Player).
    - scripts/player.gd: WASD logic + interaction + rotation.
    - scripts/enemy.gd: Basic roam logic.
    - scripts/resource_node.gd: Shared script for Mining/Woodcutting nodes.
    - scripts/skill_manager.gd: Singleton for XP.
    - scripts/inventory.gd: Singleton for items.
    - ui/hud.tscn: Complex layout with Tabs for Inventory/Skills.

    RETURN ONLY VALID JSON.
  `;

  const maxRetries = 2;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      if (attempt === 0) {
        onLog("Architect", "Designing OSRS Skill-Matrix & GLES2 Optimized Assets...");
        onLog("Programmer", "Implementing Woodcutting, Mining, and WASD Gimbal...");
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: model,
        contents: finalPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              files: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    path: { type: Type.STRING },
                    content: { type: Type.STRING }
                  },
                  required: ["path", "content"]
                }
              }
            },
            required: ["files"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from AI engine.");
      }

      onLog("Designer", "Verifying OSRS UI Anchors & Legacy Shader Compatibility...");
      return JSON.parse(text.trim());
    } catch (error: any) {
      console.error("Build Error:", error);
      const isQuotaError = error.message?.includes("429") || error.status === "RESOURCE_EXHAUSTED";
      
      if (isQuotaError && attempt < maxRetries) {
        attempt++;
        const backoff = 65000; 
        onLog("System", `Quota reached. Retrying in 65s (Attempt ${attempt}/${maxRetries})...`);
        await delay(backoff);
        continue;
      }
      throw error;
    }
  }
};
