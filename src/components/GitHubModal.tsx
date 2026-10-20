import React, { useState } from 'react';
import {
  X,
  Github,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Lock,
  GitBranch,
  Terminal,
} from 'lucide-react';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ isOpen, onClose }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{
    success: boolean;
    message?: string;
    repoUrl?: string;
    error?: string;
  } | null>(null);

  const [copiedCommands, setCopiedCommands] = useState(false);

  if (!isOpen) return null;

  const handlePush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim() || !token.trim()) {
      setPushResult({
        success: false,
        error: 'Please enter both your GitHub Repository URL and Personal Access Token.',
      });
      return;
    }

    setIsPushing(true);
    setPushResult(null);

    try {
      const res = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: repoUrl.trim(),
          token: token.trim(),
          branch: 'main',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPushResult({
          success: true,
          message: data.message || 'Successfully uploaded to GitHub!',
          repoUrl: data.repoUrl,
        });
      } else {
        setPushResult({
          success: false,
          error: data.error || 'Failed to push to GitHub. Please check your credentials.',
        });
      }
    } catch (err: any) {
      setPushResult({
        success: false,
        error: err.message || 'Network error while attempting to push to GitHub.',
      });
    } finally {
      setIsPushing(false);
    }
  };

  const gitCommands = `# If you are using your own terminal:
git remote add origin ${repoUrl.trim() || 'https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git'}
git branch -M main
git push -u origin main`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedCommands(true);
    setTimeout(() => setCopiedCommands(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-xl bg-white/98 backdrop-blur-md rounded-3xl shadow-2xl border border-[#DDD6FE] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#F3E8FF] flex items-center justify-between bg-gradient-to-r from-[#FAF5FF] to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#3B0764] flex items-center justify-center text-white shadow-xs">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#3B0764]">
                Upload to GitHub
              </h2>
              <p className="text-xs text-[#7E22CE]">
                Git repository ready on <span className="font-mono font-semibold">main</span> branch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#7E22CE] hover:text-[#3B0764] hover:bg-[#F3E8FF] transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Status Badge */}
          <div className="p-3 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-[#581C87]">
              <GitBranch className="w-4 h-4 text-[#9333EA]" />
              <span>Repository initialized & committed (All files included)</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
              Ready to Push
            </span>
          </div>

          {/* Option 1: Direct Push via Form */}
          <div className="p-4 rounded-2xl bg-white border border-[#E9D5FF] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#3B0764] font-semibold text-sm">
                <UploadCloud className="w-4 h-4 text-[#9333EA]" />
                <span>Method 1: Direct Push from Browser</span>
              </div>
              <span className="text-[11px] text-[#7E22CE] bg-[#F3E8FF] px-2 py-0.5 rounded-full font-medium">
                Automatic
              </span>
            </div>

            <form onSubmit={handlePush} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#581C87] mb-1">
                  GitHub Repository URL
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/your-username/romantic-proposal"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDD6FE] focus:outline-none focus:ring-2 focus:ring-[#9333EA] focus:border-transparent bg-[#FAF5FF]/50"
                  disabled={isPushing}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-[#581C87]">
                    GitHub Personal Access Token (PAT)
                  </label>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=Romantic%20Proposal%20App"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#9333EA] hover:underline flex items-center gap-1"
                  >
                    <span>Get token</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDD6FE] focus:outline-none focus:ring-2 focus:ring-[#9333EA] focus:border-transparent bg-[#FAF5FF]/50 pr-16"
                    disabled={isPushing}
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#7E22CE] hover:text-[#3B0764] cursor-pointer"
                  >
                    {showToken ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-[11px] text-[#86198F] mt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 shrink-0" />
                  <span>Token is used only once to push and is never saved.</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isPushing}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-[#7E22CE] to-[#9333EA] hover:from-[#6B21A8] hover:to-[#7E22CE] active:scale-[0.99] transition-all shadow-md shadow-[#9333EA]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPushing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Pushing code to GitHub...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload & Push to GitHub</span>
                  </>
                )}
              </button>
            </form>

            {/* Push Feedback Banner */}
            {pushResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                  pushResult.success
                    ? 'bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534]'
                    : 'bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]'
                }`}
              >
                {pushResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#22C55E] mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">
                    {pushResult.success ? 'Upload Complete!' : 'Upload Failed'}
                  </p>
                  <p className="mt-0.5">{pushResult.message || pushResult.error}</p>
                  {pushResult.repoUrl && (
                    <a
                      href={pushResult.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#15803D] underline"
                    >
                      <span>View your repository on GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Option 2: One-click ZIP Download */}
          <div className="p-4 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-[#3B0764] font-semibold text-xs sm:text-sm">
                <Download className="w-4 h-4 text-[#9333EA]" />
                <span>Method 2: Download Full Project (.ZIP)</span>
              </div>
              <p className="text-[11px] text-[#6B21A8]">
                Download a clean archive ready to drag & drop into GitHub or deploy to Vercel.
              </p>
            </div>
            <a
              href="/api/download-zip"
              download="romantic-proposal-website.zip"
              className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#581C87] bg-white border border-[#DDD6FE] hover:bg-[#F3E8FF] shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .ZIP</span>
            </a>
          </div>

          {/* Option 3: Terminal Commands */}
          <div className="p-4 rounded-2xl bg-white border border-[#E9D5FF] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#3B0764] font-semibold text-xs">
                <Terminal className="w-3.5 h-3.5 text-[#9333EA]" />
                <span>Method 3: Terminal Git Commands</span>
              </div>
              <button
                type="button"
                onClick={copyToClipboard}
                className="text-[11px] text-[#7E22CE] hover:text-[#3B0764] flex items-center gap-1 cursor-pointer font-medium"
              >
                {copiedCommands ? (
                  <>
                    <Check className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy commands</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-2.5 rounded-xl bg-[#1E1B4B] text-[#E0E7FF] text-[11px] font-mono overflow-x-auto leading-relaxed">
              {gitCommands}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#F3E8FF] bg-[#FAF5FF] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-medium text-[#581C87] hover:bg-[#EDE9FE] transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
