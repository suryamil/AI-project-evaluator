import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Send,
  Bot,
  User,
  RotateCcw,
  Sparkles,
  Lightbulb,
  Code2,
  Wrench,
  AlertTriangle,
  Check,
  Copy,
  ChevronRight,
  FolderGit2
} from 'lucide-react';
import {
  getProjectChatAPI,
  sendProjectChatMessageAPI,
  clearProjectChatAPI
} from '../../services/api';

const QUICK_PROMPTS = [
  {
    icon: Lightbulb,
    label: 'Suggest Features',
    text: 'What innovative and high-value features do you suggest to elevate this project beyond standard tutorial clones?'
  },
  {
    icon: Wrench,
    label: 'Recommend Tech',
    text: 'What modern libraries, frameworks, APIs, and databases do you recommend for optimal performance in this project?'
  },
  {
    icon: Code2,
    label: 'Explain Concepts',
    text: 'Can you explain the core architectural and ML programming concepts needed for this system with concise code snippets?'
  },
  {
    icon: AlertTriangle,
    label: 'Resolve Bottlenecks',
    text: 'How can I prevent and resolve implementation difficulties like memory bottlenecks, latency spikes, or integration errors?'
  }
];

export default function ProjectAssistantChat({ activeProject, allProjects = [] }) {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(
    activeProject?.id || (allProjects.length > 0 ? allProjects[0].id : 'proj_demo')
  );
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  // Sync selected project if activeProject changes from parent
  useEffect(() => {
    if (activeProject?.id && activeProject.id !== selectedProjectId) {
      setSelectedProjectId(activeProject.id);
    }
  }, [activeProject?.id]);

  // Load chat history when selected project changes
  useEffect(() => {
    loadChatHistory();
  }, [selectedProjectId]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadChatHistory = async () => {
    try {
      const res = await getProjectChatAPI(selectedProjectId);
      if (res?.chat?.messages) {
        setMessages(res.chat.messages);
      }
    } catch (err) {
      console.warn('Could not load chat history, fallback to initial greeting', err);
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I am your AI Project Assistant. I am ready to help you architect, code, and debug **${activeProject?.title || 'your AI project'}**.\n\nAsk me to **explain programming concepts**, **suggest new features**, **recommend modern libraries**, or **troubleshoot implementation bottlenecks**!`
        }
      ]);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    const optimisticMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, optimisticMsg]);
    setIsLoading(true);

    try {
      const res = await sendProjectChatMessageAPI(selectedProjectId, text);
      if (res?.chat?.messages) {
        setMessages(res.chat.messages);
      } else if (res?.reply) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.reply, timestamp: new Date().toISOString() }
        ]);
      }
    } catch (err) {
      console.error('Failed to send message', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ I encountered an error communicating with the advisor service. Please verify your connection or retry in a moment.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Reset conversation history for this project?')) return;
    try {
      const res = await clearProjectChatAPI(selectedProjectId);
      if (res?.chat?.messages) {
        setMessages(res.chat.messages);
      } else {
        setMessages([
          {
            role: 'assistant',
            content: 'Conversation history reset. How can I assist you with your project today?'
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to clear chat', err);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to render basic markdown formatting, lists, and code blocks
  const renderFormattedMessage = (content, msgIdx) => {
    if (!content) return null;

    // Check if content has code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, pIdx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : '';
        const code = lang ? lines.slice(1).join('\n') : lines.join('\n');
        const blockKey = `code_${msgIdx}_${pIdx}`;

        return (
          <div key={pIdx} className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-[#090D16]">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-800/60 border-b border-slate-700/60 text-[11px] text-slate-400 font-mono">
              <span>{lang || 'code'}</span>
              <button
                onClick={() => copyToClipboard(code, blockKey)}
                className="flex items-center gap-1 hover:text-white transition cursor-pointer"
              >
                {copiedIndex === blockKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === blockKey ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3.5 text-xs font-mono overflow-x-auto text-emerald-300 leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Format headers, bold text, and bullet points
      const lines = part.split('\n');
      return (
        <div key={pIdx} className="space-y-1.5">
          {lines.map((line, lIdx) => {
            if (line.startsWith('### ')) {
              return (
                <h4 key={lIdx} className="text-sm font-bold text-white pt-2 pb-1 border-b border-slate-700/50">
                  {line.replace('### ', '')}
                </h4>
              );
            }
            if (line.startsWith('## ')) {
              return (
                <h3 key={lIdx} className="text-base font-extrabold text-white pt-2.5 pb-1">
                  {line.replace('## ', '')}
                </h3>
              );
            }
            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
              return (
                <div key={lIdx} className="flex items-start gap-2 pl-2 text-xs leading-relaxed">
                  <span className="text-blue-400 font-bold mt-0.5">•</span>
                  <span>{formatInlineMarkdown(line.replace(/^[-*]\s+/, ''))}</span>
                </div>
              );
            }
            if (/^\d+\.\s/.test(line.trim())) {
              const num = line.match(/^(\d+)\.\s/)[1];
              return (
                <div key={lIdx} className="flex items-start gap-2 pl-2 text-xs leading-relaxed">
                  <span className="text-blue-400 font-bold font-mono mt-0.5">{num}.</span>
                  <span>{formatInlineMarkdown(line.replace(/^\d+\.\s+/, ''))}</span>
                </div>
              );
            }
            if (!line.trim()) {
              return <div key={lIdx} className="h-1.5" />;
            }
            return (
              <p key={lIdx} className="text-xs leading-relaxed">
                {formatInlineMarkdown(line)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  const formatInlineMarkdown = (text) => {
    // Basic bold and inline code renderer
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((segment, sIdx) => {
      if (segment.startsWith('**') && segment.endsWith('**')) {
        return <strong key={sIdx} className="font-bold text-white">{segment.slice(2, -2)}</strong>;
      }
      if (segment.startsWith('`') && segment.endsWith('`')) {
        return <code key={sIdx} className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 font-mono text-[11px]">{segment.slice(1, -1)}</code>;
      }
      return segment;
    });
  };

  const currentProject = allProjects.find((p) => p.id === selectedProjectId) || activeProject;

  return (
    <div className={`rounded-2xl border ${theme.cardBorder} ${theme.cardBg} flex flex-col h-[calc(100vh-140px)] min-h-[520px] sm:h-[750px] shadow-2xl overflow-hidden`}>
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className={`p-4 sm:p-5 border-b ${theme.borderSubtle} ${theme.cardInner} flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-extrabold text-white">AI Project Assistant</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini Interactive
              </span>
            </div>
            <p className={`text-xs ${theme.textMuted} truncate max-w-md`}>
              Technical lead &amp; architecture advisor for {currentProject?.title || 'your AI Project'}
            </p>
          </div>
        </div>

        {/* Project Selector & Clear History */}
        <div className="flex items-center gap-2">
          {allProjects.length > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700/60 text-xs">
              <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer max-w-[150px] truncate"
              >
                {allProjects.map((proj) => (
                  <option key={proj.id} value={proj.id} className="bg-slate-900 text-white">
                    {proj.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleClearHistory}
            title="Reset conversation history"
            className={`p-2 rounded-xl border ${theme.borderSubtle} ${theme.cardBg} ${theme.textSecondary} hover:${theme.textPrimary} hover:bg-slate-800 transition cursor-pointer text-xs flex items-center gap-1.5`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Chat</span>
          </button>
        </div>
      </div>

      {/* ── QUICK PROMPTS CHIPS BAR ───────────────────────────────────────── */}
      <div className={`px-4 py-2.5 border-b ${theme.borderSubtle} bg-slate-950/40 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none`}>
        <span className={`text-[11px] font-bold uppercase tracking-wider ${theme.textMuted} shrink-0 flex items-center gap-1`}>
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span>Quick Ask:</span>
        </span>
        {QUICK_PROMPTS.map((qp, idx) => {
          const Icon = qp.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.text)}
              disabled={isLoading}
              className={`shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-700/60 bg-slate-800/40 ${theme.textSecondary} hover:${theme.textPrimary} hover:border-blue-500/50 hover:bg-blue-500/10 transition cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50`}
            >
              <Icon className="w-3 h-3 text-blue-400" />
              <span>{qp.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── CHAT MESSAGES STREAM ─────────────────────────────────────────── */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in duration-300`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                  isUser
                    ? 'bg-blue-600 shadow-sm'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-sm'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-sm ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : `${theme.cardInner} border ${theme.borderSubtle} ${theme.textPrimary} rounded-tl-none`
                }`}
              >
                <div className="flex items-center justify-between gap-4 pb-1.5 mb-1.5 border-b border-white/10 text-[10px] opacity-75">
                  <span className="font-bold tracking-wider uppercase">
                    {isUser ? 'You (Student)' : 'AI Project Assistant'}
                  </span>
                  <span>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                </div>

                <div className="space-y-1">
                  {isUser ? (
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    renderFormattedMessage(msg.content, idx)
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 animate-in fade-in">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className={`p-4 rounded-2xl rounded-tl-none ${theme.cardInner} border ${theme.borderSubtle} flex items-center gap-2 text-xs text-slate-400`}>
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>Analyzing architecture and formulating recommendations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── INPUT BAR ────────────────────────────────────────────────────── */}
      <div className={`p-3 sm:p-4 border-t ${theme.borderSubtle} ${theme.cardInner} shrink-0`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about architecture, concepts, features, technologies, or debug errors..."
            disabled={isLoading}
            className={`flex-1 px-4 py-3 rounded-xl text-xs sm:text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              theme.isLight
                ? 'bg-slate-100 border border-slate-300 text-slate-900 focus:bg-white'
                : 'bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500'
            }`}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shrink-0 shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}