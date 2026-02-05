
import { GoogleGenAI, Type } from "@google/genai";
import { Item, Entity } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGodotCode = async (
  feature: string,
  inventory: Item[],
  entities: Entity[],
  dimension: '2D' | '3D' = '2D'
) => {
  const prompt = `
    Generate production-ready Godot 4.6 stable GDScript for a survival RPG (Last Day on Earth style).
    Environment: macOS 10.15.8 Desktop (Intel Graphics).
    Dimension: ${dimension}.
    Renderer Target: gl_compatibility (OpenGL 3.3).
    Objective: ${feature}.
    
    CRITICAL ARCHITECTURE RULES TO FIX PARSE ERRORS:
    1. GLOBAL CLASSES: Every manager script MUST begin with 'class_name [Name]' (e.g., 'class_name SaveManager', 'class_name InventoryManager').
    2. TYPE HINTS: When referencing global classes as types (e.g., 'var manager: InventoryManager'), ensure the class_name is defined in the target script. 
    3. CIRCULAR DEPENDENCIES: To avoid "Identifier not declared" errors during project load, if Script A uses Script B and Script B uses Script A, use 'get_node()' or 'find_child()' instead of static type hints for one of the references.
    4. SYNTAX: Use GDScript 2.0. Use '@onready var', '@export var', and 'move_and_slide()' (no arguments).
    5. CLASS REGISTRATION: Explain in comments that the user might need to click "Project -> Reload Current Project" in Godot if classes aren't recognized immediately.
    
    REQUIRED FILE STRUCTURE (MUST INCLUDE THESE NAMES):
    - scripts/save_manager.gd (starts with: class_name SaveManager)
    - scripts/inventory_manager.gd (starts with: class_name InventoryManager)
    - scripts/player_controller.gd (references SaveManager and InventoryManager)
    - scripts/vital_stats.gd (starts with: class_name VitalStats)
    
    Output Format: Return valid JSON with a "files" array containing { "path": "path/to/file.gd", "content": "source code string" }.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
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

    return JSON.parse(response.text.trim());
  } catch (error: any) {
    console.error("Gemini Project Architect Failed:", error);
    throw error;
  }
};

export const getSurvivalTips = async (health: number, hunger: number, thirst: number) => {
  return "System Ready. Project architect standing by for full build.";
};
