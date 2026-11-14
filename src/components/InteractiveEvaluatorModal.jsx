import { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  RotateCcw, 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function InteractiveEvaluatorModal({ isOpen, onClose }) {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    title: 'Drone Crop Disease Detection on Raspberry Pi 4',
    domain: 'Computer Vision',
    model: 'YOLOv8x (Large)',
    datasetSize: '1,500 Images (Unbalanced)',
    hardware: 'Raspberry Pi 4 (4GB RAM, CPU-only)',
  });

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  if (!isOpen) return null;

  const presets = [
    {
      label: 'Edge Drone Detection',
      title: 'Drone Crop Disease Detection on Raspberry Pi 4',
      domain: 'Computer Vision',
      model: 'YOLOv8x (Large)',
      datasetSize: '1,500 Images (Unbalanced)',
      hardware: 'Raspberry Pi 4 (4GB RAM, CPU-only)',
      result: {
        score: 42,
        status: 'Critical Failure Risk',
        bottlenecks: [
          'Model parameter size (~68M params) exceeds Raspberry Pi 4 real-time inference capability (>4,200ms per frame).',
          'Dataset of 1,500 images is deficient for fine-tuning YOLOv8x from scratch without severe overfitting.',
          'Thermal throttling will degrade frame rate to under 0.2 FPS during drone flight.'
        ],
        fixes: [
          'Switch architecture to YOLOv8n (Nano) or MobileNetV4 with only ~3.2M parameters.',
          'Quantize weights to INT8 format using OpenVINO / ONNX Runtime to leverage Pi 4 NEON instructions.',
          'Target expected performance: 18-22 FPS at under 1.5 Watts.'
        ]
      }
    },
    {
      label: 'Financial RAG Bot',
      title: 'Wall Street SEC 10-K Filing Question Answering',
      domain: 'Natural Language Processing',
      model: 'Mixtral-8x7B + FAISS Vector DB',
      datasetSize: '45,000 PDF Financial Reports',
      hardware: 'Single RTX 3060 (12GB VRAM)',
      result: {
        score: 64,
        status: 'Moderate Risk (VRAM Exhaustion)',
        bottlenecks: [
          'Mixtral-8x7B requires at least 24GB-48GB VRAM in FP16, resulting in CUDA Out-Of-Memory on 12GB RTX 3060.',
          'Table parsing in SEC 10-K filings suffers 35% OCR misalignment using standard chunking.'
        ],
        fixes: [
          'Deploy quantized 4-bit AWQ / GGUF or utilize vLLM with PagedAttention.',
          'Use specialized table-aware parser (e.g. Unstructured.io / Nougat) before vector indexing.'
        ]
      }
    },
    {
      label: 'ECG Arrhythmia Classifier',
      title: 'Real-Time ECG Heart Arrhythmia Classifier',
      domain: 'Time-Series & Biomedical',
      model: '1D-CNN + Bidirectional LSTM',
      datasetSize: 'MIT-BIH Arrhythmia Database (100,000 beats)',
      hardware: 'Hospital Bedside Monitor (ARM Cortex-M)',
      result: {
        score: 88,
        status: 'High Feasibility Architecture',
        bottlenecks: [
          'Subject-wise leakage if patient records are split randomly into train/test instead of patient-grouped folds.'
        ],
        fixes: [
          'Enforce GroupKFold validation by Patient ID to avoid optimistic evaluation bias.',
          'Convert model to TensorFlow Lite for Microcontrollers (TFLM).'
        ]
      }
    }
  ];

  const handleSelectPreset = (preset) => {
    setFormData({
      title: preset.title,
      domain: preset.domain,
      model: preset.model,
      datasetSize: preset.datasetSize,
      hardware: preset.hardware,
    });
    setEvaluationResult(null);
  };

  const runEvaluation = () => {
    setIsEvaluating(true);
    setEvaluationResult(null);

    setTimeout(() => {
      const matched = presets.find((p) => p.title === formData.title);
      if (matched) {
        setEvaluationResult(matched.result);
      } else {
        setEvaluationResult({
          score: 65,
          status: 'Moderate Risk Detected',
          bottlenecks: [
            `Model ${formData.model} requires careful VRAM monitoring on ${formData.hardware}.`,
            `Dataset volume (${formData.datasetSize}) needs cross-validation check for class balance.`
          ],
          fixes: [
            'Implement FP16 mixed-precision training to conserve memory.',
            'Perform baseline testing with a simpler model before scaling up architecture complexity.'
          ]
        });
      }
      setIsEvaluating(false);
    }, 1200);
  };

  const inputStyle = `w-full rounded-xl px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
    theme.isLight
      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white'
      : 'bg-[#080C14] border border-slate-700 text-white focus:border-blue-500'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-2xl ${theme.cardBg} border ${theme.cardBorder} rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 sm:p-5 border-b ${theme.borderSubtle} ${theme.cardInner}`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${theme.accentBg} ${theme.accentText} border ${theme.accentBorder}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-bold ${theme.textPrimary}`}>Live AI Project Evaluator</h3>
              <p className={`text-xs ${theme.textMuted}`}>Test architecture feasibility &amp; predict failure points</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${theme.textMuted} hover:${theme.textPrimary} transition cursor-pointer`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto">
          
          {/* Preset Buttons */}
          <div>
            <label className={`text-xs font-semibold uppercase tracking-wider ${theme.textMuted} mb-2 block`}>
              Load an Example Proposal:
            </label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium cursor-pointer ${
                    formData.title === preset.title
                      ? `${theme.accentBg} ${theme.accentBorder} ${theme.accentText}`
                      : `${theme.cardInner} ${theme.borderSubtle} ${theme.textSecondary} hover:border-slate-400`
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className={`text-xs font-medium ${theme.textSecondary} block mb-1`}>Project Idea Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={inputStyle}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`text-xs font-medium ${theme.textSecondary} block mb-1`}>Domain</label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={`text-xs font-medium ${theme.textSecondary} block mb-1`}>Model Architecture</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={`text-xs font-medium ${theme.textSecondary} block mb-1`}>Dataset Size &amp; Nature</label>
                <input
                  type="text"
                  value={formData.datasetSize}
                  onChange={(e) => setFormData({ ...formData, datasetSize: e.target.value })}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={`text-xs font-medium ${theme.textSecondary} block mb-1`}>Target Hardware / Host</label>
                <input
                  type="text"
                  value={formData.hardware}
                  onChange={(e) => setFormData({ ...formData, hardware: e.target.value })}
                  className={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={runEvaluation}
            disabled={isEvaluating}
            className={`w-full py-3 rounded-xl bg-gradient-to-r ${theme.primaryBtn} disabled:opacity-50 font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg cursor-pointer`}
          >
            {isEvaluating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Simulating Architectural Vectors...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run AI Feasibility Evaluation</span>
              </>
            )}
          </button>

          {/* Evaluation Results Card */}
          {evaluationResult && (
            <div className={`rounded-xl border ${theme.borderSubtle} ${theme.cardInner} p-5 space-y-4 animate-in fade-in duration-300 shadow-inner`}>
              <div className={`flex items-center justify-between pb-3 border-b ${theme.borderSubtle}`}>
                <span className={`text-xs font-semibold ${theme.textMuted} uppercase tracking-wider`}>Evaluation Report</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  evaluationResult.score > 75 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                    : evaluationResult.score > 50 
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                }`}>
                  {evaluationResult.score}% Feasibility &bull; {evaluationResult.status}
                </span>
              </div>

              {/* Identified Bottlenecks */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-rose-500 flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>Predicted Failure Risks:</span>
                </div>
                <ul className="space-y-1.5 pl-2 text-xs text-rose-700 dark:text-rose-200">
                  {evaluationResult.bottlenecks.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold mt-0.5">&bull;</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Fixes */}
              <div className={`space-y-2 pt-2 border-t ${theme.borderSubtle}`}>
                <div className={`text-xs font-bold ${theme.accentText} flex items-center gap-1.5 uppercase tracking-wide`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Recommended Architectural Blueprint:</span>
                </div>
                <ul className={`space-y-1.5 pl-2 text-xs ${theme.textSecondary}`}>
                  {evaluationResult.fixes.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className={`${theme.accentText} font-bold mt-0.5`}>&bull;</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${theme.borderSubtle} ${theme.cardInner} flex justify-end`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${theme.secondaryBtn} border transition cursor-pointer`}
          >
            Close Evaluator
          </button>
        </div>
      </div>
    </div>
  );
}
