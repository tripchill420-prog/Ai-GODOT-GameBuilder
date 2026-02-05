
export enum ResourceType {
  WOOD = 'WOOD',
  STONE = 'STONE',
  IRON = 'IRON',
  FOOD = 'FOOD',
  WATER = 'WATER'
}

export interface Item {
  id: string;
  name: string;
  type: 'RESOURCE' | 'TOOL' | 'WEAPON' | 'CONSUMABLE';
  quantity: number;
  icon: string;
}

export interface Entity {
  id: string;
  type: 'PLAYER' | 'ZOMBIE' | 'TREE' | 'ROCK';
  x: number;
  y: number;
  health: number;
  maxHealth: number;
}

export interface GameState {
  player: Entity;
  entities: Entity[];
  inventory: Item[];
  hunger: number;
  thirst: number;
  day: number;
  logs: string[];
}

export interface GodotFile {
  path: string;
  content: string;
}
