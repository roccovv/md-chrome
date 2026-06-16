import { Settings, SearchEngine } from './types';

/**
 * 从 URL 提取域名并生成 Favicon.im API 地址
 * @param url 网站 URL
 * @param larger 是否使用高清版本（最大 256px）
 * @returns Favicon.im API URL
 */
export const getLogoUrl = (url: string, larger: boolean = true): string => {
  try {
    const hostname = new URL(url).hostname;
    return larger
      ? `https://favicon.im/${hostname}?larger=true`
      : `https://favicon.im/${hostname}`;
  } catch (e) {
    // URL 解析失败，返回空字符串
    return '';
  }
};

const DEFAULT_SEARCH_ENGINES: SearchEngine[] = [
  {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    placeholder: '在 Bing 上搜索'
  },
  {
    name: '百度',
    url: 'https://www.baidu.com/s?wd=',
    placeholder: '百度一下'
  },
  {
    name: '搜狗',
    url: 'https://www.sogou.com/web?query=',
    placeholder: '搜狗搜索'
  },
  {
    name: '360搜索',
    url: 'https://www.so.com/s?q=',
    placeholder: '360搜索'
  },
  {
    name: '必应中国',
    url: 'https://cn.bing.com/search?q=',
    placeholder: '必应搜索'
  },
  {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    placeholder: 'Search Google'
  }
];

const DEFAULT_SETTINGS: Settings = {
  wallpaper: {
    type: 'default',
    color: '#1a1a2e'
  },
  searchEngine: DEFAULT_SEARCH_ENGINES[0],
  customSearchEngines: [],
  blurLevel: 2, // 默认轻微模糊
  weatherCity: '深圳', // 默认城市
  aiTools: [
    {
      id: '1',
      name: '豆包',
      url: 'https://www.doubao.com',
      icon: 'https://favicon.im/www.doubao.com?larger=true'
    },
    {
      id: '2',
      name: 'DeepSeek',
      url: 'https://chat.deepseek.com',
      icon: 'https://favicon.im/chat.deepseek.com?larger=true'
    },
    {
      id: '3',
      name: '文心一言',
      url: 'https://yiyan.baidu.com',
      icon: 'https://favicon.im/yiyan.baidu.com?larger=true'
    },
    {
      id: '4',
      name: '通义千问',
      url: 'https://www.qianwen.com',
      icon: 'https://favicon.im/www.qianwen.com?larger=true'
    }
  ],
  quickLinks: [
    {
      id: '1',
      title: '小红书',
      url: 'https://www.xiaohongshu.com',
      icon: 'https://favicon.im/www.xiaohongshu.com?larger=true'
    },
    {
      id: '2',
      title: '微博',
      url: 'https://weibo.com',
      icon: 'https://favicon.im/weibo.com?larger=true'
    },
    {
      id: '3',
      title: 'GitHub',
      url: 'https://github.com',
      icon: 'https://favicon.im/github.com?larger=true'
    }
  ]
};

export const getSettings = async (): Promise<Settings> => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    // 使用 local storage 而不是 sync，因为图片 Base64 可能很大
    const result = await chrome.storage.local.get('settings');
    return result.settings || DEFAULT_SETTINGS;
  }
  const stored = localStorage.getItem('settings');
  return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    try {
      // 使用 local storage 而不是 sync，避免大小限制
      await chrome.storage.local.set({ settings });
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      // 如果 Base64 图片太大，提示用户使用图片 URL
      if (error instanceof Error && error.message.includes('quota')) {
        alert('图片文件过大，请使用图片网址或选择更小的图片');
      }
    }
  } else {
    localStorage.setItem('settings', JSON.stringify(settings));
  }
};

export { DEFAULT_SEARCH_ENGINES };
