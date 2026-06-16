import { Plus, X, Edit2, GripVertical, Sparkles, AppWindow, Globe, Keyboard } from 'lucide-react';
import { useState } from 'react';
import { AITool } from '../types';
import { AI_TOOLS_PRESET } from '../presets';
import { DEFAULT_ICONS } from '../icons';
import { getLogoUrl } from '../utils';

interface AIToolsProps {
  tools: AITool[];
  onToolsChange: (tools: AITool[]) => void;
}

export default function AITools({ tools, onToolsChange }: AIToolsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', url: '', icon: DEFAULT_ICONS.AI });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [addMode, setAddMode] = useState<'bookmarks' | 'presets' | 'manual'>('bookmarks');
  const [selectedPresets, setSelectedPresets] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<Array<{ title: string; url: string; icon: string }>>([]);

  const handleAdd = () => {
    if (formData.name && formData.url) {
      const newTool: AITool = {
        id: Date.now().toString(),
        name: formData.name,
        url: formData.url,
        icon: formData.icon,
      };
      onToolsChange([...tools, newTool]);
      setFormData({ name: '', url: '', icon: DEFAULT_ICONS.AI });
      setIsAdding(false);
    }
  };

  const handleAddFromPresets = () => {
    const newTools: AITool[] = [];
    selectedPresets.forEach((name) => {
      const item = AI_TOOLS_PRESET.find(i => i.name === name);
      if (item) {
        newTools.push({
          id: Date.now().toString() + Math.random(),
          name: item.name,
          url: item.url,
          icon: item.icon,
        });
      }
    });
    if (newTools.length > 0) {
      onToolsChange([...tools, ...newTools]);
      setSelectedPresets(new Set());
      setIsAdding(false);
    }
  };

  const handleAddFromBookmarks = () => {
    const selectedBookmarks = bookmarks.filter((_, index) =>
      selectedPresets.has(`bookmark|||${index}`)
    );
    if (selectedBookmarks.length > 0) {
      const newTools = selectedBookmarks.map(bookmark => ({
        id: Date.now().toString() + Math.random(),
        name: bookmark.title,
        url: bookmark.url,
        icon: bookmark.icon,
      }));
      onToolsChange([...tools, ...newTools]);
      setSelectedPresets(new Set());
      setIsAdding(false);
    }
  };

  const loadBookmarks = async () => {
    if (typeof chrome !== 'undefined' && chrome.bookmarks) {
      try {
        const tree = await chrome.bookmarks.getTree();
        const bookmarkList: Array<{ title: string; url: string; icon: string }> = [];

        // 递归遍历书签树
        const traverseBookmarks = (nodes: chrome.bookmarks.BookmarkTreeNode[]) => {
          nodes.forEach(node => {
            if (node.url) {
              // 使用 Favicon.im API（月处理 3000 万+ 请求，99.9% 可用性，Cloudflare 加速）
              const logoUrl = getLogoUrl(node.url);
              bookmarkList.push({
                title: node.title || 'Untitled',
                url: node.url,
                icon: logoUrl || DEFAULT_ICONS.BOOKMARK_SMALL,
              });
            }
            if (node.children) {
              // 是文件夹，继续遍历
              traverseBookmarks(node.children);
            }
          });
        };

        traverseBookmarks(tree);
        setBookmarks(bookmarkList);
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
      }
    }
  };

  const togglePresetSelection = (key: string) => {
    const newSelection = new Set(selectedPresets);
    if (newSelection.has(key)) {
      newSelection.delete(key);
    } else {
      newSelection.add(key);
    }
    setSelectedPresets(newSelection);
  };

  const handleEdit = (id: string) => {
    const tool = tools.find((t) => t.id === id);
    if (tool) {
      setFormData({ name: tool.name, url: tool.url, icon: tool.icon });
      setEditingId(id);
      setIsAdding(true);
    }
  };

  const handleUpdate = () => {
    if (editingId && formData.name && formData.url) {
      onToolsChange(
        tools.map((tool) =>
          tool.id === editingId
            ? { ...tool, name: formData.name, url: formData.url, icon: formData.icon }
            : tool
        )
      );
      setFormData({ name: '', url: '', icon: DEFAULT_ICONS.AI });
      setIsAdding(false);
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    onToolsChange(tools.filter((tool) => tool.id !== id));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newTools = [...tools];
    const draggedItem = newTools[draggedIndex];
    newTools.splice(draggedIndex, 1);
    newTools.splice(index, 0, draggedItem);

    onToolsChange(newTools);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-yellow-400" />
        <h2 className="text-lg font-semibold text-white">AI 助手</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tools.map((tool, index) => (
          <div
            key={tool.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`group relative transition-all ${draggedIndex === index ? 'opacity-50 scale-95' : ''}`}
          >
            {/* 拖拽手柄 */}
            <div className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <div className="p-1 bg-gray-700 rounded-full shadow-lg cursor-move">
                <GripVertical size={14} className="text-white" />
              </div>
            </div>

            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <img
                src={tool.icon || DEFAULT_ICONS.AI}
                alt={tool.name}
                className="w-10 h-10 mb-2 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_ICONS.AI;
                }}
              />
              <div className="text-sm text-white font-medium text-center truncate w-full">
                {tool.name}
              </div>
            </a>

            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={() => handleEdit(tool.id)}
                className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg"
              >
                <Edit2 size={12} className="text-white" />
              </button>
              <button
                onClick={() => handleDelete(tool.id)}
                className="p-1.5 bg-red-500 hover:bg-red-600 rounded-full shadow-lg"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({ name: '', url: '', icon: DEFAULT_ICONS.AI });
            setAddMode('bookmarks');
            // 打开时自动加载书签
            loadBookmarks();
          }}
          className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl transition-all duration-200 border-2 border-dashed border-white/30 hover:border-white/50"
        >
          <Plus className="text-white mb-2" size={32} />
          <div className="text-sm text-white font-medium">添加</div>
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl mx-4 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold mb-4">
              {editingId ? '编辑 AI 工具' : '添加 AI 工具'}
            </h3>

            {/* 编辑模式 */}
            {editingId ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">图标</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="图标网址，例如：https://example.com/icon.png"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    支持图片网址（SVG、PNG、ICO 等格式）
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">名称</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：Kimi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">网址</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://kimi.moonshot.cn"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleUpdate}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                  >
                    更新
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setEditingId(null);
                      setFormData({ name: '', url: '', icon: DEFAULT_ICONS.AI });
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              /* 添加模式 - 三种方式 */
              <div className="flex-1 overflow-y-auto">
                {/* 选项卡 */}
                <div className="flex gap-2 mb-4 border-b">
                  <button
                    onClick={() => {
                      setAddMode('bookmarks');
                      loadBookmarks();
                      setSelectedPresets(new Set());
                    }}
                    className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                      addMode === 'bookmarks'
                        ? 'text-blue-500 border-b-2 border-blue-500'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <AppWindow size={18} />
                    从书签导入
                  </button>
                  {/* AI 工具预设 */}
                  <button
                    onClick={() => {
                      setAddMode('presets');
                      setSelectedPresets(new Set());
                    }}
                    className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                      addMode === 'presets'
                        ? 'text-blue-500 border-b-2 border-blue-500'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Globe size={18} />
                    常用AI工具
                  </button>
                  <button
                    onClick={() => {
                      setAddMode('manual');
                      setSelectedPresets(new Set());
                    }}
                    className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                      addMode === 'manual'
                        ? 'text-blue-500 border-b-2 border-blue-500'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Keyboard size={18} />
                    手动输入
                  </button>
                </div>

                {/* 从书签导入 */}
                {addMode === 'bookmarks' && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      选择要添加的书签（{selectedPresets.size} 个已选）
                    </div>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {bookmarks.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          没有找到书签
                        </div>
                      ) : (
                        bookmarks.map((bookmark, index) => {
                          const key = `bookmark|||${index}`;
                          const isSelected = selectedPresets.has(key);
                          return (
                            <div
                              key={index}
                              onClick={() => togglePresetSelection(key)}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {bookmark.icon.startsWith('http') ? (
                                  <img
                                    src={bookmark.icon}
                                    alt=""
                                    className="w-6 h-6 rounded"
                                    onError={(e) => {
                                      // 使用默认书签图标
                                      e.currentTarget.src = DEFAULT_ICONS.BOOKMARK_SMALL;
                                    }}
                                  />
                                ) : (
                                  <img src={bookmark.icon} alt="" className="w-6 h-6 rounded" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{bookmark.title}</div>
                                  <div className="text-xs text-gray-500 truncate">{bookmark.url}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="flex gap-3 pt-4 border-t">
                      <button
                        onClick={handleAddFromBookmarks}
                        disabled={selectedPresets.size === 0}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors"
                      >
                        添加选中 ({selectedPresets.size})
                      </button>
                      <button
                        onClick={() => {
                          setIsAdding(false);
                          setSelectedPresets(new Set());
                        }}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}

                {/* 从预设选择 - AI 工具 */}
                {addMode === 'presets' && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      选择要添加的 AI 工具（{selectedPresets.size} 个已选）
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {AI_TOOLS_PRESET.map((item) => {
                          const isSelected = selectedPresets.has(item.name);
                          return (
                            <div
                              key={item.name}
                              onClick={() => togglePresetSelection(item.name)}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <img
                                  src={item.icon}
                                  alt={item.name}
                                  className="w-8 h-8 rounded object-contain"
                                  onError={(e) => {
                                    e.currentTarget.src = DEFAULT_ICONS.AI;
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate">
                                    {item.name}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t">
                      <button
                        onClick={handleAddFromPresets}
                        disabled={selectedPresets.size === 0}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors"
                      >
                        添加选中 ({selectedPresets.size})
                      </button>
                      <button
                        onClick={() => {
                          setIsAdding(false);
                          setSelectedPresets(new Set());
                        }}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}

                {/* 手动输入 */}
                {addMode === 'manual' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">图标</label>
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="图标网址，例如：https://example.com/icon.png"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        支持图片网址（SVG、PNG、ICO 等格式）
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">名称</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="例如：Kimi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">网址</label>
                      <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://kimi.moonshot.cn"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleAdd}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                      >
                        添加
                      </button>
                      <button
                        onClick={() => {
                          setIsAdding(false);
                          setFormData({ name: '', url: '', icon: DEFAULT_ICONS.AI });
                        }}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
