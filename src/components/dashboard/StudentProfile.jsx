import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Calendar, 
  ShieldCheck, 
  HardDrive, 
  CheckCircle2, 
  Clock, 
  FileCheck 
} from 'lucide-react';

export default function StudentProfile() {
  const { user } = useAuth();
  const { theme } = useTheme();

  const milestones = [
    { name: 'Capstone Problem Statement Approved', status: 'Completed', date: 'Oct 15, 2026', icon: CheckCircle2, color: 'text-emerald-500' },
    { name: 'Model Architecture Feasibility Audit', status: 'In Progress', date: 'Nov 05, 2026', icon: Clock, color: 'text-blue-500' },
    { name: 'Dataset Annotation & Leakage Test', status: 'Upcoming', date: 'Nov 20, 2026', icon: Clock, color: 'text-slate-400' },
    { name: 'Mid-Semester Project Review', status: 'Upcoming', date: 'Dec 10, 2026', icon: Clock, color: 'text-slate-400' },
    { name: 'Final Thesis Defense & Code Freeze', status: 'Upcoming', date: 'Apr 15, 2027', icon: Clock, color: 'text-slate-400' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className={`text-xl font-bold ${theme.textPrimary}`}>Student Profile &amp; Academic Credentials</h2>
        <p className={`text-xs ${theme.textMuted} mt-0.5`}>
          Manage your student researcher profile, thesis milestones, and local storage credentials.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className={`p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-sm`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${theme.swatch} flex items-center justify-center text-white text-xl font-bold shadow-md`}>
              {user?.fullName?.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'ST'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-bold ${theme.textPrimary}`}>{user?.fullName || 'Student Researcher'}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${theme.accentBadge}`}>
                  Verified Student
                </span>
              </div>
              <p className={`text-xs ${theme.textMuted} mt-0.5`}>{user?.email || 'student@university.edu'}</p>
              <div className={`text-xs font-semibold ${theme.accentText} mt-1 flex items-center gap-1`}>
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{user?.university || 'Anna University / Department of AI'}</span>
              </div>
            </div>
          </div>

          <div className={`text-left sm:text-right ${theme.cardInner} p-3 rounded-xl border ${theme.borderSubtle}`}>
            <span className={`text-[10px] ${theme.textMuted} uppercase font-bold tracking-wider block`}>Student ID</span>
            <span className={`text-xs font-mono font-bold ${theme.textPrimary}`}>{user?.id || 'usr_1730818200'}</span>
            <div className="text-[10px] text-emerald-500 font-semibold mt-0.5 flex items-center gap-1 sm:justify-end">
              <ShieldCheck className="w-3 h-3" /> Account Active
            </div>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className={`p-3.5 rounded-xl ${theme.cardInner} border ${theme.borderSubtle}`}>
            <span className={`text-[11px] ${theme.textMuted} block`}>Degree Program</span>
            <span className={`text-xs font-bold ${theme.textPrimary} mt-0.5 block`}>B.Tech / M.S. Computer Science</span>
          </div>

          <div className={`p-3.5 rounded-xl ${theme.cardInner} border ${theme.borderSubtle}`}>
            <span className={`text-[11px] ${theme.textMuted} block`}>Academic Year</span>
            <span className={`text-xs font-bold ${theme.textPrimary} mt-0.5 block`}>Final Year (Capstone Cohort)</span>
          </div>

          <div className={`p-3.5 rounded-xl ${theme.cardInner} border ${theme.borderSubtle}`}>
            <span className={`text-[11px] ${theme.textMuted} block`}>Local Storage Folder</span>
            <span className={`text-xs font-mono font-bold ${theme.accentText} mt-0.5 block truncate`}>data/users/</span>
          </div>
        </div>
      </div>

      {/* Capstone Milestone Progress */}
      <div className={`p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-4 shadow-sm`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div>
            <h4 className={`text-sm font-bold ${theme.textPrimary}`}>Final Year Project Milestones</h4>
            <p className={`text-xs ${theme.textMuted}`}>Track critical thesis evaluation dates and committee reviews.</p>
          </div>
          <span className={`text-xs font-bold ${theme.accentText}`}>2 of 5 Completed</span>
        </div>

        <div className="space-y-3">
          {milestones.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl ${theme.cardInner} border ${theme.borderSubtle} flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${m.color}`} />
                  <div>
                    <div className={`text-xs font-semibold ${theme.textPrimary}`}>{m.name}</div>
                    <div className={`text-[10px] ${theme.textMuted}`}>Target: {m.date}</div>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  m.status === 'Completed'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                    : m.status === 'In Progress'
                    ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                    : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                }`}>
                  {m.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
