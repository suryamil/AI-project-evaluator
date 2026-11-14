import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import StudentBenefits from './components/StudentBenefits';
import Footer from './components/Footer';
import InteractiveEvaluatorModal from './components/InteractiveEvaluatorModal';
import AuthModal from './components/AuthModal';
import ThemeSwitcher from './components/ThemeSwitcher';
import DashboardLayout from './components/dashboard/DashboardLayout';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { checkBackendHealth } from './services/api';
import { Server, CheckCircle2, RefreshCw, UserCheck, LayoutDashboard } from 'lucide-react';

function MainAppContent() {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  // 'landing' | 'dashboard'
  const [currentView, setCurrentView] = useState('landing');

  const [isEvaluatorOpen, setIsEvaluatorOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const [backendStatus, setBackendStatus] = useState('checking');
  const [serverVersion, setServerVersion] = useState(null);

  useEffect(() => {
    const probeBackend = async () => {
      try {
        const data = await checkBackendHealth();
        setBackendStatus('connected');
        setServerVersion(data.version || '0.1.0');
      } catch {
        setBackendStatus('disconnected');
      }
    };
    probeBackend();
  }, []);

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  // If in Dashboard View, render the Student Dashboard (Protected Frontend Route!)
  if (currentView === 'dashboard') {
    if (!isAuthenticated) {
      return (
        <div className={`min-h-screen ${theme.bg} ${theme.textPrimary} flex flex-col items-center justify-center p-6 text-center space-y-4`}>
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto shadow-sm">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h2 className="text-xl font-bold tracking-tight">Protected Student Dashboard</h2>
            <p className={`text-xs ${theme.textMuted} leading-relaxed`}>
              This workspace holds private project evaluations and architectural audit reports. Please sign in or create your student account to continue.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => handleOpenAuth('login')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r ${theme.primaryBtn} transition shadow-md cursor-pointer`}
            >
              Sign In to Dashboard
            </button>
            <button
              onClick={() => setCurrentView('landing')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border ${theme.secondaryBtn} transition cursor-pointer`}
            >
              Back to Home
            </button>
          </div>
          <AuthModal 
            isOpen={isAuthOpen} 
            initialMode={authMode} 
            onClose={() => setIsAuthOpen(false)} 
          />
        </div>
      );
    }

    return (
      <div className={`min-h-screen ${theme.bg} ${theme.textPrimary} transition-colors duration-500`}>
        <DashboardLayout onReturnToLanding={() => setCurrentView('landing')} />
        <ThemeSwitcher />
      </div>
    );
  }

  // Otherwise, render the Landing Page
  return (
    <div className={`min-h-screen ${theme.bg} ${theme.textPrimary} flex flex-col selection:bg-blue-500/30 selection:text-white transition-colors duration-500`}>
      {/* Top System Bar for FastAPI Status */}
      <aside aria-label="Backend Server Status" className={`${theme.systemBarBg} border-b ${theme.borderSubtle} py-1.5 px-4 text-xs transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className={`w-3.5 h-3.5 ${theme.iconColor}`} />
            <span className={`${theme.textMuted} font-medium hidden sm:inline`}>Backend API Engine:</span>
            {backendStatus === 'connected' && (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> FastAPI Online (v{serverVersion})
              </span>
            )}
            {backendStatus === 'disconnected' && (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                FastAPI Offline (Run uvicorn to connect live)
              </span>
            )}
            {backendStatus === 'checking' && (
              <span className={`inline-flex items-center gap-1 ${theme.textMuted}`}>
                <RefreshCw className="w-3 h-3 animate-spin" /> Checking server...
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Link to Student Dashboard */}
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold ${theme.accentText} hover:underline transition cursor-pointer`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Student Dashboard</span>
            </button>

            {isAuthenticated ? (
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Signed in as</span>
                <strong>{user?.fullName}</strong>
              </div>
            ) : (
              <button
                onClick={() => handleOpenAuth('login')}
                className={`text-[11px] font-semibold ${theme.textSecondary} hover:${theme.textPrimary} transition cursor-pointer`}
              >
                Sign in to save reports &rarr;
              </button>
            )}

            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
              className={`${theme.textMuted} hover:${theme.accentText} transition font-mono text-[11px]`}
            >
              Swagger /docs
            </a>
          </div>
        </div>
      </aside>

      {/* Navigation Bar */}
      <Navbar
        onOpenEvaluator={() => setIsEvaluatorOpen(true)}
        onOpenAuth={handleOpenAuth}
        onNavigateDashboard={() => setCurrentView('dashboard')}
      />

      {/* Main Sections */}
      <main className="flex-1">
        <Hero
          onOpenEvaluator={() => setIsEvaluatorOpen(true)}
        />
        <Features />
        <HowItWorks
          onOpenEvaluator={() => setIsEvaluatorOpen(true)}
        />
        <StudentBenefits
          onOpenEvaluator={() => setIsEvaluatorOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenEvaluator={() => setIsEvaluatorOpen(true)}
      />

      {/* Interactive Evaluation Simulator Modal */}
      <InteractiveEvaluatorModal
        isOpen={isEvaluatorOpen}
        onClose={() => setIsEvaluatorOpen(false)}
      />

      {/* Authentication & Student Registration Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

      {/* Floating Theme Switcher */}
      <ThemeSwitcher />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
