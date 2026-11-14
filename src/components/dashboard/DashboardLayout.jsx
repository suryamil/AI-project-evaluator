import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getAllProjectsAPI } from '../../services/api';
import { DEMO_PROJECTS } from './demoData';
import DashboardOverview from './DashboardOverview';
import ProjectSubmissionForm from './ProjectSubmissionForm';
import EvaluationHistory from './EvaluationHistory';
import StudentProfile from './StudentProfile';
import EvaluationDetailModal from './EvaluationDetailModal';
import ProjectAssistantChat from './ProjectAssistantChat';
import DevelopmentRoadmap from './DevelopmentRoadmap';
import { 
  Brain, 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  User, 
  ArrowLeft, 
  LogOut, 
  Menu, 
  X, 
  Sparkles,
  Palette,
  Trash2,
  Database,
  CheckCircle2,
  Bot,
  ListChecks
} from 'lucide-react';

export default function DashboardLayout({ onReturnToLanding }) {
  const { theme, themeKey, changeTheme, allThemes } = useTheme();
  const { user, logout } = useAuth();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'new-eval' | 'history' | 'profile'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Projects state initialized to 0 evaluated projects by default
  const [projects, setProjects] = useState(() => {
    try {
      // First-time reset migration: ensure user starts cleanly at 0 evaluated projects
      const startedZero = localStorage.getItem('evalai_start_at_zero_v1');
      if (!startedZero) {
        localStorage.setItem('evalai_start_at_zero_v1', 'true');
        localStorage.removeItem('evalai_student_projects');
        return []; // Clean start from 0 evaluated!
      }
      const saved = localStorage.getItem('evalai_student_projects');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return []; // Starts from 0 evaluated projects
  });

  // Project selected for full audit modal view
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Floating feedback notification toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const demoProjects = projects.filter((p) => p.isDemo);
  const hasDemoData = demoProjects.length > 0;
  const userProjectsCount = projects.filter((p) => !p.isDemo).length;

  const handleRemoveDemoData = () => {
    setProjects((prev) => prev.filter((p) => !p.isDemo));
    showToast(`Removed ${demoProjects.length} demo projects. You now have ${userProjectsCount} personal projects.`);
  };

  const handleAddDemoData = () => {
    setProjects((prev) => {
      const personalOnly = prev.filter((p) => !p.isDemo);
      return [...DEMO_PROJECTS, ...personalOnly];
    });
    showToast(`Loaded ${DEMO_PROJECTS.length} realistic academic demo capstones.`);
  };

  const handleResetToZero = () => {
    setProjects([]);
    showToast('Reset dashboard to 0 evaluated projects.');
  };

  useEffect(() => {
    try {
      localStorage.setItem('evalai_student_projects', JSON.stringify(projects));
    } catch (e) {
      console.error(e);
    }
  }, [projects]);

  // Retrieve previous project evaluations from MongoDB database on load
  useEffect(() => {
    let isMounted = true;
    const fetchPreviousEvaluations = async () => {
      try {
        const res = await getAllProjectsAPI(user?.id);
        if (isMounted && res?.projects && res.projects.length > 0) {
          setProjects((prev) => {
            const demoItems = prev.filter((p) => p.isDemo);
            const existingMap = new Map();
            res.projects.forEach((p) => existingMap.set(p.id, p));
            prev.filter((p) => !p.isDemo).forEach((p) => {
              if (!existingMap.has(p.id)) existingMap.set(p.id, p);
            });
            return [...demoItems, ...Array.from(existingMap.values())];
          });
        }
      } catch (err) {
        console.warn('MongoDB projects retrieval sync:', err);
      }
    };

    fetchPreviousEvaluations();
    return () => { isMounted = false; };
  }, [user]);

  const handleAddNewProject = (newProject) => {
    setProjects((prev) => [newProject, ...prev]);
    showToast(`"${newProject.title}" evaluated and saved successfully!`);
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'new-eval', label: 'Submit Project', icon: PlusCircle },
    { id: 'assistant', label: 'AI Project Assistant', icon: Bot },
    { id: 'roadmap', label: 'Development Roadmap', icon: ListChecks },
    { id: 'history', label: 'Evaluation History', icon: History },
    { id: 'profile', label: 'Student Profile', icon: User },
  ];

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.textPrimary} flex transition-colors duration-500`}>
      
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Desktop sticky & Mobile drawer) */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 ${theme.cardBg} border-r ${theme.borderSubtle} flex flex-col justify-between p-5 transition-transform duration-300 lg:translate-x-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Logo & Close */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${theme.swatch} flex items-center justify-center text-white p-0.5 shadow-md`}>
                <div className={`w-full h-full ${theme.cardBg} rounded-[10px] flex items-center justify-center`}>
                  <Brain className={`w-4 h-4 ${theme.iconColor}`} />
                </div>
              </div>
              <div>
                <span className={`text-base font-bold tracking-tight ${theme.textPrimary}`}>
                  Eval<span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.primaryGrad}`}>AI</span>
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-wider ml-1.5 px-1.5 py-0.5 rounded ${theme.accentBadge}`}>
                  STUDENT
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className={`p-1.5 rounded-lg ${theme.textMuted} hover:${theme.textPrimary} lg:hidden transition`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? `${theme.accentBg} ${theme.accentText} border ${theme.accentBorder} shadow-sm font-bold`
                      : `${theme.textSecondary} hover:${theme.textPrimary} hover:${theme.cardInner}`
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Controls */}
        <div className={`pt-4 border-t ${theme.borderSubtle} space-y-3`}>
          
          {/* MongoDB Connection Status Pill */}
          <div className={`px-3 py-2 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className={`text-[11px] font-bold ${theme.textPrimary}`}>MongoDB Database</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              6 Collections
            </span>
          </div>

          {/* Demo Data Quick Control Card */}
          <div className={`p-3 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} space-y-2`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-500" />
                <span className={`text-[11px] font-bold ${theme.textPrimary}`}>Demo Data</span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                hasDemoData 
                  ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                  : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
              }`}>
                {hasDemoData ? `${demoProjects.length} Loaded` : 'Cleared'}
              </span>
            </div>
            <p className={`text-[10px] ${theme.textMuted} leading-tight`}>
              {hasDemoData 
                ? '5 sample capstone evaluations active.' 
                : `${userProjectsCount} personal project evaluations active.`}
            </p>
            {hasDemoData ? (
              <button
                onClick={handleRemoveDemoData}
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                title="Remove the 5 sample demo projects"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove Demo Data</span>
              </button>
            ) : (
              <button
                onClick={handleAddDemoData}
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-blue-500/30 text-blue-500 hover:bg-blue-500/10 transition cursor-pointer"
                title="Load 5 realistic demo projects"
              >
                <Sparkles className="w-3 h-3" />
                <span>Load Demo Data</span>
              </button>
            )}
          </div>

          {/* Return to Public Website */}
          <button
            onClick={onReturnToLanding}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${theme.textSecondary} hover:${theme.textPrimary} hover:${theme.cardInner} transition cursor-pointer`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Landing Page</span>
          </button>

          {/* User Profile Pill & Sign Out */}
          <div className={`p-2.5 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} flex items-center justify-between`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${theme.swatch} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                {getInitials(user?.fullName)}
              </div>
              <div className="truncate text-left">
                <div className={`text-xs font-bold ${theme.textPrimary} truncate`}>
                  {user?.fullName || 'Student'}
                </div>
                <div className={`text-[10px] ${theme.textMuted} truncate`}>
                  {user?.email || 'student@univ.edu'}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* Top Bar Header */}
        <header className={`h-16 ${theme.navBg} border-b ${theme.borderSubtle} px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className={`p-2 rounded-lg ${theme.textSecondary} hover:${theme.textPrimary} lg:hidden transition`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className={`text-sm sm:text-lg font-bold ${theme.textPrimary} capitalize truncate max-w-[130px] sm:max-w-none`}>
              {navItems.find((n) => n.id === activeTab)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Demo Data Header Button */}
            {hasDemoData ? (
              <button
                onClick={handleRemoveDemoData}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition cursor-pointer shadow-sm"
                title="Remove the 5 sample demo projects from your dashboard"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Remove Demo Data</span>
                <span className="sm:hidden">Demo</span>
                <span className="px-1.5 py-0.2 text-[10px] bg-rose-500/20 rounded font-mono">
                  {demoProjects.length}
                </span>
              </button>
            ) : (
              <button
                onClick={handleAddDemoData}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border border-blue-500/30 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition cursor-pointer shadow-sm"
                title="Load 5 realistic demo projects to explore dashboard features"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Load Demo Data</span>
                <span className="sm:hidden">+Demo</span>
                <span className="px-1.5 py-0.2 text-[10px] bg-blue-500/20 rounded font-mono">
                  +5
                </span>
              </button>
            )}

            {/* New Project Evaluation Button */}
            {activeTab !== 'new-eval' && (
              <button
                onClick={() => setActiveTab('new-eval')}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r ${theme.primaryBtn} transition shadow-sm cursor-pointer`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Submit Project Proposal</span>
                <span className="sm:hidden">Submit</span>
              </button>
            )}
          </div>
        </header>

        {/* Tab Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <DashboardOverview 
              projects={projects}
              hasDemoData={hasDemoData}
              demoCount={demoProjects.length}
              userCount={userProjectsCount}
              onRemoveDemoData={handleRemoveDemoData}
              onAddDemoData={handleAddDemoData}
              onSelectProject={(p) => setSelectedProject(p)}
              onNavigateNewEval={() => setActiveTab('new-eval')}
            />
          )}

          {activeTab === 'new-eval' && (
            <ProjectSubmissionForm 
              onProjectEvaluated={(newP) => {
                handleAddNewProject(newP);
                setActiveTab('history');
              }}
              onCancel={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'assistant' && (
            <ProjectAssistantChat 
              activeProject={selectedProject || projects[0]}
              allProjects={projects}
            />
          )}

          {activeTab === 'roadmap' && (
            <DevelopmentRoadmap 
              activeProject={selectedProject || projects[0]}
              allProjects={projects}
            />
          )}

          {activeTab === 'history' && (
            <EvaluationHistory 
              projects={projects}
              hasDemoData={hasDemoData}
              demoCount={demoProjects.length}
              userCount={userProjectsCount}
              onRemoveDemoData={handleRemoveDemoData}
              onAddDemoData={handleAddDemoData}
              onSelectProject={(p) => setSelectedProject(p)}
              onNavigateNewEval={() => setActiveTab('new-eval')}
            />
          )}

          {activeTab === 'profile' && (
            <StudentProfile />
          )}
        </main>
      </div>

      {/* Floating Action Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-2xl animate-in slide-in-from-bottom duration-300 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Full Audit Detail Modal */}
      <EvaluationDetailModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />

    </div>
  );
}
