import { useEffect } from 'react';
import { StickyNote as StickyNoteIcon } from 'lucide-react';
import StickyNote from './StickyNote';
import { StickyNote as StickyNoteType } from '../types';

interface StickyNotesProps {
  notes: StickyNoteType[];
  onNotesChange: (notes: StickyNoteType[]) => void;
}

const COLORS: StickyNoteType['color'][] = ['yellow', 'pink', 'blue', 'green', 'purple'];
const MAX_NOTES = 20;

export default function StickyNotes({ notes, onNotesChange }: StickyNotesProps) {
  // 处理窗口大小变化，确保便利贴不会跑出屏幕
  useEffect(() => {
    const handleResize = () => {
      const updatedNotes = notes.map((note) => ({
        ...note,
        position: {
          x: Math.min(note.position.x, window.innerWidth - 250),
          y: Math.min(note.position.y, window.innerHeight - 300),
        },
      }));
      if (JSON.stringify(updatedNotes) !== JSON.stringify(notes)) {
        onNotesChange(updatedNotes);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [notes, onNotesChange]);

  const handleAddNote = () => {
    if (notes.length >= MAX_NOTES) {
      alert(`便利贴数量已达上限（${MAX_NOTES}个）`);
      return;
    }

    const maxZ = notes.length > 0 ? Math.max(...notes.map((n) => n.zIndex)) : 50;
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    // 随机位置，但确保在屏幕范围内
    const x = Math.random() * Math.max(50, window.innerWidth - 350) + 50;
    const y = Math.random() * Math.max(50, window.innerHeight - 450) + 50;

    const newNote: StickyNoteType = {
      id: Date.now().toString(),
      title: '',
      todos: [],
      position: { x, y },
      color: randomColor,
      zIndex: maxZ + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onNotesChange([...notes, newNote]);
  };

  const handleUpdateNote = (updatedNote: StickyNoteType) => {
    const updatedNotes = notes.map((note) =>
      note.id === updatedNote.id ? updatedNote : note
    );
    onNotesChange(updatedNotes);
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    onNotesChange(updatedNotes);
  };

  const handleBringToFront = (id: string) => {
    const maxZ = Math.max(...notes.map((n) => n.zIndex));
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, zIndex: maxZ + 1 } : note
    );
    onNotesChange(updatedNotes);
  };

  return (
    <>
      {/* 渲染所有便利贴 */}
      {notes.map((note) => (
        <StickyNote
          key={note.id}
          note={note}
          onUpdate={handleUpdateNote}
          onDelete={handleDeleteNote}
          onBringToFront={handleBringToFront}
        />
      ))}

      {/* 创建便利贴按钮 */}
      <button
        onClick={handleAddNote}
        className="fixed bottom-6 right-6 p-4 bg-yellow-400 hover:bg-yellow-500 rounded-full shadow-2xl transition-all duration-200 z-20 hover:scale-110"
        aria-label="添加便利贴"
        title="添加便利贴"
      >
        <StickyNoteIcon size={28} className="text-gray-800" />
      </button>
    </>
  );
}
