import { useState, FormEvent } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { SearchEngine } from '../types';

interface SearchBarProps {
  searchEngine: SearchEngine;
  allEngines: SearchEngine[];
  onEngineChange: (engine: SearchEngine) => void;
}

export default function SearchBar({ searchEngine, allEngines, onEngineChange }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showEngines, setShowEngines] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = searchEngine.url + encodeURIComponent(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        {/* 搜索引擎切换按钮 */}
        <div className="absolute inset-y-0 left-4 flex items-center z-10">
          <button
            type="button"
            onClick={() => setShowEngines(!showEngines)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-full transition-colors"
          >
            {searchEngine.name}
            <ChevronDown size={14} />
          </button>

          {/* 下拉菜单 */}
          {showEngines && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowEngines(false)}
              />
              <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl py-1 min-w-[120px] z-30">
                {allEngines.map((engine) => (
                  <button
                    key={engine.name}
                    type="button"
                    onClick={() => {
                      onEngineChange(engine);
                      setShowEngines(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      engine.name === searchEngine.name ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {engine.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 搜索图标 */}
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
          <Search className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchEngine.placeholder}
          className="w-full pl-32 pr-12 py-3 text-base bg-white/90 backdrop-blur-md rounded-full shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
        />
      </div>
    </form>
  );
}
