import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  ShieldAlert,
  Cpu,
  BookOpen,
  DollarSign,
  Clock,
  Database,
  Layers,
  Users,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ListOrdered,
  Sparkles,
  Info
} from 'lucide-react';
import { analyzeProjectRisksAPI } from '../../services/api';

// Icon mapping for each of the 8 standardized failure risk categories
const CATEGORY_META = {
  'Technical limitations': {
    icon: Cpu,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    shortDesc: 'Compute, VRAM, latency & hardware bounds'
  },
  'Lack of programming knowledge': {
    icon: BookOpen,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    shortDesc: 'Team familiarity with frameworks & languages'
  },
  'Insufficient budget': {
    icon: DollarSign,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    shortDesc: 'Cloud compute, GPU hosting & API expenditure'
  },
  'Unrealistic deadlines': {
    icon: Clock,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    shortDesc: 'Delivery scope vs. allotted timeline sprint'
  },
  'Lack of datasets': {
    icon: Database,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    shortDesc: 'Data scarcity, annotation, imbalance & licensing'
  },
  'Security vulnerabilities': {
    icon: ShieldAlert,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
    shortDesc: 'API keys, authentication, injection & data leaks'
  },
  'Integration problems': {
    icon: Layers,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
    shortDesc: 'Fullstack APIs, schema mismatches & pipeline glue'
  },
  'Team coordination issues': {
    icon: Users,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
    shortDesc: 'Git conflicts, role ambiguity & sprint velocity'
  }
};

const DEFAULT_CATEGORIES = [
  'Technical limitations',
  'Lack of programming knowledge',
  'Insufficient budget',
  'Unrealistic deadlines',
  'Lack of datasets',
  'Security vulnerabilities',
  'Integration problems',
  'Team coordination issues'
];

export default function RiskAnalysisModule({ 
  riskAnalysis, 
  projectData, 
  onAnalysisUpdated 
}) {
  const { theme } = useTheme();
  const [filterLevel, setFilterLevel] = useState('ALL'); // 'ALL' | 'High' | 'Medium' | 'Low'
  const [expandedCards, setExpandedCards] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null);

  // Normalize data from either riskAnalysis or nested structures
  const currentAnalysis = riskAnalysis || {
    overall_risk_level: 'Medium',
    risk_summary: 'Comprehensive risk assessment across 8 core architectural failure dimensions.',
    risk_mitigation_plan: [
      'Phase 1: Build a minimal vertical prototype to validate core ML and API integration.',
      'Phase 2: Quantize and benchmark models locally before cloud or edge deployment.',
      'Phase 3: Implement CI/CD automated linting and unit tests to prevent team merge conflicts.'
    ],
    risks: DEFAULT_CATEGORIES.map(category => ({
      category,
      risk_level: 'Low',
      reason: 'Standard baseline engineering requirements evaluated for this domain.',
      possible_impact: 'Project delays or minor technical friction during implementation.',
      recommended_preventive_action: 'Follow standardized modular architecture and establish milestone reviews.'
    }))
  };

  const risks = currentAnalysis.risks || [];
  const overallLevel = currentAnalysis.overall_risk_level || 'Medium';

  // Counts
  const highCount = risks.filter(r => r.risk_level === 'High').length;
  const mediumCount = risks.filter(r => r.risk_level === 'Medium').length;
  const lowCount = risks.filter(r => r.risk_level === 'Low').length;

  // Filtered risks
  const filteredRisks = risks.filter(r => {
    if (filterLevel === 'ALL') return true;
    return r.risk_level === filterLevel;
  });

  const toggleExpand = (category) => {
    setExpandedCards(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleRefreshAnalysis = async () => {
    if (!projectData) return;
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      const updated = await analyzeProjectRisksAPI(projectData);
      if (onAnalysisUpdated) {
        onAnalysisUpdated(updated);
      }
    } catch (err) {
      console.error('Failed to re-run risk analysis', err);
      setRefreshError('Failed to refresh risk analysis. Please check your connection.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getRiskBadgeStyles = (level) => {
    switch (level) {
      case 'High':
        return {
          badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          cardBorder: 'border-rose-500/30',
          bgAccent: 'bg-rose-500/5',
          dot: 'bg-rose-500'
        };
      case 'Medium':
        return {
          badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          cardBorder: 'border-amber-500/30',
          bgAccent: 'bg-amber-500/5',
          dot: 'bg-amber-500'
        };
      case 'Low':
      default:
        return {
          badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          cardBorder: 'border-emerald-500/30',
          bgAccent: 'bg-emerald-500/5',
          dot: 'bg-emerald-500'
        };
    }
  };

  const overallBadge = getRiskBadgeStyles(overallLevel);

  return (
    <div className={`rounded-2xl border ${theme.cardBorder} ${theme.cardBg} p-4 sm:p-7 space-y-6 shadow-xl`}>
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-700/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
              Project Failure Risk Analysis
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
              8 Standardized Dimensions
            </span>
          </div>
          <h2 className={`text-xl sm:text-2xl font-black ${theme.textPrimary} tracking-tight`}>
            Pre-Emptive Failure Vector Audit
          </h2>
          <p className={`text-xs ${theme.textSecondary} max-w-2xl leading-relaxed`}>
            Rigorous breakdown of 8 core technical and organizational failure traps before coding begins.
          </p>
        </div>

        {/* Overall Risk Level & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 ${overallBadge.badge} ${overallBadge.bgAccent}`}>
            <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${overallBadge.dot}`} />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider block opacity-80">
                Overall Risk Level
              </span>
              <span className="text-sm font-black tracking-wide">
                {overallLevel} Failure Risk
              </span>
            </div>
          </div>

          {projectData && (
            <button
              onClick={handleRefreshAnalysis}
              disabled={isRefreshing}
              title="Re-run 8-category risk analysis"
              className={`p-2.5 rounded-xl border ${theme.borderSubtle} ${theme.cardInner} ${theme.textSecondary} hover:${theme.textPrimary} transition disabled:opacity-50 cursor-pointer`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {refreshError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{refreshError}</span>
        </div>
      )}

      {/* ── RISK SUMMARY BANNER ────────────────────────────────────────────── */}
      <div className={`p-4 sm:p-5 rounded-xl border ${overallBadge.cardBorder} ${overallBadge.bgAccent} space-y-2`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${overallBadge.badge.split(' ')[1]}`} />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary}`}>
              Executive Failure Risk Summary
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="text-rose-400 font-bold">{highCount} High</span>
            <span className="text-slate-500">·</span>
            <span className="text-amber-400 font-bold">{mediumCount} Medium</span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400 font-bold">{lowCount} Low</span>
          </div>
        </div>
        <p className={`text-xs sm:text-sm ${theme.textSecondary} leading-relaxed`}>
          {currentAnalysis.risk_summary}
        </p>
      </div>

      {/* ── FILTER BUTTONS ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterLevel('ALL')}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              filterLevel === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : `${theme.cardInner} ${theme.borderSubtle} border ${theme.textSecondary} hover:${theme.textPrimary}`
            }`}
          >
            All Categories ({risks.length})
          </button>
          <button
            onClick={() => setFilterLevel('High')}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterLevel === 'High'
                ? 'bg-rose-600 text-white shadow-sm'
                : `${theme.cardInner} border border-rose-500/20 text-rose-400 hover:bg-rose-500/10`
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            High Risk ({highCount})
          </button>
          <button
            onClick={() => setFilterLevel('Medium')}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterLevel === 'Medium'
                ? 'bg-amber-600 text-white shadow-sm'
                : `${theme.cardInner} border border-amber-500/20 text-amber-400 hover:bg-amber-500/10`
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Medium Risk ({mediumCount})
          </button>
          <button
            onClick={() => setFilterLevel('Low')}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterLevel === 'Low'
                ? 'bg-emerald-600 text-white shadow-sm'
                : `${theme.cardInner} border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10`
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Low Risk ({lowCount})
          </button>
        </div>

        <span className={`text-[11px] ${theme.textMuted} italic`}>
          Showing {filteredRisks.length} of {risks.length} categories
        </span>
      </div>

      {/* ── 8 RISK CATEGORY CARDS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRisks.map((riskItem, idx) => {
          const meta = CATEGORY_META[riskItem.category] || {
            icon: ShieldAlert,
            color: 'text-slate-400',
            bgColor: 'bg-slate-500/10',
            borderColor: 'border-slate-500/20',
            shortDesc: 'Risk category'
          };
          const IconComponent = meta.icon;
          const styles = getRiskBadgeStyles(riskItem.risk_level);
          const isExpanded = expandedCards[riskItem.category] !== false; // default open

          return (
            <div
              key={idx}
              className={`rounded-xl border ${styles.cardBorder} ${theme.cardInner} p-4 sm:p-5 flex flex-col justify-between transition hover:shadow-md space-y-4`}
            >
              {/* Card Top: Icon, Category Name, Risk Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${meta.bgColor} ${meta.borderColor} border ${meta.color} shrink-0 mt-0.5`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono uppercase tracking-wider ${theme.textMuted}`}>
                        Risk Dimension {idx + 1}
                      </span>
                    </div>
                    <h4 className={`text-sm sm:text-base font-bold ${theme.textPrimary}`}>
                      {riskItem.category}
                    </h4>
                    <span className={`text-[11px] ${theme.textMuted} block`}>
                      {meta.shortDesc}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${styles.badge}`}>
                    {riskItem.risk_level}
                  </span>
                  <button
                    onClick={() => toggleExpand(riskItem.category)}
                    className={`p-1 rounded-md ${theme.textMuted} hover:${theme.textPrimary} transition cursor-pointer`}
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Card Body: Reason, Possible Impact, Recommended Preventive Action */}
              {isExpanded && (
                <div className="space-y-3 pt-2 border-t border-slate-700/40 text-xs">
                  {/* Reason */}
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                      <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>Reason</span>
                    </span>
                    <p className={`pl-5 text-xs ${theme.textSecondary} leading-relaxed`}>
                      {riskItem.reason}
                    </p>
                  </div>

                  {/* Possible Impact */}
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 font-bold text-rose-400 text-[11px] uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Possible Impact</span>
                    </span>
                    <p className={`pl-5 text-xs text-rose-300/90 leading-relaxed`}>
                      {riskItem.possible_impact}
                    </p>
                  </div>

                  {/* Recommended Preventive Action */}
                  <div className={`p-3 rounded-lg ${styles.bgAccent} border ${styles.cardBorder} space-y-1`}>
                    <span className="flex items-center gap-1.5 font-bold text-emerald-400 text-[11px] uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Recommended Preventive Action</span>
                    </span>
                    <p className={`text-xs ${theme.textPrimary} leading-relaxed font-medium`}>
                      {riskItem.recommended_preventive_action}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── RISK MITIGATION PLAN ──────────────────────────────────────────── */}
      {currentAnalysis.risk_mitigation_plan && currentAnalysis.risk_mitigation_plan.length > 0 && (
        <div className={`rounded-xl border border-blue-500/30 ${theme.cardInner} p-5 space-y-3`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-blue-400" />
              <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary}`}>
                Comprehensive Risk Mitigation Plan
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {currentAnalysis.risk_mitigation_plan.length} Preventive Steps
            </span>
          </div>

          <p className={`text-xs ${theme.textSecondary}`}>
            Execute this prioritized roadmap to systematically eliminate project bottlenecks and safeguard delivery:
          </p>

          <ol className="space-y-2.5 pt-1">
            {currentAnalysis.risk_mitigation_plan.map((step, idx) => (
              <li
                key={idx}
                className={`p-3 rounded-lg ${theme.cardBg} border ${theme.borderSubtle} flex items-start gap-3 transition hover:border-blue-500/40`}
              >
                <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                  {idx + 1}
                </div>
                <div className="space-y-0.5">
                  <p className={`text-xs font-medium ${theme.textPrimary} leading-relaxed`}>
                    {step}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}