import { X, Image, Palette, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Settings } from '../types';
import { DEFAULT_SEARCH_ENGINES } from '../utils';

interface SettingsPanelProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onClose: () => void;
}

export default function SettingsPanel({
  settings,
  onSettingsChange,
  onClose,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'wallpaper' | 'blur' | 'search'>('wallpaper');
  const [customUrl, setCustomUrl] = useState(settings.wallpaper.url || '');
  const [customColor, setCustomColor] = useState(settings.wallpaper.color || '#1a1a2e');
  const [showAddEngine, setShowAddEngine] = useState(false);
  const [newEngine, setNewEngine] = useState({ name: '', url: '', placeholder: '' });
  const [isApplying, setIsApplying] = useState(false);

  const handleWallpaperType = (type: 'default' | 'custom' | 'color') => {
    if (type === 'custom') {
      onSettingsChange({
        ...settings,
        wallpaper: { type, url: customUrl },
      });
    } else if (type === 'color') {
      onSettingsChange({
        ...settings,
        wallpaper: { type, color: customColor },
      });
    } else {
      onSettingsChange({
        ...settings,
        wallpaper: { type },
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 检查文件大小（限制为 10MB）
      if (file.size > 10 * 1024 * 1024) {
        alert('❌ 图片文件过大，请选择小于 10MB 的图片');
        return;
      }

      setIsApplying(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const url = event.target?.result as string;
          setCustomUrl(url);
          // 自动应用上传的图片
          const newSettings = {
            ...settings,
            wallpaper: { type: 'custom' as const, url },
          };
          await onSettingsChange(newSettings);

          // 显示成功提示
          const message = document.createElement('div');
          message.textContent = '✅ 壁纸上传成功！';
          message.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; z-index: 9999; font-weight: 500; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
          document.body.appendChild(message);
          setTimeout(() => message.remove(), 2000);
        } catch (error) {
          alert('❌ 壁纸保存失败，请重试或选择更小的图片');
        } finally {
          setIsApplying(false);
        }
      };
      reader.onerror = () => {
        alert('❌ 图片读取失败，请重试');
        setIsApplying(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomUrlApply = async () => {
    if (customUrl.trim()) {
      setIsApplying(true);
      try {
        await onSettingsChange({
          ...settings,
          wallpaper: { type: 'custom', url: customUrl },
        });

        // 显示成功提示
        const message = document.createElement('div');
        message.textContent = '✅ 壁纸应用成功！';
        message.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; z-index: 9999; font-weight: 500; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 2000);
      } catch (error) {
        alert('❌ 壁纸应用失败，请检查网址是否正确');
      } finally {
        setIsApplying(false);
      }
    }
  };

  const handleAddEngine = () => {
    if (newEngine.name && newEngine.url && newEngine.placeholder) {
      const customEngines = settings.customSearchEngines || [];
      onSettingsChange({
        ...settings,
        customSearchEngines: [...customEngines, newEngine],
      });
      setNewEngine({ name: '', url: '', placeholder: '' });
      setShowAddEngine(false);
    }
  };

  const handleDeleteEngine = (engineName: string) => {
    const customEngines = settings.customSearchEngines || [];
    onSettingsChange({
      ...settings,
      customSearchEngines: customEngines.filter(e => e.name !== engineName),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30">
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">设置</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 标签页 */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('wallpaper')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === 'wallpaper'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            壁纸设置
          </button>
          <button
            onClick={() => setActiveTab('blur')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === 'blur'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            模糊控制
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === 'search'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            搜索引擎
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'wallpaper' && (
            <div className="space-y-6">
              {/* 默认渐变 */}
              <div
                onClick={() => handleWallpaperType('default')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                  settings.wallpaper.type === 'default'
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600" />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <Palette size={20} />
                      默认渐变
                    </div>
                    <div className="text-sm text-gray-600">使用系统默认渐变背景</div>
                  </div>
                </div>
              </div>

              {/* 纯色背景 */}
              <div
                className={`p-4 rounded-xl border-2 transition-all ${
                  settings.wallpaper.type === 'color'
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div
                    className="w-20 h-20 rounded-lg border-2 border-gray-300"
                    style={{ backgroundColor: customColor }}
                  />
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      <Palette size={20} />
                      纯色背景
                    </div>
                    <div className="text-sm text-gray-600">选择你喜欢的颜色</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      onSettingsChange({
                        ...settings,
                        wallpaper: { type: 'color', color: e.target.value },
                      });
                    }}
                    className="h-10 w-20 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#1a1a2e"
                  />
                  <button
                    onClick={() => handleWallpaperType('color')}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    应用
                  </button>
                </div>
              </div>

              {/* 自定义图片 */}
              <div
                className={`p-4 rounded-xl border-2 transition-all ${
                  settings.wallpaper.type === 'custom'
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200'
                }`}
              >
                <div className="font-medium flex items-center gap-2 mb-3">
                  <Image size={20} />
                  自定义壁纸
                </div>

                {/* 当前壁纸预览 */}
                {settings.wallpaper.type === 'custom' && settings.wallpaper.url && (
                  <div className="mb-3">
                    <div className="text-sm text-gray-600 mb-2">当前壁纸预览：</div>
                    <div
                      className="w-full h-32 rounded-lg border-2 border-gray-300 bg-cover bg-center"
                      style={{ backgroundImage: `url(${settings.wallpaper.url})` }}
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">图片网址：</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCustomUrlApply()}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleCustomUrlApply}
                        disabled={!customUrl.trim() || isApplying}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      >
                        {isApplying ? '应用中...' : '应用'}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="text-center text-sm text-gray-500 mb-2">或</div>
                    <label className={`block w-full px-4 py-3 ${isApplying ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'} text-white text-center rounded-lg transition-colors font-medium`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isApplying}
                        className="hidden"
                      />
                      {isApplying ? '⏳ 上传中...' : '📁 上传本地图片'}
                    </label>
                    <div className="text-xs text-gray-500 text-center mt-1">支持 JPG、PNG、GIF 格式，最大 10MB</div>
                    <div className="text-xs text-blue-600 text-center mt-1">💡 提示：推荐使用图片网址以获得更好的性能</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blur' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border-2 border-gray-200">
                <div className="font-medium text-lg mb-4">背景模糊控制</div>

                {/* 预览区 */}
                <div className="mb-6">
                  <div className="text-sm text-gray-600 mb-2">实时预览：</div>
                  <div
                    className="w-full h-32 rounded-lg border-2 border-gray-300 relative overflow-hidden"
                    style={
                      settings.wallpaper.type === 'custom' && settings.wallpaper.url
                        ? { backgroundImage: `url(${settings.wallpaper.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : settings.wallpaper.type === 'color'
                        ? { backgroundColor: settings.wallpaper.color }
                        : { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
                    }
                  >
                    <div
                      className="absolute inset-0 bg-black/20 transition-all duration-300"
                      style={{ backdropFilter: `blur(${settings.blurLevel ?? 2}px)` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white font-bold text-2xl drop-shadow-lg">示例文字</div>
                    </div>
                  </div>
                </div>

                {/* 滑块控制 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">模糊程度</label>
                    <span className="text-sm text-blue-600 font-medium">{settings.blurLevel ?? 2}px</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={settings.blurLevel ?? 2}
                    onChange={(e) => {
                      const newBlur = parseInt(e.target.value);
                      onSettingsChange({ ...settings, blurLevel: newBlur });
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((settings.blurLevel ?? 2) / 20) * 100}%, #e5e7eb ${((settings.blurLevel ?? 2) / 20) * 100}%, #e5e7eb 100%)`
                    }}
                  />

                  <div className="flex justify-between text-xs text-gray-500">
                    <span>无模糊 (0)</span>
                    <span>清晰</span>
                    <span>模糊 (20)</span>
                  </div>
                </div>

                {/* 预设按钮 */}
                <div className="mt-6 space-y-2">
                  <div className="text-sm font-medium text-gray-700 mb-3">快速设置：</div>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => onSettingsChange({ ...settings, blurLevel: 0 })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        settings.blurLevel === 0
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      无模糊
                    </button>
                    <button
                      onClick={() => onSettingsChange({ ...settings, blurLevel: 2 })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        settings.blurLevel === 2
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      轻微
                    </button>
                    <button
                      onClick={() => onSettingsChange({ ...settings, blurLevel: 5 })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        settings.blurLevel === 5
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      中等
                    </button>
                    <button
                      onClick={() => onSettingsChange({ ...settings, blurLevel: 10 })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        settings.blurLevel === 10
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      高
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-xs text-blue-800">
                    💡 提示：模糊效果会应用在背景遮罩层上，让文字更易读
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="space-y-4">
              {/* 自定义搜索引擎 */}
              {(settings.customSearchEngines || []).map((engine) => (
                <div
                  key={engine.name}
                  className={`p-4 rounded-xl border-2 transition-all group ${
                    settings.searchEngine.name === engine.name
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => onSettingsChange({ ...settings, searchEngine: engine })}
                    >
                      <div className="font-medium text-lg flex items-center gap-2">
                        {engine.name}
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">自定义</span>
                      </div>
                      <div className="text-sm text-gray-600">{engine.placeholder}</div>
                      <div className="text-xs text-gray-400 mt-1">{engine.url}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteEngine(engine.name)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {/* 默认搜索引擎 */}
              {DEFAULT_SEARCH_ENGINES.map((engine) => (
                <div
                  key={engine.name}
                  onClick={() =>
                    onSettingsChange({ ...settings, searchEngine: engine })
                  }
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    settings.searchEngine.name === engine.name
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-lg">{engine.name}</div>
                  <div className="text-sm text-gray-600">{engine.placeholder}</div>
                </div>
              ))}

              {/* 添加自定义搜索引擎按钮 */}
              <button
                onClick={() => setShowAddEngine(true)}
                className="w-full p-4 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
              >
                <Plus size={20} />
                添加自定义搜索引擎
              </button>

              {/* 添加搜索引擎对话框 */}
              {showAddEngine && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                    <h3 className="text-xl font-bold mb-4">添加搜索引擎</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">名称</label>
                        <input
                          type="text"
                          value={newEngine.name}
                          onChange={(e) => setNewEngine({ ...newEngine, name: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="例如：DuckDuckGo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">搜索网址</label>
                        <input
                          type="text"
                          value={newEngine.url}
                          onChange={(e) => setNewEngine({ ...newEngine, url: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://duckduckgo.com/?q="
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          提示：搜索关键词会自动添加到网址末尾
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">占位符文字</label>
                        <input
                          type="text"
                          value={newEngine.placeholder}
                          onChange={(e) => setNewEngine({ ...newEngine, placeholder: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Search DuckDuckGo"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleAddEngine}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                      >
                        添加
                      </button>
                      <button
                        onClick={() => {
                          setShowAddEngine(false);
                          setNewEngine({ name: '', url: '', placeholder: '' });
                        }}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
