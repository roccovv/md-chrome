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

export interface Settings {
  wallpaper: Wallpaper;
  searchEngine: SearchEngine;
  quickLinks: QuickLink[];
  customSearchEngines?: SearchEngine[];
  blurLevel?: number; // 0-20, 背景模糊程度
  aiTools?: AITool[];
}
