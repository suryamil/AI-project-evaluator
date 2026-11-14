import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { evaluateProjectWithGeminiAPI } from '../../services/api';
import { 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  ShieldAlert, 
  Cpu, 
  Layers,
  ArrowRight,
  AlertCircle,
  Brain,
  TrendingUp,
  BookOpen
} from 'lucide-react';

export default function NewEvaluationForm({ onProjectEvaluated }) {
  const { theme } = useTheme();

  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('Computer Vision');
  const [model, setModel] = useState('');
  const [dataset, setDataset] = useState('');
  const [hardware, setHardware] = useState('NVIDIA RTX 3060 (12GB)');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const presets = [
    {
      title: 'Autonomous Drone Pest Identifier',
      domain: 'Computer Vision',
      model: 'YOLOv8x (Large - 68M)',
      dataset: '2,000 Field Crops Photos',
      hardware: 'Raspberry Pi 4 (4GB RAM)'
    },
    {
      title: 'Hospital Patient Sepsis Early Warning',
      domain: 'Time-Series & Biomedical',
      model: 'Transformer + LSTM Ensemble',
      dataset: '120,000 EHR Vital Sign Records',
      hardware: 'AWS g4dn.xlarge (T4 16GB)'
    },
    {
      title: 'Multilingual Legal Contract Summarizer',
      domain: 'Natural Language Processing',
      model: 'LLaMA-3-8B-Instruct (4-bit AWQ)',
      dataset: '50,000 Court Filing PDFs',
      hardware: 'Single RTX 4090 (24GB VRAM)'
    }
  ];

  const handleApplyPreset = (p) => {
    setTitle(p.title);
    setDomain(p.domain);
    setModel(p.model);
    setDataset(p.dataset);
    setHardware(p.hardware);
    setResult(null);
  };

  const handleRunEvaluation = async (e) => {
    e.preventDefault();
    if (!title.trim() || !model.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const data = await evaluateProjectWithGeminiAPI({
        title: title.trim(),
        domain,
        technologies: model.trim(),
        description: dataset.trim() ? `Dataset: ${dataset.trim()}. Hardware: ${hardware}` : `Hardware target: ${hardware}`,
        skillLevel: 'Intermediate',
        timeline: '3 - 4 Months',
        budget: 'Flexible',
        teamSize: 'Capstone Team (3 - 4 Students)',
      });

      const feasibility = data.feasibility_score ?? 72;
      const riskLevel =
        feasibility >= 75 ? 'Low Risk' :
        feasibility >= 50 ? 'Moderate Risk' : 'High Risk';
      const riskColor =
        feasibility >= 75 ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' :
        feasibility >= 50 ? 'text-amber-500 bg-amber-500/10 border-amber-500/30' :
                            'text-rose-500 bg-rose-500/10 border-rose-500/30';

      const newEval = {
        id: data.evaluation_id || `eval_${Date.now()}`,
        isGemini: true,
        title: title.trim(),
        domain,
        model: model.trim(),
        dataset: dataset.trim() || 'Custom Dataset',
        hardware,
        feasibilityScore: feasibility,
        innovationScore: data.innovation_score,
        technicalDifficulty: data.technical_difficulty,
        requiredSkills: data.required_skills ?? [],
        recommendedTechnologies: data.recommended_technologies ?? [],
        strengths: data.strengths ?? [],
        weaknesses: data.weaknesses ?? [],
        developmentChallenges: data.development_challenges ?? [],
        improvementSuggestions: data.improvement_suggestions ?? [],
        evaluationSummary: data.evaluation_summary ?? '',
        riskLevel,
        riskColor,
        primaryRisk: (data.development_challenges ?? ['No major risks identified.'])[0],
        fixes: data.improvement_suggestions ?? [],
        evaluatedAt: 'Just Now',
        aiModel: data.ai_model,
        evaluatorSource: data.evaluator_source,
      };

      setResult(newEval);
      setIsAnalyzing(false);

      if (onProjectEvaluated) {
        onProjectEvaluated(newEval);
      }
    } catch (err) {
      setIsAnalyzing(false);
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail || err?.message || 'Evaluation failed';

      // Show a simple error result
      setResult({
        id: `err_${Date.now()}`,
        title: title.trim(),
        domain,
        model: model.trim(),
        dataset: dataset.trim() || 'Custom Dataset',
        hardware,
        feasibilityScore: 0,
        riskLevel: 'Error',
        riskColor: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
        primaryRisk: status === 503
          ? 'Gemini API key not configured. Add GEMINI_API_KEY to backend/.env to enable live AI evaluation.'
          : detail,
        fixes: status === 503
          ? ['Get your free API key at https://aistudio.google.com/', 'Paste it into backend/.env as GEMINI_API_KEY="your-key-here"']
          : ['Check the backend server logs for more details.'],
        evaluatedAt: 'Failed',
        isError: true,
      });
    }
  };

  const inputClass = `w-full rounded-xl px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
    theme.isLight
      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white'
      : 'bg-[#080C14] border border-slate-700/80 text-white focus:border-blue-500'
  }`;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className={`text-xl font-bold ${theme.textPrimary}`}>New AI Project Feasibility Evaluation</h2>
        <p className={`text-xs ${theme.textMuted} mt-0.5`}>
          Input your proposed project architecture to calculate failure risk factors and optimization blueprints before writing code.
        </p>
      </div>

      {/* Quick Presets */}
      <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder}`}>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Quick Sample Proposals (Click to fill form):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer font-medium ${
                title === p.title
                  ? `${theme.accentBg} ${theme.accentBorder} ${theme.accentText}`
                  : `${theme.cardInner} ${theme.borderSubtle} ${theme.textSecondary} hover:border-slate-400`
              }`}
            >
              {p.title.split(' ')[0]} {p.title.split(' ')[1]} ({p.domain.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleRunEvaluation} className={`p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-4 shadow-sm`}>
        <div>
          <label className={`text-xs font-semibold ${theme.textSecondary} block mb-1`}>
            Project Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Autonomous Drone Obstacle Detection with Depth Perception"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`text-xs font-semibold ${theme.textSecondary} block mb-1`}>
              Project Domain
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className={inputClass}
            >
              <option value="Computer Vision">Computer Vision (Detection / Segmentation)</option>
              <option value="Natural Language Processing">Natural Language Processing (NLP / RAG)</option>
              <option value="Time-Series & Biomedical">Time-Series &amp; Biomedical Signals</option>
              <option value="Quantitative Finance">Quantitative Finance &amp; Algorithmic Trading</option>
              <option value="Audio & Speech">Audio, Speech &amp; Voice Recognition</option>
              <option value="Robotics & Autonomous Systems">Robotics &amp; Autonomous Systems</option>
            </select>
          </div>

          <div>
            <label className={`text-xs font-semibold ${theme.textSecondary} block mb-1`}>
              Model Architecture &amp; Version <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. YOLOv8x, LLaMA-3-8B, ResNet-50, XGBoost"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={`text-xs font-semibold ${theme.textSecondary} block mb-1`}>
              Dataset Volume &amp; Characteristics
            </label>
            <input
              type="text"
              placeholder="e.g. 5,000 Annotated Images / 100k tabular rows"
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={`text-xs font-semibold ${theme.textSecondary} block mb-1`}>
              Target Deployment Hardware
            </label>
            <input
              type="text"
              placeholder="e.g. Raspberry Pi 4 / RTX 3060 12GB / AWS EC2 T4"
              value={hardware}
              onChange={(e) => setHardware(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isAnalyzing || !title.trim() || !model.trim()}
          className={`w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r ${theme.primaryBtn} disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-4`}
        >
          {isAnalyzing ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>Asking Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run Gemini AI Evaluation</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Live Result Output */}
      {result && (
        <div className={`p-6 rounded-2xl ${theme.cardBg} border ${
          result.isError ? 'border-rose-500/40' : 'border-emerald-500/30'
        } space-y-5 animate-in fade-in duration-300 shadow-md`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {result.isGemini && !result.isError && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Brain className="w-3 h-3" /> Google Gemini AI
                  </span>
                )}
                {result.isError && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <AlertCircle className="w-3 h-3" /> Evaluation Error
                  </span>
                )}
              </div>
              <span className={`text-xs font-semibold ${theme.textMuted} uppercase tracking-wider`}>
                {result.isError ? 'Could Not Complete' : 'Evaluation Complete'}
              </span>
              <h3 className={`text-lg font-bold ${theme.textPrimary}`}>{result.title}</h3>
            </div>
            {!result.isError && (
              <div className="text-right">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${result.riskColor}`}>
                  {result.feasibilityScore}% Feasibility
                </span>
                {result.innovationScore !== undefined && (
                  <div className="text-xs text-blue-400 font-bold mt-1">Innovation: {result.innovationScore}/100</div>
                )}
                {result.technicalDifficulty && (
                  <div className={`text-xs font-semibold mt-0.5 ${
                    result.technicalDifficulty === 'Advanced' ? 'text-rose-400' :
                    result.technicalDifficulty === 'Intermediate' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>{result.technicalDifficulty}</div>
                )}
              </div>
            )}
          </div>

          {/* AI Summary */}
          {result.evaluationSummary && (
            <div className={`p-3 rounded-xl ${theme.cardInner} border ${theme.borderSubtle}`}>
              <p className={`text-xs leading-relaxed ${theme.textSecondary}`}>{result.evaluationSummary}</p>
            </div>
          )}

          {/* Predicted Failure / Challenges */}
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-2">
            <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wide">
              <ShieldAlert className="w-4 h-4" />
              <span>{result.developmentChallenges?.length > 0 ? 'Development Challenges' : 'Predicted Failure Vectors'}:</span>
            </div>
            {result.developmentChallenges?.length > 0 ? (
              <ul className="space-y-1">
                {result.developmentChallenges.map((c, i) => (
                  <li key={i} className="text-xs text-rose-200 flex items-start gap-2">
                    <span className="text-rose-400 font-bold mt-0.5">•</span><span>{c}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-rose-700 dark:text-rose-200 leading-relaxed font-medium">
                {result.primaryRisk}
              </p>
            )}
          </div>

          {/* Improvement Suggestions / Fixes */}
          {result.fixes?.length > 0 && (
            <div className={`p-4 rounded-xl ${theme.accentBg} border ${theme.accentBorder} space-y-2`}>
              <div className={`flex items-center gap-2 ${theme.accentText} text-xs font-bold uppercase tracking-wide`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>{result.improvementSuggestions?.length > 0 ? 'Improvement Suggestions' : 'Recommended Engineering Fixes'}:</span>
              </div>
              <ul className={`space-y-1.5 pl-2 text-xs ${theme.textSecondary}`}>
                {result.fixes.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className={`${theme.accentText} font-bold mt-0.5`}>•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Required Skills */}
          {result.requiredSkills?.length > 0 && (
            <div className={`p-3 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} space-y-2`}>
              <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
                <BookOpen className="w-3.5 h-3.5 text-purple-400" /> Required Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {result.requiredSkills.map((skill, i) => (
                  <span key={i} className={`text-xs font-medium px-2.5 py-1 rounded-lg ${theme.cardBg} border ${theme.borderSubtle} ${theme.textPrimary}`}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className={`p-3 rounded-xl ${theme.cardInner} text-xs ${theme.textMuted} flex items-center justify-between`}>
            <span>
              {result.isError
                ? 'Could not save — check API key configuration.'
                : `Powered by ${result.aiModel || 'Google Gemini'} · Added to history.`}
            </span>
            <span className={`font-semibold ${result.isError ? 'text-rose-400' : theme.accentText}`}>
              {result.isError ? 'Action Required' : 'AI Analysis Complete'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
