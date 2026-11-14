import {
  X, ShieldAlert, CheckCircle2, Cpu, Database, HardDrive,
  Copy, Sparkles, Brain, Lightbulb, TrendingUp, BookOpen, Wrench,
  Scale, FileQuestion, AlertTriangle
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useState } from 'react';
import RiskAnalysisModule from './RiskAnalysisModule';

export default function EvaluationDetailModal({ project, isOpen, onClose }) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !project) return null;

  const isGemini = !!project.isGemini || !!project.evaluatorSource?.includes('gemini');

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(project, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-3xl ${theme.cardBg} border ${theme.cardBorder} rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b ${theme.borderSubtle} flex items-center justify-between ${theme.cardInner}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${theme.swatch} flex items-center justify-center text-white shadow-sm`}>
              {isGemini ? <Brain className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded ${theme.cardBg} border ${theme.borderSubtle} ${theme.textSecondary}`}>
                  {project.domain}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${project.riskColor}`}>
                  {project.riskLevel}
                </span>
                {isGemini ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Google Gemini AI
                  </span>
                ) : project.isDemo ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Demo Simulation
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    My Evaluation
                  </span>
                )}
              </div>
              <h3 className={`text-base font-bold ${theme.textPrimary} mt-1`}>
                {project.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${theme.textMuted} hover:${theme.textPrimary} transition cursor-pointer`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto">

          {/* 10 Criteria Score Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-3.5 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} text-center`}>
              <span className={`block text-[10px] font-semibold uppercase tracking-wider ${theme.textMuted} mb-1`}>1. Feasibility</span>
              <span className={`text-2xl font-black font-mono ${
                project.feasibilityScore >= 75 ? 'text-emerald-400' :
                project.feasibilityScore >= 50 ? 'text-amber-400' : 'text-rose-400'
              }`}>{project.feasibilityScore}<span className="text-xs">/100</span></span>
              <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">{project.riskLevel}</span>
            </div>

            <div className={`p-3.5 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} text-center`}>
              <span className={`block text-[10px] font-semibold uppercase tracking-wider ${theme.textMuted} mb-1`}>2. Innovation</span>
              <span className="text-2xl font-black font-mono text-blue-400">
                {project.innovationScore !== undefined ? project.innovationScore : 'N/A'}<span className="text-xs">/100</span>
              </span>
              <span className="block text-[10px] font-semibold text-blue-400/80 mt-0.5">Novelty Tier</span>
            </div>

            <div className={`p-3.5 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} text-center`}>
              <span className={`block text-[10px] font-semibold uppercase tracking-wider ${theme.textMuted} mb-1`}>3. Complexity</span>
              <span className="text-base font-extrabold text-purple-400 mt-1 block">
                {project.technicalComplexity || 'Moderate'}
              </span>
              <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">System Depth</span>
            </div>

            <div className={`p-3.5 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} text-center`}>
              <span className={`block text-[10px] font-semibold uppercase tracking-wider ${theme.textMuted} mb-1`}>4. Difficulty</span>
              <span className={`text-base font-extrabold mt-1 block ${
                project.technicalDifficulty === 'Advanced' ? 'text-rose-400' :
                project.technicalDifficulty === 'Intermediate' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {project.technicalDifficulty || 'Intermediate'}
              </span>
              <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">Skill Curve</span>
            </div>
          </div>

          {/* Explanations for Scores */}
          {(project.feasibilityExplanation || project.innovationExplanation || project.complexityExplanation || project.difficultyExplanation) && (
            <div className={`p-4 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} space-y-3`}>
              <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
                <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                Score Explanations &amp; Engineering Rationale
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
                {project.feasibilityExplanation && (
                  <div className="p-3 rounded-lg bg-slate-500/5 border border-slate-500/10 space-y-1">
                    <span className="font-bold text-emerald-400 block text-[11px]">Feasibility Calculation Rationale:</span>
                    <p className={theme.textSecondary}>{project.feasibilityExplanation}</p>
                  </div>
                )}
                {project.innovationExplanation && (
                  <div className="p-3 rounded-lg bg-slate-500/5 border border-slate-500/10 space-y-1">
                    <span className="font-bold text-blue-400 block text-[11px]">Innovation &amp; Novelty Assessment:</span>
                    <p className={theme.textSecondary}>{project.innovationExplanation}</p>
                  </div>
                )}
                {project.complexityExplanation && (
                  <div className="p-3 rounded-lg bg-slate-500/5 border border-slate-500/10 space-y-1">
                    <span className="font-bold text-purple-400 block text-[11px]">Technical Complexity Drivers:</span>
                    <p className={theme.textSecondary}>{project.complexityExplanation}</p>
                  </div>
                )}
                {project.difficultyExplanation && (
                  <div className="p-3 rounded-lg bg-slate-500/5 border border-slate-500/10 space-y-1">
                    <span className="font-bold text-amber-400 block text-[11px]">Development Difficulty Justification:</span>
                    <p className={theme.textSecondary}>{project.difficultyExplanation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Summary */}
          {project.evaluationSummary && (
            <div className={`p-4 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} space-y-1.5`}>
              <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
                <Lightbulb className="w-3.5 h-3.5 text-yellow-400" /> Executive Evaluation Summary
              </div>
              <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>{project.evaluationSummary}</p>
            </div>
          )}

          {/* Problem Statement */}
          {project.problemStatement && (
            <div className={`p-4 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} space-y-1.5`}>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${theme.textMuted} block`}>
                Problem Statement &amp; Target Beneficiaries
              </span>
              <p className={`text-xs ${theme.textSecondary} leading-relaxed italic`}>
                "{project.problemStatement}"
              </p>
              {project.targetUsers && (
                <div className={`text-[11px] ${theme.textMuted} pt-1`}>
                  <strong>Target Users:</strong> {project.targetUsers}
                </div>
              )}
            </div>
          )}

          {/* 5. Required Skills & 6. Technology Recommendations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} space-y-2`}>
              <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
                <BookOpen className="w-3.5 h-3.5 text-purple-400" /> 5. Required Skills
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(project.requiredSkills || []).map((skill, i) => (
                  <span key={i} className={`text-xs font-medium px-2.5 py-1 rounded-lg ${theme.cardBg} border ${theme.borderSubtle} ${theme.textPrimary}`}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} space-y-2`}>
              <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
                <Cpu className="w-3.5 h-3.5 text-blue-400" /> 6. Technology Recommendations
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(project.recommendedTechnologies || project.technologyRecommendations || []).map((tech, i) => (
                  <span key={i} className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 7. Strengths & 8. Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> 7. Project Strengths
              </div>
              <ul className="space-y-1.5">
                {(project.strengths || project.projectStrengths || []).map((s, i) => (
                  <li key={i} className={`text-xs flex items-start gap-2 ${theme.textSecondary}`}>
                    <span className="text-emerald-400 font-bold mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/8 border border-rose-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-400">
                <ShieldAlert className="w-3.5 h-3.5" /> 8. Project Weaknesses
              </div>
              <ul className="space-y-1.5">
                {(project.weaknesses || project.projectWeaknesses || []).map((w, i) => (
                  <li key={i} className={`text-xs flex items-start gap-2 ${theme.textSecondary}`}>
                    <span className="text-rose-400 font-bold mt-0.5">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 9. Missing Information */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
              <FileQuestion className="w-3.5 h-3.5" /> 9. Missing Information &amp; Critical Gaps to Clarify
            </div>
            <p className="text-[11px] text-amber-300/80">
              Key assumptions that should be concretely specified before development:
            </p>
            <ul className="space-y-1.5 pt-1">
              {(project.missingInformation?.length > 0 ? project.missingInformation : [
                "Dataset volume and collection procedure",
                "Latency throughput threshold for target workload",
                "Hardware fallback behavior"
              ]).map((gap, i) => (
                <li key={i} className="text-xs flex items-start gap-2 text-amber-200">
                  <span className="text-amber-400 font-bold mt-0.5">?</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 10. Improvement Suggestions */}
          <div className={`p-4 rounded-xl ${theme.accentBg} border ${theme.accentBorder} space-y-2`}>
            <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${theme.accentText}`}>
              <TrendingUp className="w-3.5 h-3.5" /> 10. Prioritized Improvement Suggestions
            </div>
            <ul className="space-y-1.5">
              {(project.improvementSuggestions || project.fixes || []).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className={`${theme.accentText} font-bold mt-0.5`}>✓</span>
                  <span className={`text-xs ${theme.textSecondary}`}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Transparent Scoring Methodology Card */}
          <div className={`p-5 rounded-xl ${theme.cardInner} border border-blue-500/30 space-y-3`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-400" />
                <span className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary}`}>
                  Transparent Scoring Methodology &amp; Scientific Distinction
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Empirical Analysis
              </span>
            </div>

            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/15 space-y-1.5 text-xs">
              <div className="font-bold text-blue-400 flex items-center gap-1.5 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Feasibility Score vs. Actual Failure Probability:</span>
              </div>
              <p className={`${theme.textSecondary} leading-relaxed`}>
                {project.scoringMethodology?.feasibility_vs_failure_distinction || (
                  "Feasibility Score (0-100) measures static engineering readiness, hardware limits, and resource bounds. " +
                  "Actual Project Failure Probability is dynamic and driven by human team execution, team communication, and runtime testing."
                )}
              </p>
              <p className="text-[11px] text-slate-400 italic pt-1">
                {project.scoringMethodology?.methodology_disclaimer || (
                  "Note: This evaluation provides qualitative architectural heuristics. It does NOT treat LLM outputs as scientifically validated deterministic probabilities."
                )}
              </p>
            </div>

            {/* Weights Breakdown */}
            <div className="pt-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted} block mb-1.5`}>
                Heuristic Dimension Weighting Breakdown:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-500/5 border border-slate-500/10">
                  <span className="text-slate-400 text-[10px] block">Hardware Bounds</span>
                  <span className="font-bold text-emerald-400">35% Weight</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-500/5 border border-slate-500/10">
                  <span className="text-slate-400 text-[10px] block">Stack &amp; Skills</span>
                  <span className="font-bold text-blue-400">25% Weight</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-500/5 border border-slate-500/10">
                  <span className="text-slate-400 text-[10px] block">Scope &amp; Timeline</span>
                  <span className="font-bold text-purple-400">25% Weight</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-500/5 border border-slate-500/10">
                  <span className="text-slate-400 text-[10px] block">Data &amp; Testing</span>
                  <span className="font-bold text-amber-400">15% Weight</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 8-Category Project Failure Risk Analysis Module ────────────── */}
          <RiskAnalysisModule 
            riskAnalysis={project.failureRiskAnalysis || project.risk_analysis || project.riskAnalysis} 
            projectData={project} 
          />

        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t ${theme.borderSubtle} ${theme.cardInner} flex items-center justify-between`}>
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${theme.secondaryBtn} transition cursor-pointer`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied JSON!' : 'Copy Report JSON'}</span>
          </button>

          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r ${theme.primaryBtn} transition cursor-pointer`}
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
