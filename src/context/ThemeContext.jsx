import { createContext, useContext, useState, useEffect } from 'react';

export const themes = {
  // ==========================================
  // 1. WHITE / LIGHT THEMES
  // ==========================================
  studioWhite: {
    id: 'studioWhite',
    name: 'Studio Pure White',
    subtitle: 'Minimalist Monochrome Light',
    category: 'White & Light',
    isLight: true,
    bg: 'bg-white',
    bgSecondary: 'bg-[#F8FAFC]',
    cardBg: 'bg-white',
    cardInner: 'bg-[#F1F5F9]',
    cardBorder: 'border-slate-200/90 hover:border-slate-400 shadow-sm hover:shadow-md',
    navBg: 'bg-white/90 border-slate-200 shadow-sm',
    systemBarBg: 'bg-slate-100 border-slate-200 text-slate-600',
    textPrimary: 'text-slate-950',
    textSecondary: 'text-slate-600',
    textMuted: 'text-slate-400',
    borderSubtle: 'border-slate-200',
    dotGrid: 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] opacity-60',
    primaryGrad: 'from-slate-950 via-slate-800 to-slate-600',
    primaryBtn: 'from-slate-950 to-slate-800 hover:from-slate-900 hover:to-slate-700 text-white shadow-slate-900/20',
    secondaryBtn: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300',
    accentText: 'text-slate-900 font-bold',
    accentBg: 'bg-slate-100',
    accentBorder: 'border-slate-300',
    accentBadge: 'bg-slate-100 border-slate-300 text-slate-800',
    glow: 'from-slate-200/40 via-slate-100/30 to-transparent',
    iconColor: 'text-slate-900',
    iconHover: 'group-hover:text-black',
    swatch: 'from-white via-slate-200 to-slate-900',
  },
  nordicFrost: {
    id: 'nordicFrost',
    name: 'Nordic Frost Light',
    subtitle: 'Ice White with Royal Blue',
    category: 'White & Light',
    isLight: true,
    bg: 'bg-[#F8FAFC]',
    bgSecondary: 'bg-[#EEF2F6]',
    cardBg: 'bg-white',
    cardInner: 'bg-[#F1F5F9]',
    cardBorder: 'border-blue-100 hover:border-blue-400 shadow-sm hover:shadow-md shadow-blue-500/5',
    navBg: 'bg-white/90 border-blue-100 shadow-sm',
    systemBarBg: 'bg-blue-50/80 border-blue-100 text-blue-900',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    textMuted: 'text-slate-400',
    borderSubtle: 'border-blue-100',
    dotGrid: 'bg-[radial-gradient(#bfdbfe_1px,transparent_1px)] opacity-50',
    primaryGrad: 'from-blue-600 via-indigo-600 to-cyan-600',
    primaryBtn: 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/25',
    secondaryBtn: 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300',
    accentText: 'text-blue-600',
    accentBg: 'bg-blue-50',
    accentBorder: 'border-blue-200',
    accentBadge: 'bg-blue-50 border-blue-200 text-blue-700',
    glow: 'from-blue-200/40 via-indigo-100/30 to-cyan-100/20',
    iconColor: 'text-blue-600',
    iconHover: 'group-hover:text-blue-700',
    swatch: 'from-white via-blue-100 to-blue-600',
  },

  // ==========================================
  // 2. BLACK / MONOCHROME THEMES
  // ==========================================
  oledBlack: {
    id: 'oledBlack',
    name: 'OLED Pure Black',
    subtitle: 'Pitch Black & Crisp White',
    category: 'Black & Monochrome',
    isLight: false,
    bg: 'bg-[#000000]',
    bgSecondary: 'bg-[#050505]',
    cardBg: 'bg-[#0A0A0A]/95',
    cardInner: 'bg-[#000000]',
    cardBorder: 'border-neutral-800 hover:border-white/60 shadow-xl',
    navBg: 'bg-[#000000]/90 border-neutral-800 shadow-black/50',
    systemBarBg: 'bg-[#050505] border-neutral-900 text-neutral-400',
    textPrimary: 'text-white',
    textSecondary: 'text-neutral-300',
    textMuted: 'text-neutral-400',
    borderSubtle: 'border-neutral-800',
    dotGrid: 'bg-[radial-gradient(#262626_1px,transparent_1px)] opacity-35',
    primaryGrad: 'from-white via-neutral-200 to-neutral-400',
    primaryBtn: 'from-white to-neutral-200 hover:from-neutral-100 hover:to-neutral-300 text-black shadow-white/20 font-bold',
    secondaryBtn: 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-700',
    accentText: 'text-white font-mono',
    accentBg: 'bg-white/10',
    accentBorder: 'border-white/20',
    accentBadge: 'bg-white/10 border-white/25 text-white',
    glow: 'from-white/10 via-neutral-500/10 to-transparent',
    iconColor: 'text-white',
    iconHover: 'group-hover:text-neutral-300',
    swatch: 'from-black via-neutral-900 to-white',
  },
  carbonSilver: {
    id: 'carbonSilver',
    name: 'Carbon & Chrome',
    subtitle: 'Matte Charcoal & Silver',
    category: 'Black & Monochrome',
    isLight: false,
    bg: 'bg-[#08080A]',
    bgSecondary: 'bg-[#040405]',
    cardBg: 'bg-[#101014]/90',
    cardInner: 'bg-[#060608]',
    cardBorder: 'border-zinc-800/80 hover:border-zinc-500 shadow-xl',
    navBg: 'bg-[#08080A]/90 border-zinc-800 shadow-black/40',
    systemBarBg: 'bg-[#040405] border-zinc-900 text-zinc-400',
    textPrimary: 'text-zinc-100',
    textSecondary: 'text-zinc-300',
    textMuted: 'text-zinc-400',
    borderSubtle: 'border-zinc-800',
    dotGrid: 'bg-[radial-gradient(#27272a_1px,transparent_1px)] opacity-30',
    primaryGrad: 'from-zinc-100 via-zinc-300 to-zinc-400',
    primaryBtn: 'from-zinc-100 to-zinc-300 hover:from-white hover:to-zinc-200 text-black shadow-zinc-400/20 font-bold',
    secondaryBtn: 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700',
    accentText: 'text-zinc-200',
    accentBg: 'bg-zinc-800/60',
    accentBorder: 'border-zinc-700',
    accentBadge: 'bg-zinc-800/80 border-zinc-700 text-zinc-200',
    glow: 'from-zinc-700/15 via-zinc-500/10 to-transparent',
    iconColor: 'text-zinc-300',
    iconHover: 'group-hover:text-white',
    swatch: 'from-black via-zinc-800 to-zinc-400',
  },

  // ==========================================
  // 3. COLOR ACCENT DARK THEMES
  // ==========================================
  cobalt: {
    id: 'cobalt',
    name: 'Electric Cobalt',
    subtitle: 'Deep Navy & Modern Blue',
    category: 'Color Palettes',
    isLight: false,
    bg: 'bg-[#080D1A]',
    bgSecondary: 'bg-[#050811]',
    cardBg: 'bg-[#0D1527]/90',
    cardInner: 'bg-[#070B14]',
    cardBorder: 'border-blue-900/40 hover:border-blue-500/50 shadow-xl',
    navBg: 'bg-[#080D1A]/90 border-slate-800/80 shadow-black/30',
    systemBarBg: 'bg-[#05080F] border-slate-900/80 text-slate-400',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    borderSubtle: 'border-slate-800/80',
    dotGrid: 'bg-[radial-gradient(#1e293b_1px,transparent_1px)] opacity-25',
    primaryGrad: 'from-blue-400 via-indigo-300 to-cyan-400',
    primaryBtn: 'from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-600/30 font-semibold',
    secondaryBtn: 'bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 border-slate-700/80',
    accentText: 'text-cyan-400',
    accentBg: 'bg-blue-500/10',
    accentBorder: 'border-blue-500/20',
    accentBadge: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    glow: 'from-blue-600/20 via-indigo-600/15 to-cyan-500/10',
    iconColor: 'text-blue-400',
    iconHover: 'group-hover:text-cyan-300',
    swatch: 'from-blue-500 to-cyan-400',
  },
  violet: {
    id: 'violet',
    name: 'Obsidian Violet',
    subtitle: 'Deep Purple & Neon Indigo',
    category: 'Color Palettes',
    isLight: false,
    bg: 'bg-[#0A0614]',
    bgSecondary: 'bg-[#06030D]',
    cardBg: 'bg-[#120B24]/90',
    cardInner: 'bg-[#090513]',
    cardBorder: 'border-purple-900/40 hover:border-purple-500/50 shadow-xl',
    navBg: 'bg-[#0A0614]/90 border-slate-800/80 shadow-black/30',
    systemBarBg: 'bg-[#06030D] border-slate-900/80 text-purple-300/80',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    borderSubtle: 'border-slate-800/80',
    dotGrid: 'bg-[radial-gradient(#2e1065_1px,transparent_1px)] opacity-25',
    primaryGrad: 'from-purple-400 via-fuchsia-300 to-indigo-300',
    primaryBtn: 'from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-600/30 font-semibold',
    secondaryBtn: 'bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 border-slate-700/80',
    accentText: 'text-purple-300',
    accentBg: 'bg-purple-500/10',
    accentBorder: 'border-purple-500/20',
    accentBadge: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
    glow: 'from-purple-600/20 via-fuchsia-600/15 to-indigo-500/10',
    iconColor: 'text-purple-400',
    iconHover: 'group-hover:text-pink-300',
    swatch: 'from-purple-500 to-pink-500',
  },
  emerald: {
    id: 'emerald',
    name: 'Cyber Emerald',
    subtitle: 'Dark Matrix & Mint Glow',
    category: 'Color Palettes',
    isLight: false,
    bg: 'bg-[#050D0A]',
    bgSecondary: 'bg-[#020705]',
    cardBg: 'bg-[#0A1A14]/90',
    cardInner: 'bg-[#040A08]',
    cardBorder: 'border-emerald-900/40 hover:border-emerald-500/50 shadow-xl',
    navBg: 'bg-[#050D0A]/90 border-slate-800/80 shadow-black/30',
    systemBarBg: 'bg-[#020705] border-slate-900/80 text-emerald-400/80',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    borderSubtle: 'border-slate-800/80',
    dotGrid: 'bg-[radial-gradient(#064e3b_1px,transparent_1px)] opacity-25',
    primaryGrad: 'from-emerald-400 via-teal-300 to-cyan-300',
    primaryBtn: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 font-semibold',
    secondaryBtn: 'bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 border-slate-700/80',
    accentText: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10',
    accentBorder: 'border-emerald-500/20',
    accentBadge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    glow: 'from-emerald-600/20 via-teal-600/15 to-cyan-500/10',
    iconColor: 'text-emerald-400',
    iconHover: 'group-hover:text-teal-300',
    swatch: 'from-emerald-500 to-teal-400',
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [currentThemeKey, setCurrentThemeKey] = useState('studioWhite'); // Default can be easily toggled

  const activeTheme = themes[currentThemeKey] || themes.studioWhite;

  const changeTheme = (key) => {
    if (themes[key]) {
      setCurrentThemeKey(key);
      localStorage.setItem('evalai_theme', key);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('evalai_theme');
    if (saved && themes[saved]) {
      setCurrentThemeKey(saved);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: activeTheme, themeKey: currentThemeKey, changeTheme, allThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
