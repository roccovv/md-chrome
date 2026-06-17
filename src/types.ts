export interface Wallpaper {
  type: 'default' | 'custom' | 'color';
  url?: string;
  color?: string;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

export interface AITool {
  id: string;
  name: string;
  url: string;
  icon: string;
}

export interface SearchEngine {
  name: string;
  url: string;
  placeholder: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface StickyNote {
  id: string;
  title: string;
  content?: string; // 自由文本内容
  todos: TodoItem[];
  position: { x: number; y: number };
  color: 'yellow' | 'pink' | 'blue' | 'green' | 'purple';
  zIndex: number;
  createdAt: number;
  updatedAt: number;
  textColor?: string; // 文本颜色
  fontSize?: 'small' | 'medium' | 'large'; // 字号
}

export interface Settings {
  wallpaper: Wallpaper;
  searchEngine: SearchEngine;
  quickLinks: QuickLink[];
  customSearchEngines?: SearchEngine[];
  blurLevel?: number; // 0-20, 背景模糊程度
  aiTools?: AITool[];
  weatherCity?: string; // 天气城市
  stickyNotes?: StickyNote[];
}
