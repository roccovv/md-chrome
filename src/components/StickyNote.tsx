import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { X, Trash2, Pin, Palette, Type } from 'lucide-react';
import { StickyNote as StickyNoteType, TodoItem } from '../types';

interface StickyNoteProps {
  note: StickyNoteType;
  onUpdate: (note: StickyNoteType) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
}

const colorClasses = {
  yellow: 'bg-gradient-to-br from-yellow-200 to-yellow-300',
  pink: 'bg-gradient-to-br from-pink-200 to-pink-300',
  blue: 'bg-gradient-to-br from-blue-200 to-blue-300',
  green: 'bg-gradient-to-br from-green-200 to-green-300',
  purple: 'bg-gradient-to-br from-purple-200 to-purple-300',
};

const NOTE_WIDTH = 256;
const NOTE_MIN_HEIGHT = 320;

const clampPosition = (
  position: { x: number; y: number },
  size: { width: number; height: number } = { width: NOTE_WIDTH, height: NOTE_MIN_HEIGHT }
) => ({
  x: Math.max(0, Math.min(window.innerWidth - size.width, position.x)),
  y: Math.max(0, Math.min(window.innerHeight - size.height, position.y)),
});

export default function StickyNote({ note, onUpdate, onDelete, onBringToFront }: StickyNoteProps) {
  const [isRipping, setIsRipping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(note.position);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const latestNoteRef = useRef(note);
  const latestDragPositionRef = useRef(note.position);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    latestNoteRef.current = note;
  });

  useEffect(() => {
    if (!isDragging) {
      latestDragPositionRef.current = note.position;
      setDragPosition(note.position);
    }
  }, [isDragging, note.position]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const scheduleDragPosition = (position: { x: number; y: number }) => {
    latestDragPositionRef.current = position;

    if (animationFrameRef.current !== null) {
      return;
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      setDragPosition(latestDragPositionRef.current);
    });
  };

  const handlePinPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    onBringToFront(note.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...latestDragPositionRef.current };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      scheduleDragPosition(
        clampPosition(
          { x: startPos.x + deltaX, y: startPos.y + deltaY },
          {
            width: noteRef.current?.offsetWidth ?? NOTE_WIDTH,
            height: noteRef.current?.offsetHeight ?? NOTE_MIN_HEIGHT,
          }
        )
      );
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      const nextPosition = latestDragPositionRef.current;
      // 拖动结束后再更新到父组件
      onUpdate({ ...latestNoteRef.current, position: nextPosition, updatedAt: Date.now() });
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...note, title: e.target.value, updatedAt: Date.now() });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...note, content: e.target.value, updatedAt: Date.now() });
  };

  // 自动调整 textarea 高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [note.content]);

  const addTodo = () => {
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: '',
      completed: false,
      createdAt: Date.now(),
    };
    onUpdate({ ...note, todos: [...note.todos, newTodo], updatedAt: Date.now() });
  };

  const toggleTodo = (id: string) => {
    const updatedTodos = note.todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    onUpdate({ ...note, todos: updatedTodos, updatedAt: Date.now() });
  };

  const updateTodoText = (id: string, text: string) => {
    const updatedTodos = note.todos.map((todo) =>
      todo.id === id ? { ...todo, text } : todo
    );
    onUpdate({ ...note, todos: updatedTodos, updatedAt: Date.now() });
  };

  const deleteTodo = (id: string) => {
    const updatedTodos = note.todos.filter((todo) => todo.id !== id);
    onUpdate({ ...note, todos: updatedTodos, updatedAt: Date.now() });
  };

  const handleDelete = () => {
    setIsRipping(true);
    setTimeout(() => {
      onDelete(note.id);
    }, 600);
  };

  const handleTextColorChange = (color: string) => {
    onUpdate({ ...note, textColor: color, updatedAt: Date.now() });
    setShowColorPicker(false);
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    onUpdate({ ...note, fontSize: size, updatedAt: Date.now() });
    setShowFontSizePicker(false);
  };

  const textColor = note.textColor || '#1f2937';
  const fontSize = note.fontSize || 'medium';
  const fontSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  return (
    <div
      ref={noteRef}
      className={`fixed w-64 flex flex-col rounded-lg shadow-lg transition-shadow duration-200 select-none ${
        colorClasses[note.color]
      } ${isRipping ? 'ripping' : ''}`}
      style={{
        left: 0,
        top: 0,
        '--note-x': `${dragPosition.x}px`,
        '--note-y': `${dragPosition.y}px`,
        zIndex: note.zIndex,
        transform: `translate3d(${dragPosition.x}px, ${dragPosition.y}px, 0) ${
          isDragging ? 'rotate(0deg) scale(1.015)' : 'rotate(-1deg)'
        }`,
        willChange: isDragging ? 'transform' : 'auto',
        boxShadow: isDragging
          ? '0 10px 25px rgba(0, 0, 0, 0.15)'
          : '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06), inset 0 -2px 4px rgba(0, 0, 0, 0.05)',
      } as CSSProperties}
    >
      {/* 头部 - 两行布局 */}
      <div className="p-3 border-b border-gray-400/30 space-y-2">
        {/* 第一行：钉子 + 标题 + 删除 */}
        <div className="flex items-center gap-2">
          <button
            onPointerDown={handlePinPointerDown}
            className="h-8 w-8 grid place-items-center hover:bg-black/10 rounded transition-colors cursor-grab active:cursor-grabbing touch-none shrink-0"
            aria-label="拖动便利贴"
            title="按住拖动"
          >
            <Pin size={18} className="text-gray-700" />
          </button>

          <input
            type="text"
            className="flex-1 min-w-0 bg-transparent text-gray-800 font-semibold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600/40 rounded px-1 caret-gray-800"
            value={note.title}
            onChange={handleTitleChange}
            placeholder="便利贴标题"
          />

          <button
            onClick={handleDelete}
            className="h-8 w-8 grid place-items-center hover:bg-black/10 rounded transition-colors shrink-0"
            aria-label="删除便利贴"
          >
            <Trash2 size={16} className="text-gray-700" />
          </button>
        </div>

        {/* 第二行：格式化工具栏 */}
        <div className="flex items-center gap-1">
          {/* 字号选择 */}
          <div className="relative">
            <button
              onClick={() => setShowFontSizePicker(!showFontSizePicker)}
              className="h-7 px-2 flex items-center gap-1 hover:bg-black/10 rounded transition-colors text-xs text-gray-700"
              aria-label="选择字号"
              title="字号"
            >
              <Type size={14} />
              <span>字号</span>
            </button>
            {showFontSizePicker && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowFontSizePicker(false)}
                />
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl py-1 z-30 min-w-[100px]">
                  <button
                    onClick={() => handleFontSizeChange('small')}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 ${
                      fontSize === 'small' ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    小号
                  </button>
                  <button
                    onClick={() => handleFontSizeChange('medium')}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                      fontSize === 'medium' ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    中号
                  </button>
                  <button
                    onClick={() => handleFontSizeChange('large')}
                    className={`w-full text-left px-3 py-2 text-base hover:bg-gray-100 ${
                      fontSize === 'large' ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    大号
                  </button>
                </div>
              </>
            )}
          </div>

          {/* 颜色选择 */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="h-7 px-2 flex items-center gap-1 hover:bg-black/10 rounded transition-colors text-xs text-gray-700"
              aria-label="选择文本颜色"
              title="文本颜色"
            >
              <Palette size={14} />
              <span>颜色</span>
            </button>
            {showColorPicker && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowColorPicker(false)}
                />
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl p-2 z-30 w-44">
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      '#1f2937', '#ef4444', '#f59e0b', '#eab308', '#10b981',
                      '#14b8a6', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
                      '#f43f5e', '#64748b', '#78716c', '#a3a3a3', '#000000'
                    ].map((color) => (
                        <button
                          key={color}
                          onClick={() => handleTextColorChange(color)}
                          className={`w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform ${
                            textColor === color ? 'border-gray-800 ring-2 ring-gray-400' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          aria-label={`选择颜色 ${color}`}
                        />
                      )
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 自由文本区域 */}
      <div className="p-3">
        <textarea
          ref={textareaRef}
          className={`w-full bg-transparent ${fontSizeClasses[fontSize]} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600/40 rounded p-1 resize-none min-h-[8rem] overflow-hidden`}
          style={{ color: textColor, caretColor: textColor }}
          value={note.content || ''}
          onChange={handleContentChange}
          placeholder="在这里随便写点什么..."
          rows={1}
        />
      </div>

      {/* 代办事项区域 */}
      <div className="px-3 pb-3 space-y-2">
        <div className="text-xs text-gray-600 font-semibold mb-1">代办事项</div>
        {note.todos.map((todo) => (
          <div key={todo.id} className="grid grid-cols-[auto_minmax(0,1fr)_1.75rem] items-start gap-2 group">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className={`mt-1 cursor-pointer shrink-0 ${
                todo.completed ? 'accent-emerald-700' : 'accent-gray-700'
              }`}
            />
            <input
              type="text"
              className={`flex-1 min-w-0 bg-transparent text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600/40 rounded px-1 caret-gray-800 ${
                todo.completed ? 'line-through text-emerald-800/75' : 'text-gray-800'
              }`}
              value={todo.text}
              onChange={(e) => updateTodoText(todo.id, e.target.value)}
              placeholder="输入代办事项"
            />
            <button
              onClick={() => deleteTodo(todo.id)}
              className="h-7 w-7 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10 rounded"
              aria-label="删除代办"
            >
              <X size={14} className="text-gray-700" />
            </button>
          </div>
        ))}
        <button
          onClick={addTodo}
          className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
        >
          + 添加代办事项
        </button>
      </div>
    </div>
  );
}
