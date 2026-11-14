import { useState } from 'react';
import { 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  RotateCw,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Hero({ onOpenEvaluator }) {
  const { theme } = useTheme();
  const [activePreset, setActivePreset] = useState(0);

  const sampleEvaluations = [
    {
      title: "Real-Time Medical X-Ray Diagnoser on Edge GPU",
      domain: "Computer Vision / Healthcare",
      feasibilityScore: 58,
      riskLevel: "High Risk (Latency & Imbalance)",
      primaryBottleneck: "Inference latency (1,850ms) violates edge 200ms threshold; severe class imbalance in Rare Pathology labels.",
      recommendation: "Quantize weights via TensorRT INT8; augment with synthetic diffusion samples to cure severe class deficit."
    },
    {
      title: "RAG Agent for 500,000 Legal PDF Contracts",
      domain: "NLP / Large Language Models",
      feasibilityScore: 84,
      riskLevel: "Low Risk (Feasible Architecture)",
      primaryBottleneck: "Token context dilution on multi-clause cross-referencing.",
      recommendation: "Adopt hybrid semantic + BM25 reciprocal rank fusion with hierarchical chunking."
    },
    {
      title: "Real-time Crypto Volatility Predictor with LSTMs",
      domain: "Time-Series / Quantitative Finance",
      feasibilityScore: 32,
      riskLevel: "Critical Risk (Data Leakage & Slippage)",
      primaryBottleneck: "Lookahead bias detected in rolling z-score normalization; slippage exceeds simulated profit margins.",
      recommendation: "Shift to purged cross-validation and incorporate tick-level order book spread metrics."
    }
  ];

  const currentSample = sampleEvaluations[activePreset];

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background radial gradient glow according to active theme */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr ${theme.glow} blur-[140px] -z-10 pointer-events-none rounded-full transition-all duration-700`} />
      
      {/* Dot Matrix Grid overlay for modern SaaS depth */}
      <div className={`absolute inset-0 ${theme.dotGrid} [background-size:24px_24px] -z-20 pointer-events-none`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Pill Badge */}
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${theme.accentBadge} text-xs sm:text-sm font-medium shadow-inner transition-all duration-300`}>
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Next-Gen Architecture Intelligence &bull; 94% Risk Detection</span>
            </div>

            {/* Main Hero Heading */}
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight ${theme.textPrimary} leading-[1.12]`}>
              Validate Your Project Idea{" "}
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.primaryGrad} transition-all duration-500`}>
                Before You Build
              </span>
            </h1>

            {/* Subtitle */}
            <p className={`text-base sm:text-lg ${theme.textSecondary} max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed`}>
              Don't discover computational bottlenecks, data leaks, or unfeasible model latency after spending months of coding. 
              Our AI evaluation engine simulates architectural stress points, calculates exact failure probabilities, and generates an optimized production roadmap.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onOpenEvaluator}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-base bg-gradient-to-r ${theme.primaryBtn} transition duration-200 shadow-xl cursor-pointer active:scale-95`}
              >
                <span>Get Started — Free Evaluation</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <a
                href="#features"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-base ${theme.secondaryBtn} border transition duration-200 shadow-sm`}
              >
                <span>Explore Features</span>
              </a>
            </div>

            {/* Social Proof / Stats */}
            <div className={`pt-8 border-t ${theme.borderSubtle} grid grid-cols-3 gap-4 text-center lg:text-left`}>
              <div>
                <div className={`text-2xl sm:text-3xl font-extrabold ${theme.textPrimary} tracking-tight`}>1,200+</div>
                <div className={`text-xs ${theme.textMuted} font-medium mt-0.5`}>Projects Audited</div>
              </div>
              <div>
                <div className={`text-2xl sm:text-3xl font-extrabold ${theme.accentText} tracking-tight transition-colors duration-300`}>42%</div>
                <div className={`text-xs ${theme.textMuted} font-medium mt-0.5`}>Compute Cost Saved</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">Zero</div>
                <div className={`text-xs ${theme.textMuted} font-medium mt-0.5`}>Dead-End Submissions</div>
              </div>
            </div>

          </div>

          {/* Right Column: Live Mock Feasibility Card */}
          <div className="lg:col-span-5" id="preview">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer decorative gradient border */}
              <div className={`relative rounded-2xl p-[1px] bg-gradient-to-b ${theme.swatch} shadow-2xl transition-all duration-500`}>
                <div className={`${theme.cardBg} rounded-2xl p-6 sm:p-7 space-y-5 backdrop-blur-xl border ${theme.borderSubtle} transition-colors duration-500 shadow-lg`}>
                  
                  {/* Card Header & Sample Switcher */}
                  <div className={`flex items-center justify-between pb-4 border-b ${theme.borderSubtle}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                      <span className={`text-xs font-mono ${theme.textMuted} ml-2`}>live_audit_report.json</span>
                    </div>

                    <button
                      onClick={() => setActivePreset((prev) => (prev + 1) % sampleEvaluations.length)}
                      className={`inline-flex items-center gap-1.5 text-xs ${theme.accentText} font-medium ${theme.accentBg} border ${theme.accentBorder} px-2.5 py-1 rounded-md transition hover:scale-105 cursor-pointer`}
                      title="Cycle through sample evaluations"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Next Example</span>
                    </button>
                  </div>

                  {/* Project Title Preview */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs uppercase tracking-wider ${theme.textMuted} font-semibold`}>Evaluated Project</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded ${theme.cardInner} ${theme.textSecondary} border ${theme.borderSubtle} font-mono`}>
                        {currentSample.domain}
                      </span>
                    </div>
                    <div className={`text-base sm:text-lg font-bold ${theme.textPrimary} leading-snug`}>
                      {currentSample.title}
                    </div>
                  </div>

                  {/* Feasibility Metric Bar */}
                  <div className={`${theme.cardInner} border ${theme.borderSubtle} rounded-xl p-4 space-y-2.5 shadow-inner`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${theme.textSecondary} flex items-center gap-1.5`}>
                        <TrendingUp className={`w-3.5 h-3.5 ${theme.iconColor}`} />
                        Feasibility Index
                      </span>
                      <span className={`text-sm font-bold font-mono ${
                        currentSample.feasibilityScore > 75 
                          ? 'text-emerald-500' 
                          : currentSample.feasibilityScore > 50 
                          ? 'text-amber-500' 
                          : 'text-rose-500'
                      }`}>
                        {currentSample.feasibilityScore}% / 100%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          currentSample.feasibilityScore > 75 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                            : currentSample.feasibilityScore > 50 
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                            : 'bg-gradient-to-r from-rose-500 to-red-400'
                        }`}
                        style={{ width: `${currentSample.feasibilityScore}%` }}
                      />
                    </div>

                    <div className={`text-[11px] ${theme.textMuted} flex items-center justify-between`}>
                      <span>Status: <strong className={theme.textPrimary}>{currentSample.riskLevel}</strong></span>
                      <span className={`${theme.accentText} font-mono font-medium`}>Confidence 96.8%</span>
                    </div>
                  </div>

                  {/* Top Bottleneck Alert */}
                  <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl p-3.5 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-rose-600 dark:text-rose-300 uppercase tracking-wide">Predicted Failure Vector</div>
                      <p className="text-xs text-rose-700 dark:text-rose-200/90 leading-relaxed">
                        {currentSample.primaryBottleneck}
                      </p>
                    </div>
                  </div>

                  {/* Recommended Action */}
                  <div className={`${theme.accentBg} border ${theme.accentBorder} rounded-xl p-3.5 flex items-start gap-3`}>
                    <CheckCircle2 className={`w-5 h-5 ${theme.iconColor} shrink-0 mt-0.5`} />
                    <div className="space-y-0.5">
                      <div className={`text-xs font-semibold ${theme.accentText} uppercase tracking-wide`}>Optimization Blueprint</div>
                      <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>
                        {currentSample.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* Live Modal Trigger */}
                  <button
                    onClick={onOpenEvaluator}
                    className={`w-full py-2.5 px-4 rounded-xl ${theme.secondaryBtn} font-medium text-xs sm:text-sm border transition flex items-center justify-center gap-2 cursor-pointer shadow-sm`}
                  >
                    <span>Run Evaluation On Your Own Project</span>
                    <ArrowRight className={`w-4 h-4 ${theme.iconColor}`} />
                  </button>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
