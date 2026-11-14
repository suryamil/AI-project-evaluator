import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  ListChecks,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  RefreshCw,
  Plus,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Wrench,
  ShieldCheck,
  Rocket,
  FolderGit2,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';
import {
  getProjectRoadmapAPI,
  generateProjectRoadmapAPI,
  toggleRoadmapTaskAPI,
  addCustomRoadmapTaskAPI
} from '../../services/api';

const PHASE_ICONS = [
  FolderGit2, // Phase 1: Foundation & Data
  Cpu,        // Phase 2: Core ML / Algorithmic
  Layers,     // Phase 3: API & UI Integration
  ShieldCheck,// Phase 4: Testing & QA
  Rocket      // Phase 5: Deployment & Release
];

const CATEGORY_COLORS = {
  architecture: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  dataset: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  coding: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  testing: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  deployment: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  documentation: 'text-teal-400 bg-teal-500/10 border-teal-500/20'
};

export default function DevelopmentRoadmap({ activeProject, allProjects = [] }) {
  const { theme } = useTheme();
  const [selectedProjectId, setSelectedProjectId] = useState(
    activeProject?.id || (allProjects.length > 0 ? allProjects[0].id : 'proj_demo')
  );
  const [roadmap, setRoadmap] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [taskFilter, setTaskFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'COMPLETED'
  const [expandedPhases, setExpandedPhases] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskPhase, setNewTaskPhase] = useState(1);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('coding');
  const [newTaskHours, setNewTaskHours] = useState('3-5 hrs');

  // Sync selected project from props
  useEffect(() => {
    if (activeProject?.id && activeProject.id !== selectedProjectId) {
      setSelectedProjectId(activeProject.id);
    }
  }, [activeProject?.id]);

  // Load roadmap when project changes
  useEffect(() => {
    loadRoadmap();
  }, [selectedProjectId]);

  const loadRoadmap = async () => {
    setIsLoading(true);
    try {
      const res = await getProjectRoadmapAPI(selectedProjectId);
      if (res?.roadmap) {
        setRoadmap(res.roadmap);
        // Default expand first 2 phases
        setExpandedPhases({ 1: true, 2: true });
      }
    } catch (err) {
      console.error('Failed to load roadmap', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm('Regenerate personalized roadmap with Gemini AI? Custom task tracking will be refreshed.')) return;
    setIsRegenerating(true);
    try {
      const res = await generateProjectRoadmapAPI(selectedProjectId);
      if (res?.roadmap) {
        setRoadmap(res.roadmap);
        setExpandedPhases({ 1: true, 2: true });
      }
    } catch (err) {
      console.error('Failed to regenerate roadmap', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleToggleTask = async (taskId, currentCompleted) => {
    // Optimistic UI update
    setRoadmap((prev) => {
      if (!prev) return prev;
      const updatedPhases = prev.phases.map((p) => ({
        ...p,
        tasks: p.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: !currentCompleted } : t
        )
      }));
      const total = prev.total_tasks;
      const completedCount = updatedPhases.reduce(
        (acc, p) => acc + p.tasks.filter((t) => t.completed).length,
        0
      );
      const prog = total > 0 ? Math.round((completedCount / total) * 1000) / 10 : 0;

      return {
        ...prev,
        phases: updatedPhases,
        completed_tasks: completedCount,
        progress_percentage: prog
      };
    });

    try {
      const res = await toggleRoadmapTaskAPI(selectedProjectId, taskId);
      if (res?.roadmap) {
        setRoadmap(res.roadmap);
      }
    } catch (err) {
      console.error('Failed to toggle task in database', err);
      // Revert if error
      loadRoadmap();
    }
  };

  const handleCreateCustomTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const payload = {
        phase_number: Number(newTaskPhase),
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        category: newTaskCategory,
        estimated_hours: newTaskHours.trim() || '3-5 hrs'
      };

      const res = await addCustomRoadmapTaskAPI(selectedProjectId, payload);
      if (res?.roadmap) {
        setRoadmap(res.roadmap);
        setExpandedPhases((prev) => ({ ...prev, [newTaskPhase]: true }));
      }
      setIsAddModalOpen(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
    } catch (err) {
      console.error('Failed to add custom task', err);
    }
  };

  const togglePhaseExpand = (phaseNum) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseNum]: !prev[phaseNum]
    }));
  };

  const currentProject = allProjects.find((p) => p.id === selectedProjectId) || activeProject;

  return (
    <div className="space-y-6">
      {/* ── HEADER CARD & PROGRESS OVERVIEW ──────────────────────────────── */}
      <div className={`p-4 sm:p-7 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl relative overflow-hidden space-y-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <ListChecks className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold">
                MODULE B: Development Roadmap
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Personalized Phased Plan
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black ${theme.textPrimary} tracking-tight`}>
              Project Implementation Roadmap
            </h1>
            <p className={`text-xs sm:text-sm ${theme.textSecondary} max-w-2xl leading-relaxed`}>
              Sequential engineering milestones from architectural foundation and dataset curation to testing, containerization, and release.
            </p>
          </div>

          {/* Action buttons & Project Selector */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {allProjects.length > 1 && (
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700/60 text-xs">
                <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer max-w-[150px] truncate"
                >
                  {allProjects.map((proj) => (
                    <option key={proj.id} value={proj.id} className="bg-slate-900 text-white">
                      {proj.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>

            <button
              onClick={handleRegenerate}
              disabled={isRegenerating || isLoading}
              className={`px-3.5 py-2 rounded-xl border ${theme.borderSubtle} ${theme.cardInner} ${theme.textSecondary} hover:${theme.textPrimary} text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 active:scale-95`}
              title="Regenerate roadmap with Gemini API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-blue-400' : ''}`} />
              <span>Regenerate</span>
            </button>
          </div>
        </div>

        {/* ── PROGRESS BAR & METRICS ──────────────────────────────────────── */}
        {roadmap && (
          <div className={`p-5 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-black font-mono text-blue-400">
                  {roadmap.progress_percentage}%
                </div>
                <div>
                  <span className={`text-xs font-bold ${theme.textPrimary} block`}>
                    Overall Project Implementation Progress
                  </span>
                  <span className={`text-[11px] ${theme.textMuted}`}>
                    {roadmap.completed_tasks} of {roadmap.total_tasks} Actionable Tasks Completed
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-[11px] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-purple-400" />
                  {roadmap.overall_duration || '12 Weeks'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-[11px]">
                  {roadmap.methodology || 'Agile Sprints'}
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-800/80 overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-500 shadow-sm shadow-blue-500/50"
                style={{ width: `${Math.max(roadmap.progress_percentage, 2)}%` }}
              />
            </div>
          </div>
        )}

        {/* ── FILTER BUTTONS BAR ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-700/40">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setTaskFilter('ALL')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                taskFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : `${theme.cardInner} ${theme.borderSubtle} border ${theme.textSecondary} hover:${theme.textPrimary}`
              }`}
            >
              All Tasks ({roadmap?.total_tasks || 0})
            </button>
            <button
              onClick={() => setTaskFilter('PENDING')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                taskFilter === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : `${theme.cardInner} border border-amber-500/20 text-amber-400 hover:bg-amber-500/10`
              }`}
            >
              <Circle className="w-3 h-3" />
              In Progress ({roadmap ? roadmap.total_tasks - roadmap.completed_tasks : 0})
            </button>
            <button
              onClick={() => setTaskFilter('COMPLETED')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                taskFilter === 'COMPLETED'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : `${theme.cardInner} border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10`
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Completed ({roadmap?.completed_tasks || 0})
            </button>
          </div>

          <span className={`text-[11px] ${theme.textMuted} italic`}>
            Interactive tracking auto-saves directly to MongoDB
          </span>
        </div>
      </div>

      {/* ── PHASES LIST & TASK CHECKLIST ─────────────────────────────────── */}
      {isLoading ? (
        <div className={`p-12 text-center rounded-2xl ${theme.cardBg} border ${theme.cardBorder}`}>
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className={`text-sm ${theme.textSecondary}`}>Loading development roadmap from MongoDB...</p>
        </div>
      ) : roadmap?.phases ? (
        <div className="space-y-4">
          {roadmap.phases.map((phase, pIdx) => {
            const PhaseIcon = PHASE_ICONS[pIdx % PHASE_ICONS.length] || Wrench;
            const isExpanded = expandedPhases[phase.phase_number] !== false;
            const phaseTasks = phase.tasks || [];
            const filteredTasks = phaseTasks.filter((t) => {
              if (taskFilter === 'PENDING') return !t.completed;
              if (taskFilter === 'COMPLETED') return t.completed;
              return true;
            });
            const completedInPhase = phaseTasks.filter((t) => t.completed).length;
            const isPhaseFullyDone = phaseTasks.length > 0 && completedInPhase === phaseTasks.length;

            return (
              <div
                key={phase.phase_number}
                className={`rounded-2xl border ${theme.cardBorder} ${theme.cardBg} overflow-hidden shadow-lg transition duration-200`}
              >
                {/* Phase Header */}
                <div
                  onClick={() => togglePhaseExpand(phase.phase_number)}
                  className={`p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none transition ${
                    isPhaseFullyDone ? 'bg-emerald-500/5' : theme.cardInner
                  } hover:bg-slate-800/40`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                        isPhaseFullyDone
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                      }`}
                    >
                      {isPhaseFullyDone ? <CheckCircle2 className="w-5 h-5" /> : phase.phase_number}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-mono uppercase tracking-wider ${theme.textMuted}`}>
                          {phase.timeline || `Phase ${phase.phase_number}`}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isPhaseFullyDone
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          }`}
                        >
                          {completedInPhase}/{phaseTasks.length} Completed
                        </span>
                      </div>
                      <h3 className={`text-base sm:text-lg font-bold ${theme.textPrimary}`}>
                        {phase.phase_name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      className={`p-1.5 rounded-lg ${theme.textMuted} hover:${theme.textPrimary} transition`}
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Phase Body: Description, Recommended Tools, and Tasks */}
                {isExpanded && (
                  <div className="p-5 space-y-5 border-t border-slate-700/50">
                    <p className={`text-xs sm:text-sm ${theme.textSecondary} leading-relaxed`}>
                      {phase.description}
                    </p>

                    {/* Recommended Tools & Technologies */}
                    {phase.recommended_tools && phase.recommended_tools.length > 0 && (
                      <div className="space-y-1.5">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${theme.textMuted} flex items-center gap-1.5`}>
                          <Wrench className="w-3.5 h-3.5 text-blue-400" />
                          <span>Recommended Tools &amp; Technologies:</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {phase.recommended_tools.map((tool, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Task Checklist */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between pb-1">
                        <span className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>
                          Milestones &amp; Action Items ({filteredTasks.length})
                        </span>
                      </div>

                      {filteredTasks.length === 0 ? (
                        <p className={`text-xs ${theme.textMuted} italic py-2`}>
                          No tasks match the active filter ({taskFilter}).
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {filteredTasks.map((task) => {
                            const isDone = task.completed;
                            const catStyle = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.coding;

                            return (
                              <div
                                key={task.id}
                                onClick={() => handleToggleTask(task.id, isDone)}
                                className={`p-4 rounded-xl border transition cursor-pointer select-none flex items-start gap-3.5 ${
                                  isDone
                                    ? 'bg-emerald-500/5 border-emerald-500/25 opacity-80'
                                    : `${theme.cardInner} border-slate-700/60 hover:border-blue-500/40 hover:bg-slate-800/50`
                                }`}
                              >
                                {/* Checkbox Icon */}
                                <div className="pt-0.5 shrink-0">
                                  {isDone ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                  ) : (
                                    <Circle className={`w-5 h-5 ${theme.textMuted} hover:text-blue-400 transition`} />
                                  )}
                                </div>

                                {/* Task Details */}
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <h4
                                      className={`text-sm font-bold transition ${
                                        isDone
                                          ? 'line-through text-slate-400 font-normal'
                                          : theme.textPrimary
                                      }`}
                                    >
                                      {task.title}
                                    </h4>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${catStyle}`}>
                                        {task.category || 'coding'}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        {task.estimated_hours || '4-6 hrs'}
                                      </span>
                                    </div>
                                  </div>

                                  <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>
                                    {task.description}
                                  </p>

                                  {isDone && task.completed_at && (
                                    <span className="text-[10px] text-emerald-400/90 font-mono block pt-0.5">
                                      ✓ Completed on {new Date(task.completed_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* ── ADD CUSTOM TASK MODAL ────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`w-full max-w-lg rounded-2xl ${theme.cardBg} border ${theme.cardBorder} p-6 shadow-2xl space-y-5`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className={`text-base font-bold ${theme.textPrimary}`}>Add Custom Milestone Task</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className={`p-1.5 rounded-lg ${theme.textMuted} hover:${theme.textPrimary} transition`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomTask} className="space-y-4">
              <div className="space-y-1">
                <label className={`block text-xs font-bold ${theme.textPrimary}`}>Target Phase</label>
                <select
                  value={newTaskPhase}
                  onChange={(e) => setNewTaskPhase(Number(e.target.value))}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {(roadmap?.phases || []).map((p) => (
                    <option key={p.phase_number} value={p.phase_number}>
                      Phase {p.phase_number}: {p.phase_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className={`block text-xs font-bold ${theme.textPrimary}`}>Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement edge thermal fallback loop"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div className="space-y-1">
                <label className={`block text-xs font-bold ${theme.textPrimary}`}>Task Description</label>
                <textarea
                  rows={3}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Specific requirements, expected test output, or dependencies..."
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`block text-xs font-bold ${theme.textPrimary}`}>Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="architecture">Architecture</option>
                    <option value="dataset">Dataset</option>
                    <option value="coding">Coding</option>
                    <option value="testing">Testing</option>
                    <option value="deployment">Deployment</option>
                    <option value="documentation">Documentation</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`block text-xs font-bold ${theme.textPrimary}`}>Estimated Effort</label>
                  <input
                    type="text"
                    value={newTaskHours}
                    onChange={(e) => setNewTaskHours(e.target.value)}
                    placeholder="e.g. 4-6 hrs"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold ${theme.cardInner} border border-slate-700 text-slate-300 hover:text-white transition`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}