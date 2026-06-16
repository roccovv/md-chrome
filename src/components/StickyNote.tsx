import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { X, Trash2, Pin } from 'lucide-react';
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
  const noteRef = useRef<HTMLDivElement>(null);
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

  return (
    <div
      ref={noteRef}
      className={`fixed w-64 min-h-80 flex flex-col rounded-lg shadow-lg transition-shadow duration-200 select-none ${
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
      {/* 头部 - 带钉子拖动手柄 */}
      <div className="grid grid-cols-[2rem_minmax(0,1fr)_2rem] items-center gap-2 p-3 border-b border-gray-400/30">
        {/* 钉子拖动手柄 */}
        <button
          onPointerDown={handlePinPointerDown}
          className="h-8 w-8 grid place-items-center hover:bg-black/10 rounded transition-colors cursor-grab active:cursor-grabbing touch-none"
          aria-label="拖动便利贴"
          title="按住拖动"
        >
          <Pin size={18} className="text-gray-700" />
        </button>

        <input
          type="text"
          className="flex-1 min-w-0 bg-transparent text-gray-800 font-semibold placeholder-gray-500 focus:outline-none"
          value={note.title}
          onChange={handleTitleChange}
          placeholder="便利贴标题"
        />

        <button
          onClick={handleDelete}
          className="h-8 w-8 grid place-items-center hover:bg-black/10 rounded transition-colors"
          aria-label="删除便利贴"
        >
          <Trash2 size={16} className="text-gray-700" />
        </button>
      </div>

      {/* 自由文本区域 */}
      <div className="flex-1 p-3">
        <textarea
          className="w-full h-32 bg-transparent text-sm text-gray-800 placeholder-gray-500 focus:outline-none resize-none"
          value={note.content || ''}
          onChange={handleContentChange}
          placeholder="在这里随便写点什么..."
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
              className={`flex-1 min-w-0 bg-transparent text-sm placeholder-gray-500 focus:outline-none ${
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
