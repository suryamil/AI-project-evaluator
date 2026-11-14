import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  AlertTriangle,
  Info,
  DollarSign,
  Trash2,
  Database,
  PlusCircle
} from 'lucide-react';

export default function DashboardOverview({ 
  projects = [], 
  hasDemoData = false,
  demoCount = 0,
  userCount = 0,
  onRemoveDemoData,
  onAddDemoData,
  onResetToZero,
  onSelectProject, 
  onNavigateNewEval 
}) {
  const { theme } = useTheme();
  const { user } = useAuth();

  // Compute live metrics from projects array
  const totalEvaluated = projects.length;
  const avgFeasibility = totalEvaluated > 0
    ? (projects.reduce((acc, p) => acc + p.feasibilityScore, 0) / totalEvaluated).toFixed(1)
    : 0;
  const highRiskCount = projects.filter((p) => p.feasibilityScore < 50).length;
  const safeCount = projects.filter((p) => p.feasibilityScore >= 75).length;

  return (
    <div className="space-y-6">
      
      {/* Demo Data Interactive Status Banner */}
      {hasDemoData ? (
        <div className={`p-4 rounded-xl border border-blue-500/30 ${theme.accentBg} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${theme.textPrimary}`}>
                  Simulation Mode Active ({demoCount} Demo Capstones Loaded)
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${theme.accentBadge} uppercase tracking-wider`}>
                  Demo
                </span>
              </div>
              <p className={`text-[11px] ${theme.textMuted} mt-0.5`}>
                Loaded with 5 realistic academic evaluations (YOLOv8x Pi 4, LLaMA-3 RAG, ICU Arrhythmia, etc.). New evaluations you run will appear here automatically.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={onRemoveDemoData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition cursor-pointer shadow-sm active:scale-95"
              title="Remove sample demo evaluations back to 0 or personal projects"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Demo Data</span>
            </button>
          </div>
        </div>
      ) : (
        <div className={`p-4 rounded-xl border ${theme.borderSubtle} ${theme.cardInner} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${userCount === 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'} shrink-0`}>
              {userCount === 0 ? <Database className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${theme.textPrimary}`}>
                  {userCount === 0 ? 'Fresh Start: 0 Projects Evaluated' : `Personal Workspace (${userCount} Evaluation${userCount === 1 ? '' : 's'})`}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                  userCount === 0 
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                } uppercase tracking-wider`}>
                  {userCount === 0 ? '0 Evaluated' : 'Live Data'}
                </span>
              </div>
              <p className={`text-[11px] ${theme.textMuted} mt-0.5`}>
                {userCount === 0 
                  ? 'Your dashboard is starting with 0 evaluated projects. You can run your own evaluation or load 5 demo projects below.' 
                  : 'Demo data is removed. Only your own submitted project evaluations are displayed.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={onAddDemoData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-500/30 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition cursor-pointer shadow-sm active:scale-95"
              title="Load 5 realistic demo projects"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Demo Data (+5)</span>
            </button>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm relative overflow-hidden`}>
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Feasibility Command Center</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold ${theme.textPrimary} tracking-tight`}>
            Welcome back, {user?.fullName || 'Student Researcher'}!
          </h1>
          <p className={`text-xs sm:text-sm ${theme.textSecondary} max-w-xl leading-relaxed`}>
            Your projects have been audited for memory bottlenecks, inference latency, and data leakage risks. 
            Review your failure reports or launch a new evaluation below.
          </p>
        </div>

        <button
          onClick={onNavigateNewEval}
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r ${theme.primaryBtn} transition shadow-md shrink-0 cursor-pointer active:scale-95 z-10`}
        >
          <Sparkles className="w-4 h-4" />
          <span>New Project Evaluation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Evaluated */}
        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-sm space-y-2`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${theme.textMuted}`}>Total Evaluated</span>
            <div className={`p-2 rounded-lg ${theme.cardInner} text-blue-500 border ${theme.borderSubtle}`}>
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-mono ${theme.textPrimary}`}>
            {totalEvaluated}
          </div>
          <p className={`text-[11px] ${theme.textMuted}`}>Capstone proposals audited</p>
        </div>

        {/* Card 2: Average Feasibility */}
        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-sm space-y-2`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${theme.textMuted}`}>Average Feasibility</span>
            <div className={`p-2 rounded-lg ${theme.cardInner} text-emerald-500 border ${theme.borderSubtle}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-500">
            {avgFeasibility}%
          </div>
          <p className={`text-[11px] ${theme.textMuted}`}>Across all architecture vectors</p>
        </div>

        {/* Card 3: High Risk Projects */}
        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-sm space-y-2`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${theme.textMuted}`}>High Risk Detected</span>
            <div className={`p-2 rounded-lg ${theme.cardInner} text-rose-500 border ${theme.borderSubtle}`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-rose-500">
            {highRiskCount}
          </div>
          <p className="text-[11px] text-rose-500/80 font-medium">Requires architectural redesign</p>
        </div>

        {/* Card 4: Safe / Approved Projects */}
        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-sm space-y-2`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${theme.textMuted}`}>Production Feasible</span>
            <div className={`p-2 rounded-lg ${theme.cardInner} text-teal-500 border ${theme.borderSubtle}`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-teal-500">
            {safeCount}
          </div>
          <p className={`text-[11px] ${theme.textMuted}`}>Ready for faculty approval</p>
        </div>

      </div>

      {/* Recent Evaluations Table */}
      <div className={`p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-4 shadow-sm`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div>
            <h3 className={`text-base font-bold ${theme.textPrimary}`}>Recent Project Evaluations</h3>
            <p className={`text-xs ${theme.textMuted}`}>Click on any project to view full failure vectors and recommendations.</p>
          </div>
          <span className={`text-xs font-bold ${theme.accentText}`}>
            {projects.length > 0 ? `Showing Latest ${Math.min(5, projects.length)} of ${projects.length}` : '0 Projects'}
          </span>
        </div>

        {projects.length === 0 ? (
          <div className={`p-10 text-center rounded-xl ${theme.cardInner} border ${theme.borderSubtle} space-y-4`}>
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 mx-auto flex items-center justify-center border border-blue-500/20 shadow-inner">
              <Database className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h4 className={`text-base font-bold ${theme.textPrimary}`}>0 Projects Evaluated (Clean Start)</h4>
              <p className={`text-xs ${theme.textMuted} max-w-md mx-auto leading-relaxed`}>
                Your dashboard starts at 0 evaluated projects. You can begin by running an AI feasibility audit on your own proposal, or load the 5 realistic demo capstones to see how the platform works.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onNavigateNewEval}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r ${theme.primaryBtn} transition shadow-sm cursor-pointer active:scale-95`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Evaluate Your First Project</span>
              </button>
              <button
                onClick={onAddDemoData}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-blue-500/40 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition cursor-pointer active:scale-95 shadow-sm`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Load 5 Demo Capstones</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Responsive Cards (sm:hidden) */}
            <div className="sm:hidden space-y-3">
              {projects.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className={`p-4 rounded-xl border ${theme.borderSubtle} ${theme.cardInner} space-y-2.5 transition active:scale-[0.99] cursor-pointer`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${theme.cardBg} border ${theme.borderSubtle}`}>
                          {p.domain}
                        </span>
                        {p.isDemo ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            DEMO
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            MY EVAL
                          </span>
                        )}
                      </div>
                      <h4 className={`text-sm font-bold ${theme.textPrimary} mt-1 truncate`}>
                        {p.title}
                      </h4>
                    </div>
                    <span className={`text-xs font-mono font-black shrink-0 ${
                      p.feasibilityScore > 75 ? 'text-emerald-400' : p.feasibilityScore > 50 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {p.feasibilityScore}%
                    </span>
                  </div>

                  <p className={`text-xs ${theme.textMuted} line-clamp-2 leading-relaxed`}>
                    {p.primaryRisk}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] border-t border-slate-700/40">
                    <span className="text-slate-400 font-mono text-[10px] truncate max-w-[180px]">{p.model}</span>
                    <span className={`font-semibold ${theme.accentText}`}>Audit &rarr;</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (hidden sm:block) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`${theme.cardInner} border-b ${theme.borderSubtle} ${theme.textMuted} font-semibold uppercase tracking-wider`}>
                  <tr>
                    <th className="p-3">Project Title</th>
                    <th className="p-3">Domain</th>
                    <th className="p-3">Proposed Model</th>
                    <th className="p-3">Feasibility Score</th>
                    <th className="p-3">Primary Risk Vector</th>
                    <th className="p-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme.borderSubtle}`}>
                  {projects.slice(0, 5).map((p) => (
                    <tr 
                      key={p.id}
                      onClick={() => onSelectProject(p)}
                      className={`transition hover:${theme.cardInner} cursor-pointer`}
                    >
                      <td className={`p-3 font-bold ${theme.textPrimary} max-w-xs`}>
                        <div className="flex items-center gap-2">
                          <span className="truncate">{p.title}</span>
                          {p.isDemo ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                              DEMO
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                              MY EVAL
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-slate-400">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${theme.cardInner} border ${theme.borderSubtle}`}>
                          {p.domain.split(' ')[0]}
                        </span>
                      </td>
                      <td className={`p-3 font-mono ${theme.textSecondary}`}>
                        {p.model}
                      </td>
                      <td className="p-3">
                        <span className={`font-mono font-bold text-xs ${
                          p.feasibilityScore > 75 ? 'text-emerald-500' : p.feasibilityScore > 50 ? 'text-amber-500' : 'text-rose-500'
                        }`}>
                          {p.feasibilityScore}% ({p.riskLevel})
                        </span>
                      </td>
                      <td className={`p-3 max-w-sm truncate ${theme.textMuted}`}>
                        {p.primaryRisk}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProject(p);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${theme.secondaryBtn} transition`}
                        >
                          Audit &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
