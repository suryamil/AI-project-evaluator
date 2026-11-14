import { Brain, Code2, Globe, Share2, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Footer({ onOpenEvaluator }) {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${theme.bgSecondary} border-t ${theme.borderSubtle} ${theme.textSecondary} relative transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          
          {/* Brand Info (2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <a href="#" className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr ${theme.swatch} p-0.5 shadow-sm`}>
                <div className={`w-full h-full ${theme.cardBg} rounded-[10px] flex items-center justify-center`}>
                  <Brain className={`w-4 h-4 ${theme.iconColor}`} />
                </div>
              </div>
              <span className={`text-lg font-bold tracking-tight ${theme.textPrimary}`}>
                Eval<span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.primaryGrad}`}>AI</span>
              </span>
            </a>

            <p className={`text-sm ${theme.textSecondary} leading-relaxed max-w-sm`}>
              The standard architectural validation &amp; failure prediction suite for modern AI engineers, academic researchers, and computer science students.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className={`w-9 h-9 rounded-lg ${theme.cardInner} border ${theme.borderSubtle} flex items-center justify-center ${theme.textSecondary} hover:${theme.textPrimary} transition`}
                aria-label="GitHub Repository"
                title="GitHub"
              >
                <Code2 className="w-4 h-4" />
              </a>
              <a
                href="https://evalai.dev"
                target="_blank"
                rel="noreferrer"
                className={`w-9 h-9 rounded-lg ${theme.cardInner} border ${theme.borderSubtle} flex items-center justify-center ${theme.textSecondary} hover:${theme.textPrimary} transition`}
                aria-label="Website"
                title="Community"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className={`w-9 h-9 rounded-lg ${theme.cardInner} border ${theme.borderSubtle} flex items-center justify-center ${theme.textSecondary} hover:${theme.textPrimary} transition`}
                aria-label="LinkedIn"
                title="Network"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="mailto:contact@evalai.dev"
                className={`w-9 h-9 rounded-lg ${theme.cardInner} border ${theme.borderSubtle} flex items-center justify-center ${theme.textSecondary} hover:${theme.textPrimary} transition`}
                aria-label="Email Us"
                title="Email Support"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column: Platform */}
          <div className="space-y-3">
            <h4 className={`text-xs font-semibold uppercase tracking-wider ${theme.textPrimary}`}>Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className={`hover:${theme.accentText} transition`}>Feasibility Engine</a>
              </li>
              <li>
                <a href="#features" className={`hover:${theme.accentText} transition`}>Failure Heatmaps</a>
              </li>
              <li>
                <a href="#features" className={`hover:${theme.accentText} transition`}>VRAM Estimator</a>
              </li>
              <li>
                <button onClick={onOpenEvaluator} className={`hover:${theme.accentText} transition text-left cursor-pointer`}>
                  Interactive Evaluator
                </button>
              </li>
            </ul>
          </div>

          {/* Column: Resources */}
          <div className="space-y-3">
            <h4 className={`text-xs font-semibold uppercase tracking-wider ${theme.textPrimary}`}>Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#how-it-works" className={`hover:${theme.accentText} transition`}>How It Works</a>
              </li>
              <li>
                <a href="#benefits" className={`hover:${theme.accentText} transition`}>Student Capstones</a>
              </li>
              <li>
                <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className={`hover:${theme.accentText} transition flex items-center gap-1`}>
                  <span>FastAPI Backend Docs</span>
                  <span className={`text-[10px] ${theme.accentText} font-mono`}>/docs</span>
                </a>
              </li>
              <li>
                <a href="#preview" className={`hover:${theme.accentText} transition`}>Sample Case Studies</a>
              </li>
            </ul>
          </div>

          {/* Column: Contact & Support */}
          <div className="space-y-3">
            <h4 className={`text-xs font-semibold uppercase tracking-wider ${theme.textPrimary}`}>Contact &amp; Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:support@evalai.dev" className={`hover:${theme.accentText} transition`}>support@evalai.dev</a>
              </li>
              <li>
                <span className={theme.textMuted}>Academic Partnerships</span>
              </li>
              <li>
                <span className={theme.textMuted}>Research Grants</span>
              </li>
              <li className="pt-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Systems Operational</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className={`mt-14 pt-8 border-t ${theme.borderSubtle} flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${theme.textMuted}`}>
          <div>
            &copy; {currentYear} AI Project Evaluator &amp; Failure Predictor. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className={`hover:${theme.textPrimary} transition`}>Privacy Policy</a>
            <a href="#" className={`hover:${theme.textPrimary} transition`}>Terms of Service</a>
            <a href="#" className={`hover:${theme.textPrimary} transition`}>Security</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
