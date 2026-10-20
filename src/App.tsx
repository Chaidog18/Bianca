import React, { useState, useEffect } from 'react';
import { RomanticWebsiteConfig, TargetSection } from './types/romantic';
import { DEFAULT_ROMANTIC_CONFIG } from './config/defaultConfig';
import { OpeningScreen } from './components/sections/OpeningScreen';
import { MessageScreen } from './components/sections/MessageScreen';
import { QuestionScreen } from './components/sections/QuestionScreen';
import { CelebrationScreen } from './components/sections/CelebrationScreen';
import { LetterScreen } from './components/sections/LetterScreen';
import { FloatingGifsOverlay } from './components/FloatingGifsOverlay';
import { FloatingDecorations } from './components/FloatingDecorations';
import { AudioPlayer } from './components/AudioPlayer';
import { WebsiteEditor } from './components/editor/WebsiteEditor';
import { GitHubModal } from './components/GitHubModal';
import { SlidersHorizontal, Heart, EyeOff, Loader2, Github } from 'lucide-react';
import { sanitizeConfig } from './utils/sanitizeConfig';
import grasslandBg from './assets/images/peaceful_grassland_meadow_1792057141049.jpg';

export default function App() {
  const [config, setConfig] = useState<RomanticWebsiteConfig>(() => sanitizeConfig(DEFAULT_ROMANTIC_CONFIG));
  const [currentSection, setCurrentSection] = useState<TargetSection>('opening');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoadingShared, setIsLoadingShared] = useState(false);
  const [sharedSiteId, setSharedSiteId] = useState<string | null>(null);

  // Check URL parameters on mount (?data=..., ?love=xyz or /love/xyz)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    if (dataParam) {
      try {
        const json = decodeURIComponent(escape(atob(dataParam)));
        const parsed = JSON.parse(json);
        setConfig(sanitizeConfig(parsed));
        return;
      } catch (e) {
        try {
          const parsed = JSON.parse(decodeURIComponent(dataParam));
          setConfig(sanitizeConfig(parsed));
          return;
        } catch (e2) {}
      }
    }

    const loveId = urlParams.get('love');
    const pathMatch = window.location.pathname.match(/\/love\/([a-zA-Z0-9_-]+)/);
    const targetId = loveId || (pathMatch ? pathMatch[1] : null);

    if (targetId) {
      setSharedSiteId(targetId);
      setIsLoadingShared(true);

      // Fetch persisted website config from backend
      fetch(`/api/site/${targetId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Site not found');
          return res.json();
        })
        .then((data) => {
          if (data.success && data.site?.config) {
            setConfig(sanitizeConfig(data.site.config));
          }
        })
        .catch((err) => {
          console.warn('Could not load shared site from backend, checking localStorage:', err);
          const cached = localStorage.getItem(`love_site_${targetId}`);
          if (cached) {
            try {
              setConfig(sanitizeConfig(JSON.parse(cached)));
            } catch (e) {
              console.error('Failed to parse cached site', e);
            }
          }
        })
        .finally(() => {
          setIsLoadingShared(false);
        });
    } else {
      // Check if user has saved draft locally
      const savedDraft = localStorage.getItem('romantic_website_draft');
      if (savedDraft) {
        try {
          setConfig(sanitizeConfig(JSON.parse(savedDraft)));
        } catch (e) {
          console.warn('Could not load local draft', e);
        }
      }
    }
  }, []);

  // Preload upcoming section GIFs for instant 60 FPS transitions without waiting
  useEffect(() => {
    const urlsToPreload: string[] = [];
    if (currentSection === 'opening') {
      urlsToPreload.push(config.personalMessage.gifUrl, config.question.gifUrl);
    } else if (currentSection === 'message') {
      urlsToPreload.push(config.question.gifUrl, config.celebration.gifUrl);
    } else if (currentSection === 'question') {
      urlsToPreload.push(config.celebration.gifUrl, config.letter.gifUrl);
    } else if (currentSection === 'celebration') {
      urlsToPreload.push(config.letter.gifUrl);
    }

    urlsToPreload.forEach((url) => {
      if (url && !url.startsWith('data:')) {
        const img = new Image();
        img.src = url;
      }
    });
  }, [currentSection, config]);

  // Reset to opening screen
  const handleRestart = () => {
    setCurrentSection('opening');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isSharedRecipient = Boolean(sharedSiteId) && !isPreviewMode;

  if (isLoadingShared) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF5FF] text-[#581C87]">
        <div className="flex flex-col items-center gap-3">
          <Heart className="w-10 h-10 fill-[#9333EA] text-[#9333EA] animate-bounce" />
          <p className="font-serif-title text-xl italic flex items-center gap-2">
            <span>Loading something special for you...</span>
            <Loader2 className="w-4 h-4 animate-spin text-[#A855F7]" />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen h-[100dvh] max-h-screen bg-[#FAF5FF] text-[#3B0764] flex flex-col justify-between selection:bg-[#E9D5FF] selection:text-[#581C87] overflow-hidden">
      {/* Peaceful Scenic Grassland Backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Scenic Grassland Hills Gradient Base Layer for instant load */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#E0E7FF] via-[#F3E8FF] to-[#86EFAC]/40" />

        {/* High-fidelity Grassland Meadow Panoramic Wallpaper */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-[1.01]"
          style={{
            backgroundImage: `url(${grasslandBg}), url('/images/grassland.jpg')`,
          }}
        />
        {/* Soft peaceful atmospheric lighting overlay: gentle sun rays & serene violet hue */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF5FF]/30 via-[#FDF4FF]/10 to-[#3B0764]/20 backdrop-blur-[0.5px]" />
        {/* Soft golden sunshine glow in upper-left corner */}
        <div
          className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-gradient-to-br from-amber-200/35 via-yellow-100/15 to-transparent blur-3xl pointer-events-none"
          style={{ animation: 'sunbeamPulse 8s ease-in-out infinite alternate' }}
        />
      </div>

      {/* Background ambient fluttering cute butterflies & gentle violet flower petals & swaying grass */}
      <FloatingDecorations
        enableCursorTrail={config.personalTouches.enableCursorHeartTrail}
      />

      {/* Floating & Decorative GIFs overlay with smooth pointer avoidance */}
      <FloatingGifsOverlay
        gifs={config.floatingGifs}
        currentSection={currentSection}
      />

      {/* Background Romantic Ambient Music Player (Default ON) */}
      <AudioPlayer
        customMusicUrl={config.personalTouches.customMusicUrl}
        enabled={config.personalTouches.enableAmbientMusic}
      />

      {/* Top Bar / Editor trigger */}
      <header className="relative z-30 shrink-0 flex items-center justify-between px-4 sm:px-8 py-2 sm:py-2.5">
        {/* Subtle romantic brand or recipient greeting */}
        <div className="flex items-center gap-2">
          <span className="font-serif-title text-base sm:text-lg font-semibold text-[#6B21A8] tracking-wide">
            {config.personalTouches.recipientName
              ? `for ${config.personalTouches.recipientName} ♡`
              : 'a little love website ♡'}
          </span>
        </div>

        {/* Creator Editor & Preview Controls */}
        <div className="flex items-center gap-2">
          {isPreviewMode && (
            <button
              onClick={() => {
                setIsPreviewMode(false);
                setIsEditorOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6B21A8] bg-[#EDE9FE] rounded-full border border-[#DDD6FE] hover:bg-[#E9D5FF] transition-all cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Exit Preview</span>
            </button>
          )}

          {(!isSharedRecipient || isPreviewMode) && (
            <button
              onClick={() => setIsEditorOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#6B21A8] bg-white/95 backdrop-blur-md rounded-full shadow-xs border border-[#DDD6FE] hover:bg-[#FAF5FF] hover:text-[#9333EA] hover:shadow transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#9333EA]" />
              <span>Personalize & Share ♡</span>
            </button>
          )}

          <button
            onClick={() => setIsGitHubModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#3B0764] bg-white/95 backdrop-blur-md rounded-full shadow-xs border border-[#DDD6FE] hover:bg-[#FAF5FF] hover:border-[#C084FC] hover:shadow transition-all cursor-pointer"
            title="Upload code to GitHub or Download .ZIP"
          >
            <Github className="w-3.5 h-3.5 text-[#3B0764]" />
            <span className="hidden sm:inline">GitHub / Export</span>
          </button>
        </div>
      </header>

      {/* Main Interactive Romantic Journey with smooth enter transitions */}
      <main className="relative flex-1 min-h-0 flex flex-col justify-center items-center px-2 sm:px-4 py-1 z-10 overflow-hidden">
        <div key={currentSection} className="w-full max-h-full flex flex-col items-center justify-center animate-slideUpFade">
          {currentSection === 'opening' && (
            <OpeningScreen
              config={config.opening}
              personalTouches={config.personalTouches}
              onNext={() => {
                setCurrentSection('message');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {currentSection === 'message' && (
            <MessageScreen
              config={config.personalMessage}
              personalTouches={config.personalTouches}
              onNext={() => {
                setCurrentSection('question');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onBack={() => {
                setCurrentSection('opening');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {currentSection === 'question' && (
            <QuestionScreen
              config={config.question}
              personalTouches={config.personalTouches}
              onYes={() => {
                setCurrentSection('celebration');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onLetterDirect={() => {
                setCurrentSection('letter');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {currentSection === 'celebration' && (
            <CelebrationScreen
              config={config.celebration}
              personalTouches={config.personalTouches}
              onNext={() => {
                setCurrentSection('letter');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {currentSection === 'letter' && (
            <LetterScreen
              config={config.letter}
              personalTouches={config.personalTouches}
              onRestart={handleRestart}
            />
          )}
        </div>
      </main>

      {/* Website Editor Modal */}
      {isEditorOpen && (
        <WebsiteEditor
          config={config}
          onChange={setConfig}
          onClose={() => setIsEditorOpen(false)}
          onPreviewShared={() => {
            setIsEditorOpen(false);
            setIsPreviewMode(true);
            setCurrentSection('opening');
          }}
        />
      )}

      {/* GitHub & Project Export Modal */}
      <GitHubModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />
    </div>
  );
}
