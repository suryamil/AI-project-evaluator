import { 
  ShieldAlert, 
  Database, 
  BarChart3, 
  FileText, 
  Zap, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Features() {
  const { theme } = useTheme();

  const featureList = [
    {
      icon: Layers,
      title: 'Architectural Feasibility Engine',
      description: 'Checks model depth, layer complexity, and input dimensionality against your target performance criteria before writing a single line of training code.',
      badge: 'Architecture'
    },
    {
      icon: ShieldAlert,
      title: 'Predictive Failure Scoring',
      description: 'Calculates empirical failure risk probabilities across memory limits, training divergence, overfitting traps, and real-time latency thresholds.',
      badge: 'Risk Analysis'
    },
    {
      icon: Database,
      title: 'Dataset Adequacy & Leakage Audit',
      description: 'Verifies sample volume sufficiency per class, evaluates annotation ambiguity risks, and detects insidious train-test temporal leakage vectors.',
      badge: 'Data Integrity'
    },
    {
      icon: BarChart3,
      title: 'VRAM & Cloud Compute Estimator',
      description: 'Computes parameter counts, required batch VRAM on T4/A10G/A100 GPUs, and predicts total training cloud cost down to the dollar.',
      badge: 'Cost & Compute'
    },
    {
      icon: Zap,
      title: 'Automated Mitigation Blueprints',
      description: 'Delivers actionable engineering fixes: model pruning suggestions, ONNX/TensorRT quantization pathways, and robust validation split designs.',
      badge: 'Optimization'
    },
    {
      icon: FileText,
      title: 'Academic & Industry Audit Reports',
      description: 'Generates professional PDF and JSON evaluation certificates ready for university thesis defense committees, capstone advisors, or investors.',
      badge: 'Verification'
    }
  ];

  return (
    <section id="features" className={`py-24 ${theme.bgSecondary} relative border-t ${theme.borderSubtle} transition-colors duration-500`}>
      {/* Decorative gradient glow */}
      <div className={`absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr ${theme.glow} blur-[140px] pointer-events-none rounded-full transition-all duration-700`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${theme.accentBadge} text-xs font-semibold tracking-wider uppercase transition-colors duration-300`}>
            Platform Capabilities
          </div>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold ${theme.textPrimary} tracking-tight`}>
            Comprehensive AI Feasibility Suite
          </h2>
          <p className={`text-base sm:text-lg ${theme.textSecondary} leading-relaxed`}>
            Eliminate project guesswork. We inspect your proposed machine learning pipeline from data ingestion to edge deployment.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featureList.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className={`group relative rounded-2xl ${theme.cardBg} border ${theme.cardBorder} p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl ${theme.accentBg} border ${theme.accentBorder} flex items-center justify-center ${theme.iconColor} group-hover:scale-110 transition duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-mono uppercase tracking-wider ${theme.textMuted} font-semibold px-2 py-0.5 rounded ${theme.cardInner} border ${theme.borderSubtle}`}>
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className={`text-xl font-bold ${theme.textPrimary} mb-2 ${theme.iconHover} transition duration-200`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm ${theme.textSecondary} leading-relaxed`}>
                    {feature.description}
                  </p>
                </div>

                <div className={`mt-6 pt-4 border-t ${theme.borderSubtle} flex items-center gap-2 text-xs font-semibold ${theme.accentText} transition`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Integrated Analysis</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
