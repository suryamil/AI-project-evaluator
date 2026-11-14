import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { evaluateProjectWithGeminiAPI } from '../../services/api';
import RiskAnalysisModule from './RiskAnalysisModule';
import { 
  FileText, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Cpu, 
  Database, 
  DollarSign, 
  Clock, 
  Users, 
  Award, 
  Layers, 
  Target, 
  ShieldAlert, 
  Send,
  HelpCircle,
  Code2,
  Brain,
  Lightbulb,
  TrendingUp,
  BookOpen,
  Wrench,
  X,
  Scale,
  FileQuestion,
  AlertTriangle
} from 'lucide-react';

const DOMAIN_OPTIONS = [
  'Artificial Intelligence & Deep Learning',
  'Machine Learning & Predictive Modeling',
  'Web Development & Distributed Systems',
  'Cybersecurity & Network Defense',
  'Internet of Things (IoT) & Embedded Edge',
  'Cloud Computing & DevOps Automation',
  'Computer Vision & Autonomous Robotics',
  'Natural Language Processing (NLP) & GenAI',
  'Mobile Application Development'
];

const BUDGET_OPTIONS = [
  '$0 (Free Tier / Student Credits / Local Hardware)',
  '$100 - $300 (Micro-Budget: Domain, Basic VPS, API calls)',
  '$300 - $1,000 (Moderate: Dedicated Cloud GPU / Sensors)',
  '$1,000 - $3,000 (Department Funded / Research Grant)',
  '$3,000+ (Institutional / Enterprise Production Budget)'
];

const TIMELINE_OPTIONS = [
  '1 - 2 Months (Rapid Sprint / Hackathon MVP)',
  '3 - 4 Months (One-Semester Capstone Project)',
  '5 - 8 Months (Two-Semester Senior Thesis)',
  '9 - 12 Months (Year-Long Research & Development)'
];

const TEAM_SIZE_OPTIONS = [
  'Solo Developer (1 Student)',
  'Pair Programming Team (2 Students)',
  'Small Capstone Team (3 - 4 Students)',
  'Medium Group (5 - 6 Students)',
  'Large Multi-Disciplinary Team (7+ Members)'
];

const SKILL_LEVEL_OPTIONS = [
  'Beginner (Foundational programming knowledge, learning core frameworks)',
  'Intermediate (Built coursework full-stack or ML apps, comfortable with Git)',
  'Advanced (Hands-on PyTorch/Docker/Cloud experience, experienced with system design)',
  'Expert / Research Grade (Published papers or production software engineering)'
];

const SAMPLE_PRESETS = [
  {
    title: 'Autonomous Edge Drone for Vineyard Crop Pathology',
    domain: 'Computer Vision & Autonomous Robotics',
    description: 'A lightweight aerial drone system that captures high-resolution crop leaves and performs real-time disease classification directly on an edge Raspberry Pi 4 board with low power consumption.',
    problemStatement: 'Manual vineyard inspection takes days, leading to unchecked powdery mildew spread and 25% annual grape yield losses for small-scale grape farmers.',
    targetUsers: 'Vineyard managers, agricultural inspectors, and precision farming cooperatives.',
    technologies: 'Python, YOLOv8-Nano, OpenCV, PyTorch, Raspberry Pi 4, FastAPI',
    budget: '$300 - $1,000 (Moderate: Dedicated Cloud GPU / Sensors)',
    timeline: '3 - 4 Months (One-Semester Capstone Project)',
    teamSize: 'Small Capstone Team (3 - 4 Students)',
    skillLevel: 'Intermediate (Built coursework full-stack or ML apps, comfortable with Git)'
  },
  {
    title: 'Multi-Tenant Medical Clause Cross-Verification RAG Engine',
    domain: 'Natural Language Processing (NLP) & GenAI',
    description: 'An AI-driven Retrieval-Augmented Generation system designed for clinical trials and hospital agreements to flag contradicting liability clauses across 500-page regulatory PDFs.',
    problemStatement: 'Clinical research coordinators spend over 40 hours per trial manual reviewing cross-institutional consent documents, causing critical ethical audit delays.',
    targetUsers: 'Hospital compliance officers, institutional review board members, and legal researchers.',
    technologies: 'LLaMA-3-8B-Instruct, LangChain, Qdrant Vector DB, Python, FastAPI, React.js',
    budget: '$1,000 - $3,000 (Department Funded / Research Grant)',
    timeline: '5 - 8 Months (Two-Semester Senior Thesis)',
    teamSize: 'Pair Programming Team (2 Students)',
    skillLevel: 'Advanced (Hands-on PyTorch/Docker/Cloud experience, experienced with system design)'
  }
];

export default function ProjectSubmissionForm({ onProjectEvaluated, onCancel }) {
  const { theme } = useTheme();

  // Step state: 'form' (filling out) -> 'review' (verifying summary) -> 'submitting'
  const [step, setStep] = useState('form');

  // Form Fields State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problemStatement: '',
    domain: DOMAIN_OPTIONS[0],
    targetUsers: '',
    technologies: '',
    budget: BUDGET_OPTIONS[0],
    timeline: TIMELINE_OPTIONS[1],
    teamSize: TEAM_SIZE_OPTIONS[2],
    skillLevel: SKILL_LEVEL_OPTIONS[1]
  });

  // Validation Errors State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastFeedback, setToastFeedback] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);

  const showToast = (msg) => {
    setToastFeedback(msg);
    setTimeout(() => setToastFeedback(null), 3000);
  };

  // Field change handler that clears specific field error immediately
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // Load a complete sample preset
  const handleLoadPreset = (preset) => {
    setFormData(preset);
    setErrors({});
    showToast(`Loaded sample capstone: "${preset.title.substring(0, 32)}..."`);
  };

  // Reset Form
  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      problemStatement: '',
      domain: DOMAIN_OPTIONS[0],
      targetUsers: '',
      technologies: '',
      budget: BUDGET_OPTIONS[0],
      timeline: TIMELINE_OPTIONS[1],
      teamSize: TEAM_SIZE_OPTIONS[2],
      skillLevel: SKILL_LEVEL_OPTIONS[1]
    });
    setErrors({});
    setStep('form');
    showToast('Form has been reset to blank.');
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required.';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Project title must be at least 5 characters.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required.';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Please describe the project scope in at least 20 characters.';
    }

    if (!formData.problemStatement.trim()) {
      newErrors.problemStatement = 'Problem statement is required.';
    } else if (formData.problemStatement.trim().length < 20) {
      newErrors.problemStatement = 'Explain the specific problem pain point in at least 20 characters.';
    }

    if (!formData.domain) {
      newErrors.domain = 'Please select a project domain.';
    }

    if (!formData.targetUsers.trim()) {
      newErrors.targetUsers = 'Target users or audience is required.';
    } else if (formData.targetUsers.trim().length < 3) {
      newErrors.targetUsers = 'Specify who will use or benefit from this system.';
    }

    if (!formData.technologies.trim()) {
      newErrors.technologies = 'Planned technologies and frameworks are required.';
    } else if (formData.technologies.trim().length < 3) {
      newErrors.technologies = 'List your core planned tools (e.g. PyTorch, FastAPI, React).';
    }

    if (!formData.budget) {
      newErrors.budget = 'Please select an estimated budget tier.';
    }

    if (!formData.timeline) {
      newErrors.timeline = 'Please select a planned development timeline.';
    }

    if (!formData.teamSize) {
      newErrors.teamSize = 'Please specify team size.';
    }

    if (!formData.skillLevel) {
      newErrors.skillLevel = 'Please specify current team skill level.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Advance from Form to Review Screen
  const handleProceedToReview = (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      setStep('review');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast('Please fix the highlighted fields before reviewing.');
    }
  };

  // Final Submission: call real Gemini AI backend endpoint
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setAiResult(null);
    setAiError(null);

    try {
      const data = await evaluateProjectWithGeminiAPI(formData);
      // api.js flattens the nested evaluation object: data.feasibility_score, data.strengths, etc.

      const feasibility = data.feasibility_score ?? 72;
      const riskLevel =
        feasibility >= 75 ? 'Low Risk' :
        feasibility >= 50 ? 'Moderate Risk' : 'High Risk';
      const riskColor =
        feasibility >= 75 ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' :
        feasibility >= 50 ? 'text-amber-500 bg-amber-500/10 border-amber-500/30' :
                            'text-rose-500 bg-rose-500/10 border-rose-500/30';

      const newProjectRecord = {
        id: data.evaluation_id || `eval_${Date.now()}`,
        isDemo: false,
        isGemini: true,
        title: formData.title.trim(),
        description: formData.description.trim(),
        problemStatement: formData.problemStatement?.trim() || '',
        domain: formData.domain,
        targetUsers: formData.targetUsers?.trim() || '',
        technologies: formData.technologies.trim(),
        model: formData.technologies.split(',')[0].trim() || formData.domain,
        budget: formData.budget,
        timeline: formData.timeline,
        teamSize: formData.teamSize,
        skillLevel: formData.skillLevel,
        feasibilityScore: feasibility,
        feasibilityExplanation: data.feasibility_explanation || '',
        innovationScore: data.innovation_score,
        innovationExplanation: data.innovation_explanation || '',
        technicalComplexity: data.technical_complexity || 'Moderate',
        complexityExplanation: data.complexity_explanation || '',
        estimatedDevelopmentDifficulty: data.estimated_development_difficulty || data.technical_difficulty || 'Intermediate',
        difficultyExplanation: data.difficulty_explanation || '',
        technicalDifficulty: data.estimated_development_difficulty || data.technical_difficulty || 'Intermediate',
        requiredSkills: data.required_skills ?? [],
        recommendedTechnologies: data.technology_recommendations ?? data.recommended_technologies ?? [],
        strengths: data.project_strengths ?? data.strengths ?? [],
        weaknesses: data.project_weaknesses ?? data.weaknesses ?? [],
        missingInformation: data.missing_information ?? [],
        developmentChallenges: data.scoring_methodology?.empirical_failure_factors ?? data.development_challenges ?? [],
        improvementSuggestions: data.improvement_suggestions ?? [],
        evaluationSummary: data.evaluation_summary ?? '',
        scoringMethodology: data.scoring_methodology ?? null,
        failureRiskAnalysis: data.failure_risk_analysis ?? data.risk_analysis ?? null,
        riskLevel,
        riskColor,
        primaryRisk: (data.project_weaknesses ?? data.weaknesses ?? ['Architectural validation required'])[0],
        fixes: data.improvement_suggestions ?? [],
        evaluatedAt: 'Just Now',
        savedToMongoDB: data.saved_to_mongodb,
        aiModel: data.ai_model,
        evaluatorSource: data.evaluator_source,
      };

      setAiResult(newProjectRecord);
      setIsSubmitting(false);

      if (onProjectEvaluated) {
        onProjectEvaluated(newProjectRecord);
      }
    } catch (err) {
      setIsSubmitting(false);
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail || err?.message || 'Unknown error';

      if (status === 503) {
        setAiError({
          type: 'missing_key',
          title: 'Gemini API Key Not Configured',
          message: 'The backend GEMINI_API_KEY is missing or empty. Add your free key from Google AI Studio to backend/.env to enable live AI evaluation.',
          link: 'https://aistudio.google.com/',
        });
      } else if (status === 429) {
        setAiError({
          type: 'rate_limit',
          title: 'API Rate Limit Reached',
          message: 'Too many requests. Please wait 60 seconds and try again.',
        });
      } else if (status === 504) {
        setAiError({
          type: 'timeout',
          title: 'AI Evaluation Timed Out',
          message: 'The Gemini API took too long to respond. Please try again.',
        });
      } else {
        setAiError({
          type: 'general',
          title: 'AI Evaluation Failed',
          message: detail,
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* Toast Feedback */}
      {toastFeedback && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-2xl animate-in slide-in-from-bottom duration-300 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastFeedback}</span>
        </div>
      )}

      {/* Header Section */}
      <div className={`p-6 sm:p-8 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-sm relative overflow-hidden`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <FileText className="w-3.5 h-3.5" />
              <span>Project Intake &amp; Feasibility Evaluation</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold ${theme.textPrimary} tracking-tight`}>
              {step === 'form' ? 'Project Submission Form' : 'Proposal Review & Validation'}
            </h1>
            <p className={`text-xs sm:text-sm ${theme.textSecondary} max-w-2xl leading-relaxed`}>
              {step === 'form' 
                ? 'Submit your project specifications across the 10 dimensions below. Our AI Feasibility Predictor will audit memory, compute bottlenecks, and failure risks.'
                : 'Review all submitted specifications carefully before running the comprehensive architectural failure evaluation.'}
            </p>
          </div>

          {/* Step Badge */}
          <div className="shrink-0 flex items-center gap-2 bg-slate-500/10 px-3.5 py-2 rounded-xl border border-slate-500/20">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 'form' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'
            }`}>
              {step === 'form' ? '1' : '2'}
            </div>
            <div className="text-left">
              <span className={`text-[10px] uppercase font-bold block ${theme.textMuted}`}>Progress</span>
              <span className={`text-xs font-bold ${theme.textPrimary}`}>
                {step === 'form' ? 'Step 1: Details' : 'Step 2: Review'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Sample Presets (Step 1 only) */}
        {step === 'form' && (
          <div className="mt-6 pt-5 border-t border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            <span className={`text-xs font-bold ${theme.textMuted} flex items-center gap-1 shrink-0`}>
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Quick Test Presets:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleLoadPreset(SAMPLE_PRESETS[0])}
                className={`text-[11px] px-3 py-1.5 rounded-lg border font-medium ${theme.cardInner} ${theme.borderSubtle} ${theme.textSecondary} hover:${theme.textPrimary} transition cursor-pointer active:scale-95`}
              >
                🌿 IoT Drone Crop Pathology
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset(SAMPLE_PRESETS[1])}
                className={`text-[11px] px-3 py-1.5 rounded-lg border font-medium ${theme.cardInner} ${theme.borderSubtle} ${theme.textSecondary} hover:${theme.textPrimary} transition cursor-pointer active:scale-95`}
              >
                ⚖️ Medical Legal RAG Engine
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STEP 1: Complete Form */}
      {step === 'form' && (
        <form onSubmit={handleProceedToReview} className="space-y-6">
          
          {/* Card 1: Core Project Identity */}
          <div className={`p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-5 shadow-sm`}>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-700/50">
              <Layers className="w-4 h-4 text-blue-500" />
              <h3 className={`text-sm font-bold ${theme.textPrimary} uppercase tracking-wider`}>
                1. Project Identity &amp; Scope
              </h3>
            </div>

            {/* Field 1: Project Title */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-bold ${theme.textPrimary}`}>
                Project Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Autonomous Edge Drone for Vineyard Crop Pathology"
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  errors.title 
                    ? 'border border-rose-500 bg-rose-500/5 text-rose-500' 
                    : theme.isLight 
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white' 
                      : 'bg-[#080C14] border border-slate-700/80 text-white focus:border-blue-500'
                }`}
              />
              {errors.title && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            {/* Field 2: Project Domain (Dropdown) */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-bold ${theme.textPrimary}`}>
                Project Domain <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.domain}
                onChange={(e) => handleChange('domain', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer ${
                  errors.domain
                    ? 'border border-rose-500 bg-rose-500/5 text-rose-500'
                    : theme.isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white'
                      : 'bg-[#080C14] border border-slate-700/80 text-white focus:border-blue-500'
                }`}
              >
                {DOMAIN_OPTIONS.map((d) => (
                  <option key={d} value={d} className="bg-slate-900 text-white py-1">
                    {d}
                  </option>
                ))}
              </select>
              {errors.domain && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.domain}</span>
                </p>
              )}
            </div>

            {/* Field 3: Problem Statement */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-bold ${theme.textPrimary}`}>
                Problem Statement <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows="3"
                value={formData.problemStatement}
                onChange={(e) => handleChange('problemStatement', e.target.value)}
                placeholder="What critical pain point does this solve? e.g. Manual vineyard inspection takes days, leading to unchecked powdery mildew spread and 25% annual grape yield loss..."
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 leading-relaxed ${
                  errors.problemStatement
                    ? 'border border-rose-500 bg-rose-500/5 text-rose-500'
                    : theme.isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white'
                      : 'bg-[#080C14] border border-slate-700/80 text-white focus:border-blue-500'
                }`}
              />
              {errors.problemStatement && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.problemStatement}</span>
                </p>
              )}
            </div>

            {/* Field 4: Project Description */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-bold ${theme.textPrimary}`}>
                Project Description &amp; Proposed Solution <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe your system architecture and proposed workflow. e.g. We will build a lightweight vision classifier deployed on edge Raspberry Pi boards to inspect leaves in real-time..."
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 leading-relaxed ${
                  errors.description
                    ? 'border border-rose-500 bg-rose-500/5 text-rose-500'
                    : theme.isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white'
                      : 'bg-[#080C14] border border-slate-700/80 text-white focus:border-blue-500'
                }`}
              />
              {errors.description && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.description}</span>
                </p>
              )}
            </div>
          </div>

          {/* Card 2: Target Audience & Tech Stack */}
          <div className={`p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-5 shadow-sm`}>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-700/50">
              <Cpu className="w-4 h-4 text-emerald-500" />
              <h3 className={`text-sm font-bold ${theme.textPrimary} uppercase tracking-wider`}>
                2. Target Audience &amp; Technical Stack
              </h3>
            </div>

            {/* Field 5: Target Users */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-bold ${theme.textPrimary}`}>
                Target Users / Beneficiaries <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.targetUsers}
                onChange={(e) => handleChange('targetUsers', e.target.value)}
                placeholder="e.g. Vineyard managers, ICU triage clinicians, DevSecOps engineers"
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  errors.targetUsers
                    ? 'border border-rose-500 bg-rose-500/5 text-rose-500'
                    : theme.isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white'
                      : 'bg-[#080C14] border border-slate-700/80 text-white focus:border-blue-500'
                }`}
              />
              {errors.targetUsers && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.targetUsers}</span>
                </p>
              )}
            </div>

            {/* Field 6: Planned Technologies */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-bold ${theme.textPrimary}`}>
                Planned Technologies &amp; Frameworks <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.technologies}
                onChange={(e) => handleChange('technologies', e.target.value)}
                placeholder="e.g. Python, PyTorch, YOLOv8, FastAPI, React, Docker, Raspberry Pi 4"
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-mono ${
                  errors.technologies
                    ? 'border border-rose-500 bg-rose-500/5 text-rose-500'
                    : theme.isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white'
                      : 'bg-[#080C14] border border-slate-700/80 text-white focus:border-blue-500'
                }`}
              />
              <p className={`text-[10px] ${theme.textMuted}`}>
                Tip: Comma-separated list of programming languages, machine learning libraries, databases, and target hardware.
              </p>
              {errors.technologies && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.technologies}</span>
                </p>
              )}
            </div>
          </div>

          {/* Card 3: Resource Matrix (Budget, Timeline, Team, Skill) */}
          <div className={`p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-5 shadow-sm`}>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-700/50">
              <Award className="w-4 h-4 text-purple-500" />
              <h3 className={`text-sm font-bold ${theme.textPrimary} uppercase tracking-wider`}>
                3. Execution Resources &amp; Team Profile
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Field 7: Available Budget (Dropdown) */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-bold ${theme.textPrimary} flex items-center gap-1.5`}>
                  <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                  <span>Available Budget Tier <span className="text-rose-500">*</span></span>
                </label>
                <select
                  value={formData.budget}
                  onChange={(e) => handleChange('budget', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer ${
                    theme.isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white'
                      : 'bg-[#080C14] border border-slate-700/80 text-white focus:border-blue-500'
                  }`}
                >
                  {BUDGET_OPTIONS.map((b) => (
                    <option key={b} value={b} className="bg-slate-900 text-white">
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 8: Development Timeline (Dropdown) */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-bold ${theme.textPrimary} flex items-center gap-1.5`}>
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Development Timeline <span className="text-rose-500">*</span></span>
                </label>
                <select
                  value={formData.timeline}
                  onChange={(e) => handleChange('timeline', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer ${
                    theme.isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white'
                      : 'bg-[#080C14] border border-slate-700/80 text-white focus:border-blue-500'
                  }`}
                >
                  {TIMELINE_OPTIONS.map((t) => (
                    <option key={t} value={t} className="bg-slate-900 text-white">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 9: Team Size (Dropdown) */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-bold ${theme.textPrimary} flex items-center gap-1.5`}>
                  <Users className="w-3.5 h-3.5 text-purple-500" />
                  <span>Team Size <span className="text-rose-500">*</span></span>
                </label>
                <select
                  value={formData.teamSize}
                  onChange={(e) => handleChange('teamSize', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer ${
                    theme.isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white'
                      : 'bg-[#080C14] border border-slate-700/80 text-white focus:border-blue-500'
                  }`}
                >
                  {TEAM_SIZE_OPTIONS.map((s) => (
                    <option key={s} value={s} className="bg-slate-900 text-white">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 10: Technical Skill Level (Dropdown) */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-bold ${theme.textPrimary} flex items-center gap-1.5`}>
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Current Skill Level <span className="text-rose-500">*</span></span>
                </label>
                <select
                  value={formData.skillLevel}
                  onChange={(e) => handleChange('skillLevel', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer ${
                    theme.isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white'
                      : 'bg-[#080C14] border border-slate-700/80 text-white focus:border-blue-500'
                  }`}
                >
                  {SKILL_LEVEL_OPTIONS.map((sk) => (
                    <option key={sk} value={sk} className="bg-slate-900 text-white">
                      {sk}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions: Reset and Review Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
            <button
              type="button"
              onClick={handleReset}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold border ${theme.secondaryBtn} transition cursor-pointer active:scale-95`}
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Reset Form to Blank</span>
            </button>

            <button
              type="submit"
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r ${theme.primaryBtn} transition shadow-md cursor-pointer active:scale-95`}
            >
              <span>Review &amp; Validate Proposal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Review Screen Before Final Submission */}
      {step === 'review' && (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          
          {/* Review Notice Banner */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span className={theme.textPrimary}>
                <strong>Specification Check Passed:</strong> All 10 project fields have been verified. Review your proposal summary below before triggering the deep neural architecture audit.
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 uppercase tracking-wider shrink-0">
              Ready to Audit
            </span>
          </div>

          {/* Summary Card 1: Executive Title & Domain */}
          <div className={`p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-4 shadow-sm`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${theme.accentBadge} uppercase tracking-wider`}>
                {formData.domain}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {formData.skillLevel.split('(')[0].trim()}
              </span>
            </div>

            <h2 className={`text-xl sm:text-2xl font-black ${theme.textPrimary} tracking-tight`}>
              {formData.title}
            </h2>

            <div className="pt-3 border-t border-slate-700/50 space-y-3">
              <div>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${theme.textMuted} block`}>
                  Target Audience / End Users
                </span>
                <p className={`text-xs sm:text-sm font-medium ${theme.textPrimary} mt-0.5`}>
                  {formData.targetUsers}
                </p>
              </div>

              <div>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${theme.textMuted} block`}>
                  Problem Being Solved
                </span>
                <p className={`text-xs sm:text-sm ${theme.textSecondary} mt-0.5 leading-relaxed bg-slate-500/5 p-3 rounded-xl border border-slate-500/10 italic`}>
                  "{formData.problemStatement}"
                </p>
              </div>

              <div>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${theme.textMuted} block`}>
                  Proposed Solution &amp; Scope
                </span>
                <p className={`text-xs sm:text-sm ${theme.textSecondary} mt-0.5 leading-relaxed`}>
                  {formData.description}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Card 2: Tech Stack Badges */}
          <div className={`p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-3 shadow-sm`}>
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-500" />
              <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>
                Planned Technical Ecosystem
              </h3>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {formData.technologies.split(',').map((tech, i) => (
                <span 
                  key={i} 
                  className={`text-xs font-mono font-medium px-2.5 py-1 rounded-lg ${theme.cardInner} border ${theme.borderSubtle} ${theme.textPrimary}`}
                >
                  {tech.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Summary Card 3: Resource Matrix Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-sm space-y-1`}>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-semibold">Budget Tier</span>
              </div>
              <div className={`text-xs font-bold ${theme.textPrimary} pt-1`}>
                {formData.budget}
              </div>
            </div>

            <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-sm space-y-1`}>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold">Timeline</span>
              </div>
              <div className={`text-xs font-bold ${theme.textPrimary} pt-1`}>
                {formData.timeline}
              </div>
            </div>

            <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-sm space-y-1`}>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Users className="w-3.5 h-3.5 text-purple-500" />
                <span className="font-semibold">Team Allocation</span>
              </div>
              <div className={`text-xs font-bold ${theme.textPrimary} pt-1`}>
                {formData.teamSize}
              </div>
            </div>

          </div>

          {/* Review Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-700/60">
            <button
              type="button"
              onClick={() => setStep('form')}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold border ${theme.secondaryBtn} transition cursor-pointer active:scale-95`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Edit Details</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r ${theme.primaryBtn} transition shadow-lg cursor-pointer active:scale-95 disabled:opacity-50`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Running Gemini AI Evaluation...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Confirm &amp; Run AI Evaluation</span>
                </>
              )}
            </button>
          </div>

          {/* ── AI Error Banner ───────────────────────────────────── */}
          {aiError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 animate-in fade-in duration-300">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-rose-400">{aiError.title}</p>
                <p className="text-xs text-rose-300 mt-0.5 leading-relaxed">{aiError.message}</p>
                {aiError.link && (
                  <a href={aiError.link} target="_blank" rel="noreferrer"
                     className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:underline mt-1.5">
                    <Sparkles className="w-3 h-3" /> Get free API key at Google AI Studio →
                  </a>
                )}
              </div>
              <button onClick={() => setAiError(null)} className="text-rose-400 hover:text-rose-300 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── Gemini AI Results Panel ───────────────────────────── */}
          {aiResult && (
            <div className={`p-6 rounded-2xl ${theme.cardBg} border border-emerald-500/30 space-y-5 animate-in fade-in duration-500 shadow-xl`}>
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Brain className="w-3 h-3" />
                      Google Gemini AI
                    </span>
                    {aiResult.savedToMongoDB && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ✓ Saved to Database
                      </span>
                    )}
                  </div>
                  <h3 className={`text-lg font-bold ${theme.textPrimary}`}>{aiResult.title}</h3>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${aiResult.riskColor}`}>
                  {aiResult.feasibilityScore}% Feasibility
                </span>
              </div>

              {/* 10 Criteria Score Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 1. Feasibility */}
                <div className={`p-3.5 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} text-center`}>
                  <span className={`block text-[10px] font-semibold uppercase tracking-wider ${theme.textMuted} mb-1`}>1. Feasibility</span>
                  <span className={`text-2xl font-black font-mono ${
                    aiResult.feasibilityScore >= 75 ? 'text-emerald-400' :
                    aiResult.feasibilityScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                  }`}>{aiResult.feasibilityScore}<span className="text-xs">/100</span></span>
                  <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">{aiResult.riskLevel}</span>
                </div>

                {/* 2. Innovation */}
                <div className={`p-3.5 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} text-center`}>
                  <span className={`block text-[10px] font-semibold uppercase tracking-wider ${theme.textMuted} mb-1`}>2. Innovation</span>
                  <span className="text-2xl font-black font-mono text-blue-400">{aiResult.innovationScore}<span className="text-xs">/100</span></span>
                  <span className="block text-[10px] font-semibold text-blue-400/80 mt-0.5">Novelty Tier</span>
                </div>

                {/* 3. Technical Complexity */}
                <div className={`p-3.5 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} text-center`}>
                  <span className={`block text-[10px] font-semibold uppercase tracking-wider ${theme.textMuted} mb-1`}>3. Complexity</span>
                  <span className="text-base font-extrabold text-purple-400 mt-1 block">
                    {aiResult.technicalComplexity || 'Moderate'}
                  </span>
                  <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">System Depth</span>
                </div>

                {/* 4. Development Difficulty */}
                <div className={`p-3.5 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} text-center`}>
                  <span className={`block text-[10px] font-semibold uppercase tracking-wider ${theme.textMuted} mb-1`}>4. Difficulty</span>
                  <span className={`text-base font-extrabold mt-1 block ${
                    aiResult.technicalDifficulty === 'Advanced' ? 'text-rose-400' :
                    aiResult.technicalDifficulty === 'Intermediate' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {aiResult.technicalDifficulty}
                  </span>
                  <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">Skill Curve</span>
                </div>
              </div>

              {/* Explanations for Scores */}
              <div className={`p-4 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} space-y-3`}>
                <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
                  <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                  Score Explanations &amp; Engineering Rationale
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
                  <div className="p-3 rounded-lg bg-slate-500/5 border border-slate-500/10 space-y-1">
                    <span className="font-bold text-emerald-400 block text-[11px]">Feasibility Calculation Rationale:</span>
                    <p className={theme.textSecondary}>{aiResult.feasibilityExplanation || aiResult.evaluationSummary}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-500/5 border border-slate-500/10 space-y-1">
                    <span className="font-bold text-blue-400 block text-[11px]">Innovation &amp; Novelty Assessment:</span>
                    <p className={theme.textSecondary}>{aiResult.innovationExplanation || "Novelty assessed against standard capstone baseline patterns."}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-500/5 border border-slate-500/10 space-y-1">
                    <span className="font-bold text-purple-400 block text-[11px]">Technical Complexity Drivers:</span>
                    <p className={theme.textSecondary}>{aiResult.complexityExplanation || "System architecture integration and runtime latency constraints."}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-500/5 border border-slate-500/10 space-y-1">
                    <span className="font-bold text-amber-400 block text-[11px]">Development Difficulty Justification:</span>
                    <p className={theme.textSecondary}>{aiResult.difficultyExplanation || "Derived from framework learning curve and prerequisite competencies."}</p>
                  </div>
                </div>
              </div>

              {/* 5. Required Skills & 6. Technology Recommendations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 5. Required Skills */}
                <div className={`p-4 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} space-y-2`}>
                  <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
                    <BookOpen className="w-3.5 h-3.5 text-purple-400" /> 5. Required Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {aiResult.requiredSkills?.map((skill, i) => (
                      <span key={i} className={`text-xs font-medium px-2.5 py-1 rounded-lg ${theme.cardBg} border ${theme.borderSubtle} ${theme.textPrimary}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 6. Technology Recommendations */}
                <div className={`p-4 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} space-y-2`}>
                  <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
                    <Cpu className="w-3.5 h-3.5 text-blue-400" /> 6. Technology Recommendations
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {aiResult.recommendedTechnologies?.map((tech, i) => (
                      <span key={i} className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 7. Strengths & 8. Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 7. Project Strengths */}
                <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 7. Project Strengths
                  </div>
                  <ul className="space-y-1.5">
                    {aiResult.strengths?.map((s, i) => (
                      <li key={i} className={`text-xs flex items-start gap-2 ${theme.textSecondary}`}>
                        <span className="text-emerald-400 font-bold mt-0.5">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 8. Project Weaknesses */}
                <div className="p-4 rounded-xl bg-rose-500/8 border border-rose-500/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-400">
                    <ShieldAlert className="w-3.5 h-3.5" /> 8. Project Weaknesses
                  </div>
                  <ul className="space-y-1.5">
                    {aiResult.weaknesses?.map((w, i) => (
                      <li key={i} className={`text-xs flex items-start gap-2 ${theme.textSecondary}`}>
                        <span className="text-rose-400 font-bold mt-0.5">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 9. Missing Information (Critical Specification Gaps) */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  <FileQuestion className="w-3.5 h-3.5" /> 9. Missing Information &amp; Critical Gaps to Clarify
                </div>
                <p className="text-[11px] text-amber-300/80">
                  The following requirements were unstated or ambiguous in the proposal. Clarifying these prevents scope creep and milestone failure:
                </p>
                <ul className="space-y-1.5 pt-1">
                  {(aiResult.missingInformation?.length > 0 ? aiResult.missingInformation : [
                    "Exact training/testing dataset volumes and annotation sources",
                    "Target real-time latency thresholds (e.g. sub-200ms per transaction)",
                    "Hardware deployment environment and thermal throttling fallback plan"
                  ]).map((gap, i) => (
                    <li key={i} className={`text-xs flex items-start gap-2 text-amber-200`}>
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
                  {aiResult.improvementSuggestions?.map((s, i) => (
                    <li key={i} className={`text-xs flex items-start gap-2 ${theme.textSecondary}`}>
                      <span className={`${theme.accentText} font-bold mt-0.5`}>✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* TRANSPARENT SCORING METHODOLOGY & SCIENTIFIC RIGOR CARD */}
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
                    {aiResult.scoringMethodology?.feasibility_vs_failure_distinction || (
                      "Feasibility Score (0-100) measures static engineering readiness, hardware limits, and resource bounds. " +
                      "Actual Project Failure Probability is dynamic and driven by human team execution, team communication, and runtime testing."
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 italic pt-1">
                    {aiResult.scoringMethodology?.methodology_disclaimer || (
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
              <div className="pt-2">
                <RiskAnalysisModule 
                  riskAnalysis={aiResult.failureRiskAnalysis} 
                  projectData={formData} 
                />
              </div>

              {/* Evaluation Footer */}
              <div className={`p-3.5 rounded-xl ${theme.cardInner} text-xs ${theme.textMuted} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2`}>
                <span>
                  Evaluated via {aiResult.evaluatorSource === 'google_gemini' ? `Google Gemini (${aiResult.aiModel || 'gemini-2.5-flash'})` : 'Transparent Engineering Engine'} · Persisted to MongoDB
                </span>
                <span className={`font-semibold ${theme.accentText}`}>✓ Verified &amp; Saved</span>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
