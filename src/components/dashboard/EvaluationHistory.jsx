import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  Search, 
  Filter, 
  Eye, 
  ShieldAlert, 
  CheckCircle2, 
  Cpu, 
  Calendar,
  Layers,
  ArrowUpDown,
  Trash2,
  Sparkles,
  Database,
  PlusCircle
} from 'lucide-react';

export default function EvaluationHistory({ 
  projects = [], 
  hasDemoData = false,
  demoCount = 0,
  userCount = 0,
  onRemoveDemoData,
  onAddDemoData,
  onSelectProject,
  onNavigateNewEval
}) {
  const { theme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL'); // 'ALL' | 'USER' | 'DEMO'

  // Filter projects based on search query, risk, and source
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.domain.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk = 
      selectedRisk === 'ALL' || 
      p.riskLevel.toLowerCase().includes(selectedRisk.toLowerCase());

    const matchesSource = 
      sourceFilter === 'ALL' ||
      (sourceFilter === 'DEMO' && p.isDemo) ||
      (sourceFilter === 'USER' && !p.isDemo);

    return matchesSearch && matchesRisk && matchesSource;
  });

  return (
    <div className="space-y-6">
      {/* Header with Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold ${theme.textPrimary}`}>Evaluation History &amp; Audit Logs</h2>
          <p className={`text-xs ${theme.textMuted} mt-0.5`}>
            Search, filter, and review historical AI project feasibility audits and failure vectors.
          </p>
        </div>

        {/* Demo Data Management Button */}
        <div className="flex items-center gap-2">
          {hasDemoData ? (
            <button
              onClick={onRemoveDemoData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition cursor-pointer shadow-sm active:scale-95"
              title="Remove sample demo evaluations from history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Demo Data ({demoCount})</span>
            </button>
          ) : (
            <button
              onClick={onAddDemoData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-blue-500/30 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition cursor-pointer shadow-sm active:scale-95"
              title="Load 5 realistic demo projects"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Demo Data (+5)</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-3 shadow-sm`}>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className={`w-4 h-4 absolute left-3.5 top-3 ${theme.textMuted}`} />
            <input
              type="text"
              placeholder="Search by project name, model, domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                theme.isLight
                  ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white'
                  : 'bg-[#080C14] border border-slate-700/80 text-white focus:border-blue-500'
              }`}
            />
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'Low Risk', 'Moderate Risk', 'High Risk'].map((risk) => (
              <button
                key={risk}
                onClick={() => setSelectedRisk(risk)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium whitespace-nowrap cursor-pointer ${
                  selectedRisk === risk
                    ? `${theme.accentBg} ${theme.accentBorder} ${theme.accentText} font-bold`
                    : `${theme.cardInner} ${theme.borderSubtle} ${theme.textSecondary} hover:border-slate-400`
                }`}
              >
                {risk}
              </button>
            ))}
          </div>
        </div>

        {/* Source Filter Tabs (All / My Evaluations / Demo) */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-xs">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold ${theme.textMuted}`}>Source:</span>
            <button
              onClick={() => setSourceFilter('ALL')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                sourceFilter === 'ALL'
                  ? `${theme.accentBadge} font-bold`
                  : `${theme.textSecondary} hover:${theme.textPrimary}`
              }`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setSourceFilter('USER')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                sourceFilter === 'USER'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                  : `${theme.textSecondary} hover:${theme.textPrimary}`
              }`}
            >
              My Evaluations ({userCount})
            </button>
            <button
              onClick={() => setSourceFilter('DEMO')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                sourceFilter === 'DEMO'
                  ? 'bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30'
                  : `${theme.textSecondary} hover:${theme.textPrimary}`
              }`}
            >
              Demo Projects ({demoCount})
            </button>
          </div>

          <span className={`text-[11px] ${theme.textMuted}`}>
            Showing {filteredProjects.length} of {projects.length}
          </span>
        </div>
      </div>

      {/* Project Table / Cards */}
      <div className={`rounded-2xl ${theme.cardBg} border ${theme.cardBorder} overflow-hidden shadow-sm`}>
        {filteredProjects.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <p className="text-sm font-semibold">No project evaluations match your filters.</p>
            <p className="text-xs text-slate-500 mt-1">
              {projects.length === 0 
                ? 'Your evaluation history is starting at 0 evaluated projects.' 
                : 'Try adjusting your search query, risk filters, or source selector.'}
            </p>
            {projects.length === 0 && (
              <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                <button
                  onClick={onAddDemoData}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-blue-500/30 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition cursor-pointer`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Restore 5 Demo Projects</span>
                </button>
                {onNavigateNewEval && (
                  <button
                    onClick={onNavigateNewEval}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r ${theme.primaryBtn} transition cursor-pointer`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Evaluate New Project</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Responsive Cards (sm:hidden) */}
            <div className="sm:hidden divide-y divide-slate-700/40">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => onSelectProject(proj)}
                  className={`p-4 space-y-2.5 transition active:scale-[0.99] cursor-pointer hover:${theme.cardInner}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${theme.cardInner} border ${theme.borderSubtle}`}>
                          {proj.domain}
                        </span>
                        {proj.isDemo ? (
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
                        {proj.title}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-mono font-bold text-sm block ${
                        proj.feasibilityScore > 75 ? 'text-emerald-500' : proj.feasibilityScore > 50 ? 'text-amber-500' : 'text-rose-500'
                      }`}>
                        {proj.feasibilityScore}%
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${proj.riskColor}`}>
                        {proj.riskLevel}
                      </span>
                    </div>
                  </div>

                  <p className={`text-xs ${theme.textSecondary} line-clamp-2 leading-relaxed`}>
                    {proj.primaryRisk}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] border-t border-slate-700/40 text-slate-400">
                    <span className="font-mono text-[10px] truncate max-w-[170px]">{proj.model}</span>
                    <span className={`font-semibold ${theme.accentText} flex items-center gap-1`}>
                      <Eye className="w-3 h-3" /> View Audit &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (hidden sm:block) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`${theme.cardInner} border-b ${theme.borderSubtle} ${theme.textMuted} font-semibold uppercase tracking-wider`}>
                  <tr>
                    <th className="p-4">Project Name &amp; Domain</th>
                    <th className="p-4">Model Architecture</th>
                    <th className="p-4">Feasibility Score</th>
                    <th className="p-4">Primary Risk Bottleneck</th>
                    <th className="p-4">Evaluated Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme.borderSubtle}`}>
                  {filteredProjects.map((proj) => (
                    <tr 
                      key={proj.id}
                      className={`transition hover:${theme.cardInner} cursor-pointer`}
                      onClick={() => onSelectProject(proj)}
                    >
                      <td className="p-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <div className={`font-bold ${theme.textPrimary} line-clamp-1`}>{proj.title}</div>
                          {proj.isDemo ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                              DEMO
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                              MY EVAL
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded ${theme.cardInner} border ${theme.borderSubtle} ${theme.textMuted} mt-1 inline-block`}>
                          {proj.domain}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className={`font-mono font-medium ${theme.textSecondary}`}>{proj.model}</div>
                        <div className={`text-[11px] ${theme.textMuted}`}>{proj.hardware}</div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold text-sm ${
                            proj.feasibilityScore > 75 ? 'text-emerald-500' : proj.feasibilityScore > 50 ? 'text-amber-500' : 'text-rose-500'
                          }`}>
                            {proj.feasibilityScore}%
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${proj.riskColor}`}>
                            {proj.riskLevel}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 max-w-sm">
                        <p className={`line-clamp-2 ${theme.textSecondary} leading-relaxed`}>
                          {proj.primaryRisk}
                        </p>
                      </td>

                      <td className="p-4 text-slate-400 whitespace-nowrap">
                        {proj.evaluatedAt}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProject(proj);
                          }}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold ${theme.secondaryBtn} transition cursor-pointer shadow-sm`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Audit</span>
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
