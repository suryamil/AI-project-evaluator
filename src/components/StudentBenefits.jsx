import { 
  Clock, 
  Coins, 
  Award, 
  ShieldCheck, 
  Quote 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function StudentBenefits({ onOpenEvaluator }) {
  const { theme } = useTheme();

  const benefits = [
    {
      icon: Clock,
      title: 'Never Waste a Semester on a Dead-End Idea',
      description: 'Over 68% of final-year AI capstones stall midway due to unfeasible data labeling costs or model training divergence. Catch blockers in week 1, not week 14.',
      tag: 'Academic Safety'
    },
    {
      icon: Award,
      title: 'Ace Your Thesis & Project Defense',
      description: 'Export an empirical architectural audit. When committee professors ask "Why did you choose this architecture over alternatives?", you have backed answers.',
      tag: 'Viva & Defense'
    },
    {
      icon: Coins,
      title: 'Protect Your GPU Budget & Colab Units',
      description: 'Avoid running out of Google Colab compute units or renting AWS EC2 instances only to get Out-Of-Memory (OOM) crashes on your very first epoch.',
      tag: 'Cost Savings'
    },
    {
      icon: ShieldCheck,
      title: 'Stand Out in AI & ML Job Interviews',
      description: 'Tech recruiters look for engineers who understand production trade-offs. Discussing your project with risk-mitigation metrics sets you in the top 5%.',
      tag: 'Career Readiness'
    }
  ];

  return (
    <section id="benefits" className={`py-24 ${theme.bgSecondary} relative border-t ${theme.borderSubtle} transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${theme.accentBadge} text-xs font-semibold tracking-wider uppercase transition-colors duration-300`}>
            Designed for Academia &amp; Students
          </div>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold ${theme.textPrimary} tracking-tight`}>
            Built Specifically For College &amp; Capstone Students
          </h2>
          <p className={`text-base sm:text-lg ${theme.textSecondary} leading-relaxed`}>
            Turn your theoretical AI project ideas into high-scoring, production-tested capstone deliverables that faculty love and recruiters hire.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-7 transition-all duration-300 hover:shadow-xl flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${theme.accentBg} border ${theme.accentBorder} flex items-center justify-center ${theme.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${theme.cardInner} border ${theme.accentBorder} ${theme.accentText}`}>
                      {item.tag}
                    </span>
                  </div>

                  <h3 className={`text-xl font-bold ${theme.textPrimary} mb-2.5`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm ${theme.textSecondary} leading-relaxed`}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Testimonial Banner */}
        <div className={`rounded-2xl ${theme.cardBg} border ${theme.cardBorder} p-8 sm:p-10 relative overflow-hidden backdrop-blur-xl shadow-md`}>
          <div className="max-w-2xl relative space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {['★', '★', '★', '★', '★'].map((star, i) => (
                <span key={i} className="text-lg">{star}</span>
              ))}
            </div>
            <p className={`text-base sm:text-lg ${theme.textPrimary} italic leading-relaxed font-normal`}>
              &ldquo;My original capstone idea was a 7B LLM running directly inside an Android app with on-device fine-tuning. EvalAI flagged severe RAM bottlenecks (12GB required vs 4GB phone memory) in 30 seconds. We switched to an edge-distilled quantized model and won Best Final Year Project.&rdquo;
            </p>
            <div className="pt-2">
              <div className={`font-bold ${theme.textPrimary} text-sm`}>Arjun M. &bull; CS Final Year Student</div>
              <div className={`text-xs ${theme.textMuted}`}>Anna University &bull; Final Year Capstone Team Lead</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
