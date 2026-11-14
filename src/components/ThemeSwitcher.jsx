import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette, Check, ChevronUp, ChevronDown, Sun, Moon } from 'lucide-react';

export default function ThemeSwitcher() {
  const { theme, themeKey, changeTheme, allThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Group themes by category
  const categories = ['White & Light', 'Black & Monochrome', 'Color Palettes'];

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Expanded Palette Menu */}
      {isOpen && (
        <div className={`mb-3 w-[calc(100vw-32px)] max-w-sm sm:w-80 rounded-2xl ${theme.isLight ? 'bg-white/95 text-slate-800 border-slate-200' : 'bg-[#0D1322]/95 text-slate-200 border-slate-700/80'} backdrop-blur-xl border p-4 shadow-2xl shadow-black/40 animate-in fade-in slide-in-from-bottom-3 duration-200 max-h-[80vh] overflow-y-auto`}>
          <div className={`flex items-center justify-between pb-3 border-b ${theme.isLight ? 'border-slate-200' : 'border-slate-800'} mb-3`}>
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-500" />
              <span className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary}`}>
                Curated Palettes
              </span>
            </div>
            <span className={`text-[10px] ${theme.textMuted}`}>Click to Apply</span>
          </div>

          <div className="space-y-4">
            {categories.map((cat) => {
              const catThemes = Object.values(allThemes).filter((t) => t.category === cat);
              return (
                <div key={cat} className="space-y-1.5">
                  <div className={`text-[10px] font-bold uppercase tracking-wider px-1 ${theme.isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {cat}
                  </div>
                  <div className="space-y-1.5">
                    {catThemes.map((t) => {
                      const isSelected = themeKey === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => changeTheme(t.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl border transition text-left cursor-pointer ${
                            isSelected
                              ? theme.isLight
                                ? 'bg-blue-50/80 border-blue-500 text-blue-900 shadow-sm'
                                : 'bg-slate-800/90 border-blue-500 text-white shadow-md'
                              : theme.isLight
                              ? 'bg-slate-50 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                              : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {/* Swatch circle with border */}
                            <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${t.swatch} border border-slate-300/40 shrink-0 shadow-inner`} />
                            <div>
                              <div className={`text-xs font-bold leading-tight ${isSelected ? (theme.isLight ? 'text-blue-900' : 'text-white') : (theme.isLight ? 'text-slate-800' : 'text-slate-200')}`}>
                                {t.name}
                              </div>
                              <div className={`text-[10px] leading-tight ${theme.isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                {t.subtitle}
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={`mt-3 pt-3 border-t ${theme.isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800/80 text-slate-400'} text-[11px] text-center`}>
            {theme.isLight ? 'Light Mode Active' : 'Dark Mode Active'} &bull; Switch instantly
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-full ${theme.isLight ? 'bg-white text-slate-800 border-slate-300 shadow-lg' : 'bg-[#0D1322]/95 text-slate-200 border-slate-700 shadow-xl shadow-black/40'} border hover:border-blue-500 transition duration-200 group cursor-pointer`}
        aria-label="Toggle Theme Selector"
      >
        {theme.isLight ? (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-cyan-400" />
        )}
        <div className={`w-3 h-3 rounded-full bg-gradient-to-tr ${theme.swatch} border border-slate-400/40`} />
        <span className="text-xs font-semibold">{theme.name}</span>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
        )}
      </button>
    </div>
  );
}
