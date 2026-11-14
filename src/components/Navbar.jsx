import { useState, useEffect } from 'react';
import { 
  Brain, 
  Menu, 
  X, 
  ArrowRight, 
  Sparkles, 
  Palette, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  ChevronDown, 
  GraduationCap,
  LayoutDashboard 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenEvaluator, onOpenAuth, onNavigateDashboard }) {
  const { theme, themeKey, changeTheme, allThemes } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'For Students', href: '#benefits' },
    { name: 'Live Preview', href: '#preview' },
  ];

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? `${theme.navBg} backdrop-blur-md border-b py-3 shadow-lg`
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Project Title */}
          <a href="#" className="flex items-center gap-3 group">
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr ${theme.swatch} p-0.5 shadow-md group-hover:scale-105 transition`}>
              <div className={`w-full h-full ${theme.cardBg} rounded-[10px] flex items-center justify-center`}>
                <Brain className={`w-5 h-5 ${theme.iconColor} transition duration-300`} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className={`text-lg font-bold tracking-tight ${theme.textPrimary} flex items-center gap-1.5`}>
                Eval<span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.primaryGrad}`}>AI</span>
                <span className={`text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded ${theme.accentBadge} hidden sm:inline-block`}>
                  PRO
                </span>
              </span>
              <span className={`text-[11px] ${theme.textMuted} font-medium tracking-tight -mt-0.5 hidden sm:block`}>
                AI Project Evaluator &amp; Failure Predictor
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium ${theme.textSecondary} hover:${theme.textPrimary} transition hover:scale-105 duration-200`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right Section: Palette Selector + Dashboard / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Quick Palette Dropdown in Nav */}
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${
                  theme.isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                } transition cursor-pointer`}
                title="Change website color palette"
              >
                {theme.isLight ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
                <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-tr ${theme.swatch}`} />
                <span>{theme.name.split(' ')[0]}</span>
                <Palette className="w-3.5 h-3.5 opacity-60" />
              </button>

              {themeDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-56 rounded-xl ${theme.isLight ? 'bg-white border-slate-200 shadow-xl' : 'bg-[#0D1322] border-slate-700 shadow-2xl'} border p-2 z-50 animate-in fade-in duration-150 max-h-80 overflow-y-auto`}>
                  <div className={`text-[10px] uppercase tracking-wider font-bold ${theme.textMuted} px-2 py-1`}>
                    Choose Theme:
                  </div>
                  {Object.values(allThemes).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        changeTheme(t.id);
                        setThemeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                        themeKey === t.id
                          ? theme.isLight
                            ? 'bg-blue-50 text-blue-900 font-semibold'
                            : 'bg-slate-800 text-white font-semibold'
                          : theme.isLight
                          ? 'text-slate-700 hover:bg-slate-100'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full bg-gradient-to-tr ${t.swatch} shrink-0 border border-slate-400/30`} />
                        <span>{t.name}</span>
                      </div>
                      <span className={`text-[9px] ${theme.textMuted}`}>{t.category.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Link to Student Dashboard */}
            <button
              onClick={onNavigateDashboard}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${theme.cardBorder} ${theme.cardInner} hover:${theme.cardBg} transition cursor-pointer shadow-sm`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-500" />
              <span>Student Dashboard</span>
            </button>

            {/* Authentication Buttons or Logged-in User Profile */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${theme.textSecondary} hover:${theme.textPrimary} transition cursor-pointer`}
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold text-xs bg-gradient-to-r ${theme.primaryBtn} transition shadow-md cursor-pointer active:scale-95`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            ) : (
              /* User Profile Menu */
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`inline-flex items-center gap-2 p-1.5 pr-2.5 rounded-full border ${theme.cardBorder} ${theme.cardBg} transition cursor-pointer shadow-sm hover:scale-105`}
                >
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${theme.swatch} text-white font-bold text-[11px] flex items-center justify-center shadow-inner`}>
                    {getInitials(user?.fullName)}
                  </div>
                  <span className={`text-xs font-bold ${theme.textPrimary} max-w-[100px] truncate hidden lg:inline`}>
                    {user?.fullName?.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-3 h-3 ${theme.textMuted}`} />
                </button>

                {userDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-64 rounded-xl ${theme.cardBg} border ${theme.borderSubtle} p-3 shadow-2xl z-50 animate-in fade-in duration-150`}>
                    <div className={`pb-3 border-b ${theme.borderSubtle}`}>
                      <div className={`text-xs font-bold ${theme.textPrimary}`}>{user?.fullName}</div>
                      <div className={`text-[11px] ${theme.textMuted} truncate`}>{user?.email}</div>
                      <div className={`mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${theme.accentBadge}`}>
                        <GraduationCap className="w-3 h-3" />
                        <span>{user?.university || 'University Researcher'}</span>
                      </div>
                    </div>

                    <div className="py-2 space-y-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigateDashboard();
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${theme.textSecondary} hover:${theme.textPrimary} hover:${theme.cardInner} transition text-left cursor-pointer font-semibold`}
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-blue-500" />
                        <span>Open Student Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenEvaluator();
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${theme.textSecondary} hover:${theme.textPrimary} hover:${theme.cardInner} transition text-left cursor-pointer`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        <span>Quick Project Evaluator</span>
                      </button>
                    </div>

                    <div className={`pt-2 border-t ${theme.borderSubtle}`}>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-500 hover:bg-rose-500/10 transition text-left cursor-pointer font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out / Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg ${theme.textSecondary} hover:${theme.textPrimary} transition focus:outline-none`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={`md:hidden ${theme.navBg} border-b ${theme.borderSubtle} px-4 pt-3 pb-6 space-y-4 shadow-xl`}>
          
          {/* User status in mobile */}
          {isAuthenticated && (
            <div className={`p-3 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} flex items-center justify-between`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${theme.swatch} text-white font-bold text-xs flex items-center justify-center`}>
                  {getInitials(user?.fullName)}
                </div>
                <div>
                  <div className={`text-xs font-bold ${theme.textPrimary}`}>{user?.fullName}</div>
                  <div className={`text-[10px] ${theme.textMuted}`}>{user?.email}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition text-xs"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Direct link to dashboard in mobile drawer */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigateDashboard();
            }}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Open Student Dashboard</span>
          </button>

          <div className="flex flex-col space-y-1.5">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${theme.textSecondary} hover:${theme.textPrimary} transition`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Auth buttons in mobile drawer */}
          {!isAuthenticated ? (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className={`py-2 rounded-xl text-xs font-semibold ${theme.secondaryBtn} border`}
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('register');
                }}
                className={`py-2 rounded-xl text-xs font-semibold bg-gradient-to-r ${theme.primaryBtn}`}
              >
                Student Sign Up
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20"
            >
              Sign Out / Log Out
            </button>
          )}

          {/* Theme selector in mobile drawer */}
          <div className={`pt-2 border-t ${theme.borderSubtle}`}>
            <div className={`text-xs font-semibold ${theme.textMuted} mb-2`}>Choose Color Palette:</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(allThemes).map((t) => (
                <button
                  key={t.id}
                  onClick={() => changeTheme(t.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs border ${
                    themeKey === t.id
                      ? 'bg-blue-500/10 border-blue-500 font-semibold'
                      : `${theme.cardInner} ${theme.borderSubtle} ${theme.textSecondary}`
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full bg-gradient-to-tr ${t.swatch} border border-slate-400/30`} />
                  <span className="truncate">{t.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
