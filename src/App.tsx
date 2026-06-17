import { useState, useEffect } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import SearchBar from './components/SearchBar';
import QuickLinks from './components/QuickLinks';
import AITools from './components/AITools';
import SettingsPanel from './components/SettingsPanel';
import Weather from './components/Weather';
import StickyNotes from './components/StickyNotes';
import { Settings } from './types';
import { getSettings, saveSettings, DEFAULT_SEARCH_ENGINES } from './utils';

function App() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await getSettings();
    setSettings(savedSettings);
  };

  const handleSettingsChange = async (newSettings: Settings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  if (!settings) {
    return <div className="w-screen h-screen bg-gray-900" />;
  }

  const backgroundStyle = (() => {
    if (settings.wallpaper.type === 'custom' && settings.wallpaper.url) {
      return {
        backgroundImage: `url(${settings.wallpaper.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    if (settings.wallpaper.type === 'color' && settings.wallpaper.color) {
      return {
        backgroundColor: settings.wallpaper.color,
      };
    }
    return {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    };
  })();

  return (
    <div
      className="w-screen h-screen flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500"
      style={backgroundStyle}
    >
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/20 transition-all duration-300"
        style={{
          backdropFilter: `blur(${settings.blurLevel ?? 2}px)`,
          WebkitBackdropFilter: `blur(${settings.blurLevel ?? 2}px)`
        }}
      />

      {/* 右上角功能区 */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        {/* 天气组件 */}
        <Weather
          city={settings.weatherCity || '深圳'}
          onCityChange={(city) =>
            handleSettingsChange({ ...settings, weatherCity: city })
          }
        />

        {/* 设置按钮 */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all duration-200 text-white shadow-lg"
          aria-label="设置"
        >
          <SettingsIcon size={24} />
        </button>
      </div>

      {/* 主内容区 */}
      <div className="relative z-10 w-full max-w-4xl px-6 space-y-8">
        {/* 搜索区 */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-6">
            {new Date().getHours() < 12
              ? '早上好'
              : new Date().getHours() < 18
              ? '下午好'
              : '晚上好'}
          </h1>
          <SearchBar
            searchEngine={settings.searchEngine}
            allEngines={[...(settings.customSearchEngines || []), ...DEFAULT_SEARCH_ENGINES]}
            onEngineChange={(engine) => handleSettingsChange({ ...settings, searchEngine: engine })}
          />
        </div>

        {/* AI 工具区 */}
        <AITools
          tools={settings.aiTools || []}
          onToolsChange={(tools) =>
            handleSettingsChange({ ...settings, aiTools: tools })
          }
        />

        {/* 工具区 */}
        <QuickLinks
          links={settings.quickLinks}
          onLinksChange={(links) =>
            handleSettingsChange({ ...settings, quickLinks: links })
          }
        />
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 便利贴 */}
      <StickyNotes
        notes={settings.stickyNotes || []}
        onNotesChange={(notes) =>
          handleSettingsChange({ ...settings, stickyNotes: notes })
        }
      />
    </div>
  );
}

export default App;
