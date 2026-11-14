import { useState, useId } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  KeyRound
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { theme } = useTheme();
  const { login, register, resetPassword } = useAuth();

  // 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState(initialMode);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error and UI states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [generalError, setGeneralError] = useState('');

  const fullNameId = useId();
  const emailId = useId();
  const universityId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const rememberMeId = useId();

  if (!isOpen) return null;

  // Real-time password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-300' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500' };
    if (score <= 2) return { score: 50, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' };
    if (score <= 3) return { score: 75, label: 'Good', color: 'bg-blue-500', text: 'text-blue-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  // Form validation logic
  const validateForm = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. student@college.edu).';
    }

    if (mode === 'forgot') {
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    }

    if (mode === 'register') {
      if (!fullName.trim() || fullName.trim().length < 2) {
        errs.fullName = 'Please enter your full name (at least 2 characters).';
      }

      if (!confirmPassword) {
        errs.confirmPassword = 'Confirmation password is required.';
      } else if (password !== confirmPassword) {
        errs.confirmPassword = 'Passwords do not match.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setResetSuccessMessage('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
      } else if (mode === 'register') {
        await register({ fullName, email, password, university });
        onClose();
      } else if (mode === 'forgot') {
        const res = await resetPassword(email);
        setResetSuccessMessage(res.message);
      }
    } catch (err) {
      setGeneralError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = (hasError) => `
    w-full pl-10 pr-10 py-2.5 rounded-xl text-sm transition focus:outline-none focus:ring-2 
    ${hasError 
      ? 'border-rose-500 focus:ring-rose-400/40 bg-rose-500/5' 
      : theme.isLight
      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20'
      : 'bg-[#0A0F1D] border border-slate-700/80 text-white focus:border-blue-500 focus:ring-blue-500/20'
    }
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-md ${theme.cardBg} border ${theme.cardBorder} rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col transition-all duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className={`p-5 border-b ${theme.borderSubtle} flex items-center justify-between ${theme.cardInner}`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${theme.swatch} flex items-center justify-center text-white shadow-sm`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${theme.textPrimary}`}>
                {mode === 'login' && 'Student & Researcher Login'}
                {mode === 'register' && 'Student Registration'}
                {mode === 'forgot' && 'Reset Account Password'}
              </h3>
              <p className={`text-[11px] ${theme.textMuted}`}>
                {mode === 'login' && 'Access project evaluations & failure reports'}
                {mode === 'register' && 'Create your free account for semester projects'}
                {mode === 'forgot' && 'Receive password recovery instructions'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${theme.textMuted} hover:${theme.textPrimary} transition cursor-pointer`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Login vs Register) */}
        {mode !== 'forgot' && (
          <div className={`flex border-b ${theme.borderSubtle} ${theme.cardInner}`}>
            <button
              onClick={() => { setMode('login'); setErrors({}); setGeneralError(''); }}
              className={`flex-1 py-3 text-xs font-bold transition text-center cursor-pointer border-b-2 ${
                mode === 'login'
                  ? `border-blue-500 ${theme.isLight ? 'text-blue-900 bg-white' : 'text-white bg-slate-900/40'}`
                  : `border-transparent ${theme.textMuted} hover:${theme.textSecondary}`
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setMode('register'); setErrors({}); setGeneralError(''); }}
              className={`flex-1 py-3 text-xs font-bold transition text-center cursor-pointer border-b-2 ${
                mode === 'register'
                  ? `border-blue-500 ${theme.isLight ? 'text-blue-900 bg-white' : 'text-white bg-slate-900/40'}`
                  : `border-transparent ${theme.textMuted} hover:${theme.textSecondary}`
              }`}
            >
              Register as Student
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          
          {/* General Banner Error */}
          {generalError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Reset Password Success Alert */}
          {resetSuccessMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Reset Email Sent</div>
                <p className="mt-0.5 opacity-90">{resetSuccessMessage}</p>
              </div>
            </div>
          )}

          {/* Full Name (Registration only) */}
          {mode === 'register' && (
            <div>
              <label htmlFor={fullNameId} className={`text-xs font-semibold ${theme.textSecondary} block mb-1`}>
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className={`w-4 h-4 absolute left-3.5 top-3 ${theme.textMuted}`} />
                <input
                  id={fullNameId}
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClasses(errors.fullName)}
                />
              </div>
              {errors.fullName && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.fullName}
                </p>
              )}
            </div>
          )}

          {/* Email Address */}
          <div>
            <label htmlFor={emailId} className={`text-xs font-semibold ${theme.textSecondary} block mb-1`}>
              Student Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className={`w-4 h-4 absolute left-3.5 top-3 ${theme.textMuted}`} />
              <input
                id={emailId}
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses(errors.email)}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.email}
              </p>
            )}
          </div>

          {/* University / College (Registration only) */}
          {mode === 'register' && (
            <div>
              <label htmlFor={universityId} className={`text-xs font-semibold ${theme.textSecondary} block mb-1`}>
                College / University Name <span className={`text-[10px] font-normal ${theme.textMuted}`}>(Optional)</span>
              </label>
              <div className="relative">
                <GraduationCap className={`w-4 h-4 absolute left-3.5 top-3 ${theme.textMuted}`} />
                <input
                  id={universityId}
                  type="text"
                  placeholder="e.g. Stanford / IIT Madras / Anna Univ"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className={inputClasses(false)}
                />
              </div>
            </div>
          )}

          {/* Password (Login and Register) */}
          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor={passwordId} className={`text-xs font-semibold ${theme.textSecondary}`}>
                  Password <span className="text-rose-500">*</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setErrors({}); setGeneralError(''); }}
                    className="text-[11px] text-blue-500 hover:text-blue-600 transition cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className={`w-4 h-4 absolute left-3.5 top-3 ${theme.textMuted}`} />
                <input
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClasses(errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3.5 top-3 ${theme.textMuted} hover:${theme.textPrimary} transition cursor-pointer`}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </p>
              )}

              {/* Password strength meter for registration */}
              {mode === 'register' && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={theme.textMuted}>Strength:</span>
                    <span className={`font-semibold ${passwordStrength.text}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Confirm Password (Registration only) */}
          {mode === 'register' && (
            <div>
              <label htmlFor={confirmPasswordId} className={`text-xs font-semibold ${theme.textSecondary} block mb-1`}>
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className={`w-4 h-4 absolute left-3.5 top-3 ${theme.textMuted}`} />
                <input
                  id={confirmPasswordId}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClasses(errors.confirmPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3.5 top-3 ${theme.textMuted} hover:${theme.textPrimary} transition cursor-pointer`}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* Remember Me Checkbox (Login only) */}
          {mode === 'login' && (
            <div className="flex items-center justify-between pt-1">
              <label htmlFor={rememberMeId} className="flex items-center gap-2 cursor-pointer">
                <input
                  id={rememberMeId}
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-xs ${theme.textSecondary}`}>Stay signed in for 30 days</span>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r ${theme.primaryBtn} disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer`}
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In to Account'}
                  {mode === 'register' && 'Complete Student Registration'}
                  {mode === 'forgot' && 'Send Password Reset Email'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Forgot Password back to login button */}
          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => { setMode('login'); setErrors({}); setResetSuccessMessage(''); }}
              className={`w-full py-2 text-xs font-semibold ${theme.textMuted} hover:${theme.textPrimary} transition cursor-pointer`}
            >
              &larr; Back to Login
            </button>
          )}

          {/* Footer note explaining password hashing & security */}
          <div className={`pt-3 border-t ${theme.borderSubtle} text-center text-[10px] ${theme.textMuted}`}>
            <span>🔒 Security Notice: Passwords are encrypted with SHA-256 / Bcrypt hashing before verification.</span>
          </div>

        </form>
      </div>
    </div>
  );
}
