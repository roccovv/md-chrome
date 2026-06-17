import { Plus, X, Edit2, GripVertical, Link, AppWindow, Globe, Keyboard } from 'lucide-react';
import { useState } from 'react';
import { QuickLink } from '../types';
import { PRESET_WEBSITES } from '../presets';
import { DEFAULT_ICONS } from '../icons';
import { getLogoUrl } from '../utils';

interface QuickLinksProps {
  links: QuickLink[];
  onLinksChange: (links: QuickLink[]) => void;
}

export default function QuickLinks({ links, onLinksChange }: QuickLinksProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', url: '', icon: DEFAULT_ICONS.LINK });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [addMode, setAddMode] = useState<'bookmarks' | 'presets' | 'manual'>('bookmarks');
  const [selectedPresets, setSelectedPresets] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<Array<{ title: string; url: string; icon: string }>>([]);

  const handleAdd = () => {
    if (formData.title && formData.url) {
      const newLink: QuickLink = {
        id: Date.now().toString(),
        title: formData.title,
        url: formData.url,
        icon: formData.icon,
      };
      onLinksChange([...links, newLink]);
      setFormData({ title: '', url: '', icon: DEFAULT_ICONS.LINK });
      setIsAdding(false);
    }
  };

  const handleAddFromPresets = () => {
    const newLinks: QuickLink[] = [];
    selectedPresets.forEach((key) => {
      const [category, name] = key.split('|||');
      const categoryData = PRESET_WEBSITES.find(c => c.category === category);
      const item = categoryData?.items.find(i => i.name === name);
      if (item) {
        newLinks.push({
          id: Date.now().toString() + Math.random(),
          title: item.name,
          url: item.url,
          icon: item.icon,
        });
      }
    });
    if (newLinks.length > 0) {
      onLinksChange([...links, ...newLinks]);
      setSelectedPresets(new Set());
      setIsAdding(false);
    }
  };

  const handleAddFromBookmarks = () => {
    const selectedBookmarks = bookmarks.filter((_, index) =>
      selectedPresets.has(`bookmark|||${index}`)
    );
    if (selectedBookmarks.length > 0) {
      const newLinks = selectedBookmarks.map(bookmark => ({
        id: Date.now().toString() + Math.random(),
        title: bookmark.title,
        url: bookmark.url,
        icon: bookmark.icon,
      }));
      onLinksChange([...links, ...newLinks]);
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
                icon: logoUrl || DEFAULT_ICONS.LINK_SMALL,
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
    const link = links.find((l) => l.id === id);
    if (link) {
      setFormData({ title: link.title, url: link.url, icon: link.icon || DEFAULT_ICONS.LINK });
      setEditingId(id);
      setIsAdding(true);
    }
  };

  const handleUpdate = () => {
    if (editingId && formData.title && formData.url) {
      onLinksChange(
        links.map((link) =>
          link.id === editingId
            ? { ...link, title: formData.title, url: formData.url, icon: formData.icon }
            : link
        )
      );
      setFormData({ title: '', url: '', icon: DEFAULT_ICONS.LINK });
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    onLinksChange(links.filter((link) => link.id !== id));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newLinks = [...links];
    const draggedItem = newLinks[draggedIndex];
    newLinks.splice(draggedIndex, 1);
    newLinks.splice(index, 0, draggedItem);

    onLinksChange(newLinks);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Link size={18} className="text-blue-400" />
        <h2 className="text-base font-semibold text-white">快捷方式</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {links.map((link, index) => (
          <div
            key={link.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`group relative transition-all ${draggedIndex === index ? 'opacity-50 scale-95' : ''}`}
          >
            {/* 拖拽手柄 */}
            <div className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <div className="p-1 bg-gray-700 rounded-full shadow-lg cursor-move">
                <GripVertical size={12} className="text-white" />
              </div>
            </div>

            <a
              href={link.url}
              className="flex flex-col items-center justify-center p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <img
                src={link.icon || DEFAULT_ICONS.LINK}
                alt={link.title}
                className="w-8 h-8 mb-1.5 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_ICONS.LINK;
                }}
              />
              <div className="text-xs text-white font-medium text-center truncate w-full">
                {link.title}
              </div>
            </a>
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={() => handleEdit(link.id)}
                className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg"
              >
                <Edit2 size={12} className="text-white" />
              </button>
              <button
                onClick={() => handleDelete(link.id)}
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
            setFormData({ title: '', url: '', icon: DEFAULT_ICONS.LINK });
            // 打开时自动加载书签
            loadBookmarks();
          }}
          className="flex flex-col items-center justify-center p-3 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-xl transition-all duration-200 border-2 border-dashed border-white/30 hover:border-white/50"
        >
          <Plus className="text-white mb-1.5" size={24} />
          <div className="text-xs text-white font-medium">添加</div>
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl mx-4 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold mb-4">
              {editingId ? '编辑快捷方式' : '添加快捷方式'}
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
                    placeholder="🔗 或 https://example.com/icon.png"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    支持图片网址（SVG、PNG、ICO 等格式）
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">标题</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="网站名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">网址</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
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
                      setFormData({ title: '', url: '', icon: DEFAULT_ICONS.LINK });
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
                  {/* 预设网站 */}
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
                    常用网站
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
                                      // 使用默认链接图标
                                      e.currentTarget.src = DEFAULT_ICONS.LINK_SMALL;
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

                {/* 从预设选择 */}
                {addMode === 'presets' && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      选择要添加的网站（{selectedPresets.size} 个已选）
                    </div>
                    <div className="max-h-96 overflow-y-auto space-y-4">
                      {PRESET_WEBSITES.map((category) => (
                        <div key={category.category}>
                          <div className="text-sm font-semibold text-gray-700 mb-2">
                            {category.category}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {category.items.map((item) => {
                              const key = `${category.category}|||${item.name}`;
                              const isSelected = selectedPresets.has(key);
                              return (
                                <div
                                  key={key}
                                  onClick={() => togglePresetSelection(key)}
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
                                        e.currentTarget.src = DEFAULT_ICONS.LINK;
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
                      ))}
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
                      <label className="block text-sm font-medium mb-1">标题</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="网站名称"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">网址</label>
                      <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com"
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
                          setFormData({ title: '', url: '', icon: DEFAULT_ICONS.LINK });
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
