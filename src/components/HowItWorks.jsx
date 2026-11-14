import { Terminal, Cpu, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function HowItWorks({ onOpenEvaluator }) {
  const { theme } = useTheme();

  const steps = [
    {
      step: '01',
      title: 'Submit Project Blueprint',
      description: 'Enter your project domain, proposed model (e.g. YOLOv8, LLaMA-3, ResNet, XGBoost), dataset parameters, and deployment hardware target.',
      icon: Terminal,
    },
    {
      step: '02',
      title: 'Multi-Vector Assessment',
      description: 'Our engine parses your pipeline against a knowledge graph of 5,000+ real-world AI post-mortems, evaluating latency, VRAM, and data density.',
      icon: Cpu,
    },
    {
      step: '03',
      title: 'Failure Probability Heatmap',
      description: 'Review empirical failure scores across memory exhaustion, vanishing gradients, edge latency overruns, and data distribution drift.',
      icon: AlertTriangle,
    },
    {
      step: '04',
      title: 'Actionable Optimization Plan',
      description: 'Get tailored architectural recommendations, quantization scripts, alternative lighter models, and an exportable validation certificate.',
      icon: CheckCircle2,
    }
  ];

  return (
    <section id="how-it-works" className={`py-24 ${theme.bg} relative border-t ${theme.borderSubtle} transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${theme.accentBadge} text-xs font-semibold tracking-wider uppercase transition-colors duration-300`}>
            Simple 4-Step Process
          </div>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold ${theme.textPrimary} tracking-tight`}>
            How The Evaluator Works
          </h2>
          <p className={`text-base sm:text-lg ${theme.textSecondary} leading-relaxed`}>
            Go from an unverified AI project concept to a bulletproof, faculty-approved architecture in under 3 minutes.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`relative ${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 group shadow-sm hover:shadow-lg`}
              >
                <div>
                  {/* Step Number with Theme Gradient */}
                  <div className="flex items-center justify-between mb-6">
                    <span className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${theme.primaryGrad} font-mono`}>
                      {item.step}
                    </span>
                    <div className={`w-10 h-10 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} flex items-center justify-center ${theme.iconColor} group-hover:scale-110 transition duration-300`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className={`text-lg font-bold ${theme.textPrimary} mb-2.5 ${theme.iconHover} transition duration-200`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm ${theme.textSecondary} leading-relaxed`}>
                    {item.description}
                  </p>
                </div>

                <div className={`mt-6 pt-4 border-t ${theme.borderSubtle} flex items-center gap-1.5 text-xs ${theme.textMuted}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${theme.accentText} bg-current`} />
                  <span>Phase {idx + 1} of 4</span>
                </div>
              </div>
            );
          })}

        </div>

        {/* Bottom CTA banner */}
        <div className={`mt-16 rounded-2xl p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 border ${theme.cardBorder} ${theme.cardBg} backdrop-blur-xl shadow-xl transition-all duration-300`}>
          <div className="space-y-1">
            <h4 className={`text-xl font-bold ${theme.textPrimary}`}>Ready to test your project idea?</h4>
            <p className={`text-sm ${theme.textSecondary}`}>Join thousands of students and engineers validating before coding.</p>
          </div>
          <button
            onClick={onOpenEvaluator}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r ${theme.primaryBtn} transition shadow-lg shrink-0 cursor-pointer active:scale-95`}
          >
            <span>Start Free Evaluation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
