import React, { useState, useRef, useEffect } from 'react';
import {
  RomanticWebsiteConfig,
  FloatingGifConfig,
  GifDisplayMode,
  TargetSection,
  AnimationSpeed,
  NoButtonStyle,
} from '../../types/romantic';
import { CuteGif } from '../CuteGif';
import {
  Upload,
  Trash2,
  Share2,
  Copy,
  Check,
  Eye,
  RotateCcw,
  Plus,
  Sliders,
  Type,
  Heart,
  ExternalLink,
  Save,
  Clock,
  Calendar,
  X,
  FileImage,
  HelpCircle,
  Undo2,
  Sparkles,
} from 'lucide-react';
import { DEFAULT_ROMANTIC_CONFIG } from '../../config/defaultConfig';

interface WebsiteEditorProps {
  config: RomanticWebsiteConfig;
  onChange: (newConfig: RomanticWebsiteConfig) => void;
  onClose: () => void;
  onPreviewShared: () => void;
}

export const WebsiteEditor: React.FC<WebsiteEditorProps> = ({
  config,
  onChange,
  onClose,
  onPreviewShared,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'noBehavior' | 'gifs' | 'personal'>('text');
  const [selectedGifId, setSelectedGifId] = useState<string>(
    config.floatingGifs[0]?.id || ''
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Draft Save / Restore state
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Share state
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<{
    id: string;
    shareUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [newGifUrl, setNewGifUrl] = useState('');
  const [newGifName, setNewGifName] = useState('');

  const cutePresets = [
    { name: 'Cat Cuddles', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGJ0MWxwdWFzMG5oY3hpZzF5dXBzNTl2bmZ5b2w0ZzM5d3RscWRraCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/MDJ9IbxxvDUQM/giphy.gif' },
    { name: 'Shy Blushing Kitten', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOW82Z3RhN2R0NGhhZ20xdjZiaDlzNzVveWFudmh2d2tzbTN1MHFpciZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ICOgUNjpvO0PC/giphy.gif' },
    { name: 'Bunny Love Hug', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzF2OXF1eWtpYm9tcjgyc2t6YTBxdWZzNWJ1NndvbnJ6bm42ZGlkdyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/uw0KqTWZPAHuE/giphy.gif' },
    { name: 'Happy Dancing Bears', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZDV4eTV3MzYxNnFpdmE0cWNod3pkdjl0c2Fxb2M5bmhpZXhhb2p1NSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3oz8xAFtqoOUUrsh7W/giphy.gif' },
    { name: 'Blowing Kisses', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTI1Z2g4YjhyejI4dGV0MWJocWVmaTZnbTZ2YW8xdGphajU4dG1scyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/111ebonMs90YLu/giphy.gif' },
    { name: 'Playful Kitten Wiggle', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMHhpOXJpNm85M3p6Z2F3eG5tdW12cnR0OHF3N3kyc2pva2F2c29xNiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/yFQ0ywZVQKI6I/giphy.gif' },
    { name: 'Puppy Eyes Bear', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjR6ZnF2NnA3OXp1OXh1NHJqMnJ3cnhjc2Q1d3Zzd3U3MGpsNDV6YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/TqPkvlZq8k4xW/giphy.gif' },
    { name: 'Head Pat Love', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzh6d2k0M2RzbzUzbWptbThpMnEzbmg4d3phMmF6a2FudnZ6bWh3diZlcD12MV9naWZzX3NlYXJjaCZjdD1n/5tmRHwTlHAA9WvKBDZ/giphy.gif' },
    { name: 'Snuggle in Blanket', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHIyb2s4Y2VsdG13dnFudjF6NHd5eW5ldDFkOGJ1MWg4bGN0Y3RyeCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/L2x1VvL4bT5N6/giphy.gif' },
    { name: 'Sweet Forehead Kiss', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZhcTJjcXJpZnlxb2JxdWlyNmZtZ3B2bzhyZzdwYmE0bnRzMHJ4biZlcD12MV9naWZzX3NlYXJjaCZjdD1n/G3va31oEEnIkM/giphy.gif' },
    { name: 'Starry Night Together', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjhzcGtndWpsNWNreG1vZWJ5aTZxZnNuN3g1N2txZmsxeTJqd3JpayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/26FLdmIp6wJr91JAI/giphy.gif' },
    { name: 'Heart Sparkle Flutter', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWZ5ZWU3NTVxMnN5bHBqYXExYWpqMWd5MnVwNHR2OTB5c3E3eGx5ayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l4FGpP4lxGGgMqS5O/giphy.gif' },
  ];

  const handleAddGif = (url?: string, name?: string) => {
    const targetUrl = url || newGifUrl.trim();
    if (!targetUrl) return;

    const newGif: FloatingGifConfig = {
      id: `gif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name || newGifName.trim() || 'Cute Romance GIF',
      url: targetUrl,
      displayMode: 'floating',
      size: 95,
      opacity: 0.9,
      speed: 'normal',
      direction: 'drift',
      rotation: Math.round((Math.random() - 0.5) * 16),
      customPosition: {
        x: Math.round(15 + Math.random() * 70),
        y: Math.round(15 + Math.random() * 70),
      },
      frequency: 'continuous',
      targetSection: 'all',
      isClickable: true,
      visible: true,
    };

    const updated = [...config.floatingGifs, newGif];
    onChange({ ...config, floatingGifs: updated });
    setSelectedGifId(newGif.id);
    setNewGifUrl('');
    setNewGifName('');
    setSaveSuccessNotice('Added GIF successfully! You can add as many as you want ♡');
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  const handleAddAllPresets = () => {
    const newItems: FloatingGifConfig[] = cutePresets.map((p, idx) => ({
      id: `preset-${Date.now()}-${idx}`,
      name: p.name,
      url: p.url,
      displayMode: 'floating',
      size: 90,
      opacity: 0.9,
      speed: 'normal',
      direction: 'drift',
      rotation: Math.round((Math.random() - 0.5) * 16),
      customPosition: {
        x: Math.round(10 + Math.random() * 80),
        y: Math.round(10 + Math.random() * 80),
      },
      frequency: 'continuous',
      targetSection: 'all',
      isClickable: true,
      visible: true,
    }));
    onChange({ ...config, floatingGifs: [...config.floatingGifs, ...newItems] });
    setSaveSuccessNotice(`Added ${newItems.length} cute presets! You can add unlimited GIFs ♡`);
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check if saved draft exists in localStorage
  useEffect(() => {
    const existing = localStorage.getItem('romantic_website_draft');
    if (existing) {
      setHasSavedDraft(true);
    }
  }, []);

  const selectedGif = config.floatingGifs.find((g) => g.id === selectedGifId);

  // 1. Save Changes Draft locally
  const handleSaveDraft = () => {
    const draftConfig = { ...config, lastSaved: new Date().toISOString() };
    localStorage.setItem('romantic_website_draft', JSON.stringify(draftConfig));
    onChange(draftConfig);
    setHasSavedDraft(true);
    setSaveSuccessNotice('All your custom messages and settings have been saved! ♡');
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  // 2. Restore Previously Saved Content
  const handleRestoreDraft = () => {
    const saved = localStorage.getItem('romantic_website_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        onChange(parsed);
        setSaveSuccessNotice('Restored your previously saved content successfully! ✨');
        setTimeout(() => setSaveSuccessNotice(null), 3000);
      } catch (e) {
        console.error('Error parsing draft:', e);
      }
    }
  };

  // 3. Reset to default
  const resetToDefault = () => {
    if (window.confirm('Reset all romantic texts, GIFs, and animations back to default?')) {
      onChange(JSON.parse(JSON.stringify(DEFAULT_ROMANTIC_CONFIG)));
      setSelectedGifId(DEFAULT_ROMANTIC_CONFIG.floatingGifs[0]?.id || '');
      setSaveSuccessNotice('Reset to default template ♡');
      setTimeout(() => setSaveSuccessNotice(null), 2500);
    }
  };

  // 4. Handle file upload (converts to base64 and uploads to backend /api/upload)
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    const allowedTypes = ['image/gif', 'image/png', 'image/jpeg', 'image/webp'];
    const newGifs: FloatingGifConfig[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!allowedTypes.includes(file.type)) {
        setUploadError(`"${file.name}" is not supported. Please use GIF, PNG, JPG, or WebP.`);
        continue;
      }

      if (file.size > 15 * 1024 * 1024) {
        setUploadError(`"${file.name}" exceeds the 15MB limit.`);
        continue;
      }

      try {
        const base64 = await readFileAsBase64(file);
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            dataUrl: base64,
          }),
        });

        const result = await response.json();
        const assetUrl = result.success ? result.url : base64;

        const newGif: FloatingGifConfig = {
          id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          url: assetUrl,
          displayMode: 'floating',
          size: 100,
          opacity: 0.9,
          speed: 'normal',
          direction: 'drift',
          rotation: 0,
          customPosition: { x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 },
          frequency: 'continuous',
          targetSection: 'all',
          isClickable: true,
          visible: true,
        };

        newGifs.push(newGif);
      } catch (err: any) {
        console.error('File read error:', err);
        setUploadError('Failed to process image: ' + (err.message || 'Unknown error'));
      }
    }

    if (newGifs.length > 0) {
      const updated = [...config.floatingGifs, ...newGifs];
      onChange({ ...config, floatingGifs: updated });
      setSelectedGifId(newGifs[0].id);
    }
    setIsUploading(false);
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const updateSelectedGif = (updates: Partial<FloatingGifConfig>) => {
    if (!selectedGifId) return;
    const updated = config.floatingGifs.map((g) =>
      g.id === selectedGifId ? { ...g, ...updates } : g
    );
    onChange({ ...config, floatingGifs: updated });
  };

  const removeGif = (id: string) => {
    const updated = config.floatingGifs.filter((g) => g.id !== id);
    onChange({ ...config, floatingGifs: updated });
    if (selectedGifId === id) {
      setSelectedGifId(updated[0]?.id || '');
    }
  };

  // 5. Share website to persistent backend
  const handleShareWebsite = async () => {
    setIsSharing(true);
    setUploadError(null);
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      const data = await response.json();
      if (data.success) {
        const origin = window.location.origin;
        const finalUrl = `${origin}/?love=${data.id}`;
        setShareResult({
          id: data.id,
          shareUrl: finalUrl,
        });
      } else {
        setUploadError('Failed to save website: ' + data.error);
      }
    } catch (err: any) {
      console.error('Share error:', err);
      const localId = `love-${Math.random().toString(36).substr(2, 6)}`;
      localStorage.setItem(`love_site_${localId}`, JSON.stringify(config));
      setShareResult({
        id: localId,
        shareUrl: `${window.location.origin}/?love=${localId}`,
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareResult) return;
    navigator.clipboard.writeText(shareResult.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Letter paragraph text joined for big textarea
  const letterParagraphsJoined = config.letter.paragraphs.join('\n\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#DDD6FE] max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9D5FF] bg-[#FAF5FF]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED]">
              <Heart className="w-4 h-4 fill-[#9333EA] text-[#9333EA]" />
            </div>
            <div>
              <h2 className="font-serif-title text-xl font-bold text-[#3B0764]">
                Personalize Your Love Website ♡
              </h2>
              <p className="text-xs text-[#7E22CE]">
                Customize your messages, add unlimited GIFs, configure dates & generate your share link
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#6B21A8] bg-[#EDE9FE] hover:bg-[#DDD6FE] rounded-full transition-all cursor-pointer"
              title="Save draft to browser storage"
            >
              <Save className="w-3.5 h-3.5 text-[#9333EA]" />
              <span>Save draft</span>
            </button>

            <button
              onClick={handleShareWebsite}
              disabled={isSharing}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#A855F7] via-[#9333EA] to-[#7E22CE] rounded-full shadow-sm hover:shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isSharing ? 'Saving...' : 'Share my website ♡'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-[#7E22CE] hover:text-[#3B0764] p-1.5 rounded-full hover:bg-[#EDE9FE] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success toast notification */}
        {saveSuccessNotice && (
          <div className="px-6 py-2 bg-[#F3E8FF] border-b border-[#DDD6FE] text-[#6B21A8] text-xs font-medium flex items-center justify-between animate-fadeIn">
            <span>{saveSuccessNotice}</span>
            <button onClick={() => setSaveSuccessNotice(null)} className="text-[#6B21A8] hover:opacity-75 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E9D5FF] px-6 bg-white gap-3 sm:gap-4 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('text')}
            className={`py-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'border-[#9333EA] text-[#6B21A8] font-semibold'
                : 'border-transparent text-[#7E22CE]/70 hover:text-[#6B21A8]'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Romantic Messages & Letter</span>
          </button>

          <button
            onClick={() => setActiveTab('noBehavior')}
            className={`py-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'noBehavior'
                ? 'border-[#9333EA] text-[#6B21A8] font-semibold'
                : 'border-transparent text-[#7E22CE]/70 hover:text-[#6B21A8]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>NO Button Behavior</span>
          </button>

          <button
            onClick={() => setActiveTab('gifs')}
            className={`py-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'gifs'
                ? 'border-[#9333EA] text-[#6B21A8] font-semibold'
                : 'border-transparent text-[#7E22CE]/70 hover:text-[#6B21A8]'
            }`}
          >
            <FileImage className="w-4 h-4" />
            <span>Cute GIFs & Images ♡ ({config.floatingGifs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('personal')}
            className={`py-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'personal'
                ? 'border-[#9333EA] text-[#6B21A8] font-semibold'
                : 'border-transparent text-[#7E22CE]/70 hover:text-[#6B21A8]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Dates & Monthsary Settings</span>
          </button>
        </div>


        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: ALL ROMANTIC MESSAGES & LOVE LETTER */}
          {activeTab === 'text' && (
            <div className="space-y-6">
              {/* Top toolbar */}
              <div className="flex items-center justify-between pb-2 border-b border-[#FFE4EB]">
                <span className="text-xs text-[#7D4F5E]">
                  Edits update live in real-time as you type! ♡
                </span>
                <div className="flex items-center gap-2">
                  {hasSavedDraft && (
                    <button
                      onClick={handleRestoreDraft}
                      className="inline-flex items-center gap-1 text-[11px] text-[#FF4D6D] hover:underline"
                    >
                      <Undo2 className="w-3 h-3" />
                      <span>Restore saved draft</span>
                    </button>
                  )}
                  <button
                    onClick={resetToDefault}
                    className="inline-flex items-center gap-1 text-[11px] text-[#9C7A87] hover:text-[#B33951]"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to default</span>
                  </button>
                </div>
              </div>

              {/* 1. Opening Greeting & 2. Subtitles */}
              <div className="p-4 bg-[#FFF8FA] rounded-2xl border border-[#FFD9E2] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B263E]">
                  1. Opening Screen Messages
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-xs text-[#7D4F5E] mb-1">
                      <span>Opening Greeting</span>
                      <span className="text-[10px] text-gray-400">{config.opening.greeting.length}/40</span>
                    </div>
                    <input
                      type="text"
                      maxLength={40}
                      value={config.opening.greeting}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          opening: { ...config.opening, greeting: e.target.value },
                        })
                      }
                      className="w-full text-xs p-2 bg-white rounded-xl border border-[#FFCAD4]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-[#7D4F5E] mb-1">
                      <span>Intro Button Text</span>
                      <span className="text-[10px] text-gray-400">{config.opening.buttonText.length}/30</span>
                    </div>
                    <input
                      type="text"
                      maxLength={30}
                      value={config.opening.buttonText}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          opening: { ...config.opening, buttonText: e.target.value },
                        })
                      }
                      className="w-full text-xs p-2 bg-white rounded-xl border border-[#FFCAD4]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs text-[#7D4F5E]">Introductory Line 1</label>
                    <input
                      type="text"
                      value={config.opening.subtitle1}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          opening: { ...config.opening, subtitle1: e.target.value },
                        })
                      }
                      className="w-full text-xs p-2 bg-white rounded-xl border border-[#FFCAD4]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#7D4F5E]">Introductory Line 2</label>
                    <input
                      type="text"
                      value={config.opening.subtitle2}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          opening: { ...config.opening, subtitle2: e.target.value },
                        })
                      }
                      className="w-full text-xs p-2 bg-white rounded-xl border border-[#FFCAD4]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Message Before Main Question */}
              <div className="p-4 bg-[#FFF8FA] rounded-2xl border border-[#FFD9E2] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B263E]">
                    3. Personal Message Lines (Before Question)
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    {config.personalMessage.lines.length} lines
                  </span>
                </div>
                {config.personalMessage.lines.map((line, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={line}
                      onChange={(e) => {
                        const newLines = [...config.personalMessage.lines];
                        newLines[idx] = e.target.value;
                        onChange({
                          ...config,
                          personalMessage: { ...config.personalMessage, lines: newLines },
                        });
                      }}
                      className="w-full text-xs p-2 bg-white rounded-xl border border-[#FFCAD4]"
                    />
                  </div>
                ))}
              </div>

              {/* 4. The Main Question & 5/6 Buttons */}
              <div className="p-4 bg-[#FFF8FA] rounded-2xl border border-[#FFD9E2] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B263E]">
                  4. The Main Question & Button Labels
                </h4>
                <div>
                  <div className="flex justify-between text-xs text-[#7D4F5E] mb-1">
                    <span>Main Question Heading</span>
                    <span className="text-[10px] text-gray-400">{config.question.questionText.length}/60</span>
                  </div>
                  <input
                    type="text"
                    maxLength={60}
                    value={config.question.questionText}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        question: { ...config.question, questionText: e.target.value },
                      })
                    }
                    className="w-full text-xs p-2.5 bg-white rounded-xl border border-[#FFCAD4] font-serif-title text-base"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#7D4F5E]">Sub-Text Under Question</label>
                  <input
                    type="text"
                    value={config.question.subText}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        question: { ...config.question, subText: e.target.value },
                      })
                    }
                    className="w-full text-xs p-2 bg-white rounded-xl border border-[#FFCAD4]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs text-[#7D4F5E]">5. YES Button Text</label>
                    <input
                      type="text"
                      value={config.question.yesButtonText}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          question: { ...config.question, yesButtonText: e.target.value },
                        })
                      }
                      className="w-full text-xs p-2 bg-white rounded-xl border border-[#FFCAD4]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#7D4F5E]">6. NO Button Text</label>
                    <input
                      type="text"
                      value={config.question.noButtonText}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          question: { ...config.question, noButtonText: e.target.value },
                        })
                      }
                      className="w-full text-xs p-2 bg-white rounded-xl border border-[#FFCAD4]"
                    />
                  </div>
                </div>
              </div>

              {/* 9/10. Message Shown After YES & Celebration */}
              <div className="p-4 bg-[#FFF8FA] rounded-2xl border border-[#FFD9E2] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B263E]">
                  9 & 10. Celebration Screen Messages
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#7D4F5E]">Celebration Heading</label>
                    <input
                      type="text"
                      value={config.celebration.title}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          celebration: { ...config.celebration, title: e.target.value },
                        })
                      }
                      className="w-full text-xs p-2 bg-white rounded-xl border border-[#FFCAD4]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#7D4F5E]">Big Happy Quote</label>
                    <input
                      type="text"
                      value={config.celebration.happyText}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          celebration: { ...config.celebration, happyText: e.target.value },
                        })
                      }
                      className="w-full text-xs p-2 bg-white rounded-xl border border-[#FFCAD4]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs text-[#7D4F5E]">Subtitle 1</label>
                    <input
                      type="text"
                      value={config.celebration.subtitle1}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          celebration: { ...config.celebration, subtitle1: e.target.value },
                        })
                      }
                      className="w-full text-xs p-2 bg-white rounded-xl border border-[#FFCAD4]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#7D4F5E]">Subtitle 2</label>
                    <input
                      type="text"
                      value={config.celebration.subtitle2}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          celebration: { ...config.celebration, subtitle2: e.target.value },
                        })
                      }
                      className="w-full text-xs p-2 bg-white rounded-xl border border-[#FFCAD4]"
                    />
                  </div>
                </div>
              </div>

              {/* 11 & 12. Final Love Letter with Large Textarea & Character Counter */}
              <div className="p-4 bg-[#FFF8FA] rounded-2xl border border-[#FFD9E2] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B263E]">
                    11. Final Love Letter (Multi-paragraph)
                  </h4>
                  <span className="text-[11px] text-[#9C7A87] font-mono">
                    {letterParagraphsJoined.length} characters • {config.letter.paragraphs.length} paragraphs
                  </span>
                </div>

                <p className="text-[11px] text-[#7D4F5E]">
                  Tip: Separate paragraphs with an empty line. Each paragraph is revealed gently in sequence!
                </p>

                <textarea
                  rows={6}
                  value={letterParagraphsJoined}
                  onChange={(e) => {
                    const text = e.target.value;
                    const paragraphs = text
                      .split('\n\n')
                      .map((p) => p.trim())
                      .filter(Boolean);
                    onChange({
                      ...config,
                      letter: { ...config.letter, paragraphs: paragraphs.length ? paragraphs : [''] },
                    });
                  }}
                  className="w-full text-xs sm:text-sm p-3 bg-white rounded-xl border border-[#FFCAD4] font-sans leading-relaxed focus:ring-2 focus:ring-[#FF85A1]"
                  placeholder="Write your heartfelt letter here..."
                />

                {/* 12. Closing and Signature */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs text-[#7D4F5E]">Letter Salutation</label>
                    <input
                      type="text"
                      value={config.letter.greeting}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          letter: { ...config.letter, greeting: e.target.value },
                        })
                      }
                      className="w-full text-xs p-2 bg-white rounded-xl border border-[#FFCAD4]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#7D4F5E]">Closing Phrase</label>
                    <input
                      type="text"
                      value={config.letter.closing}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          letter: { ...config.letter, closing: e.target.value },
                        })
                      }
                      className="w-full text-xs p-2 bg-white rounded-xl border border-[#FFCAD4]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NO BUTTON CONFIRMATION & BEHAVIOR */}
          {activeTab === 'noBehavior' && (
            <div className="space-y-6">
              {/* Rejection Mode Picker */}
              <div className="p-4 bg-[#FFF8FA] rounded-2xl border border-[#FFD9E2] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B263E]">
                  Rejection & Prank Mode
                </h4>
                <p className="text-xs text-[#6A4D59]">
                  Choose whether rejection is impossible (the viral TikTok meme) or if the recipient can honestly say no.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Option 1: Viral Prank Mode */}
                  <div
                    onClick={() =>
                      onChange({
                        ...config,
                        question: {
                          ...config.question,
                          allowRejection: false,
                          shrinkNoButton: true,
                          infiniteNoLoop: true,
                        },
                      })
                    }
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      config.question.allowRejection === false
                        ? 'border-[#FF4D6D] bg-white shadow-sm'
                        : 'border-[#FFD5DF] bg-[#FFF9FA] hover:border-[#FF99B0]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-[#8B263E]">
                        Viral Prank Mode (No Way to Reject!) 🙈
                      </span>
                      {config.question.allowRejection === false && (
                        <Check className="w-4 h-4 text-[#FF4D6D]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#7D5A68]">
                      NO button moves around and shrinks smaller and smaller! YES grows huge. Infinite funny begging loop!
                    </p>
                  </div>

                  {/* Option 2: Allow Real Rejection */}
                  <div
                    onClick={() =>
                      onChange({
                        ...config,
                        question: {
                          ...config.question,
                          allowRejection: true,
                        },
                      })
                    }
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      config.question.allowRejection === true
                        ? 'border-[#FF4D6D] bg-white shadow-sm'
                        : 'border-[#FFD5DF] bg-[#FFF9FA] hover:border-[#FF99B0]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-[#8B263E]">
                        Allow Honest Rejection (No Infinite Loop) ♡
                      </span>
                      {config.question.allowRejection === true && (
                        <Check className="w-4 h-4 text-[#FF4D6D]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#7D5A68]">
                      Recipient can confirm NO and arrives at a gentle, respectful goodbye screen with no pressure or loop.
                    </p>
                  </div>
                </div>

                {/* Shrink toggle */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs text-[#6A4D59] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.question.shrinkNoButton !== false}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          question: {
                            ...config.question,
                            shrinkNoButton: e.target.checked,
                          },
                        })
                      }
                      className="accent-[#FF4D6D] rounded"
                    />
                    <span>Shrink NO button smaller and smaller on every move/click</span>
                  </label>
                </div>
              </div>

              {/* NO Button Movement Style */}
              <div className="p-4 bg-[#FFF8FA] rounded-2xl border border-[#FFD9E2] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B263E]">
                  NO Button Movement Style
                </h4>
                <p className="text-xs text-[#6A4D59]">
                  Choose how the NO button moves when approached.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {[
                    { id: 'dodging', title: 'Playfully dodging', desc: 'Dojangles away smoothly' },
                    { id: 'gentle', title: 'Gentle movement', desc: 'Subtle sweet wiggle' },
                    { id: 'normal', title: 'Normal', desc: 'Standard button' },
                    { id: 'stationary', title: 'Stationary', desc: 'Completely still' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() =>
                        onChange({
                          ...config,
                          question: {
                            ...config.question,
                            noButtonStyle: style.id as NoButtonStyle,
                          },
                        })
                      }
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        (config.question.noButtonStyle || 'dodging') === style.id
                          ? 'border-[#FF4D6D] bg-white shadow-xs text-[#8B263E]'
                          : 'border-[#FFD5DF] bg-[#FFF9FA] text-[#7D5A68] hover:border-[#FF99B0]'
                      }`}
                    >
                      <div className="font-semibold text-xs flex items-center justify-between">
                        <span>{style.title}</span>
                        {(config.question.noButtonStyle || 'dodging') === style.id && (
                          <Check className="w-3.5 h-3.5 text-[#FF4D6D]" />
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 7. Funny messages displayed after NO interactions */}
              <div className="p-4 bg-[#FFF8FA] rounded-2xl border border-[#FFD9E2] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B263E]">
                    7. Playful Messages on NO Hover / Tap
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    Shown when NO is moved or approached
                  </span>
                </div>

                {config.question.playfulNoMessages.map((msg, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={msg}
                      onChange={(e) => {
                        const updated = [...config.question.playfulNoMessages];
                        updated[idx] = e.target.value;
                        onChange({
                          ...config,
                          question: { ...config.question, playfulNoMessages: updated },
                        });
                      }}
                      className="w-full text-xs p-2 bg-white rounded-xl border border-[#FFCAD4]"
                    />
                  </div>
                ))}
              </div>

              {/* 8. Confirmation Message when NO is clicked */}
              <div className="p-4 bg-[#FFF8FA] rounded-2xl border border-[#FFD9E2] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B263E]">
                  8. Two-Step NO Confirmation Modal Content
                </h4>
                <p className="text-xs text-[#6A4D59]">
                  If the recipient clicks NO, these gentle confirmation dialogs appear before any final conclusion.
                </p>

                {/* Step 1 */}
                <div className="p-3 bg-white rounded-xl border border-[#FFE4EB] space-y-2">
                  <span className="text-[11px] font-bold text-[#8B263E] uppercase">
                    Step 1 Confirmation Dialog
                  </span>
                  <div>
                    <label className="text-[11px] text-[#7D4F5E]">Heading</label>
                    <input
                      type="text"
                      value={config.question.noConfirmation.step1Heading}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          question: {
                            ...config.question,
                            noConfirmation: {
                              ...config.question.noConfirmation,
                              step1Heading: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full text-xs p-1.5 bg-[#FFFDF9] rounded-lg border border-[#FFD5DF]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#7D4F5E]">Prompt Message</label>
                    <input
                      type="text"
                      value={config.question.noConfirmation.step1Message}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          question: {
                            ...config.question,
                            noConfirmation: {
                              ...config.question.noConfirmation,
                              step1Message: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full text-xs p-1.5 bg-[#FFFDF9] rounded-lg border border-[#FFD5DF]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#7D4F5E]">Think Again Button</label>
                      <input
                        type="text"
                        value={config.question.noConfirmation.step1ThinkAgainButton}
                        onChange={(e) =>
                          onChange({
                            ...config,
                            question: {
                              ...config.question,
                              noConfirmation: {
                                ...config.question.noConfirmation,
                                step1ThinkAgainButton: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full text-xs p-1.5 bg-[#FFFDF9] rounded-lg border border-[#FFD5DF]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#7D4F5E]">I'm Sure Button</label>
                      <input
                        type="text"
                        value={config.question.noConfirmation.step1SureButton}
                        onChange={(e) =>
                          onChange({
                            ...config,
                            question: {
                              ...config.question,
                              noConfirmation: {
                                ...config.question.noConfirmation,
                                step1SureButton: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full text-xs p-1.5 bg-[#FFFDF9] rounded-lg border border-[#FFD5DF]"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-3 bg-white rounded-xl border border-[#FFE4EB] space-y-2">
                  <span className="text-[11px] font-bold text-[#8B263E] uppercase">
                    Step 2 Gentle Confirmation Dialog
                  </span>
                  <div>
                    <label className="text-[11px] text-[#7D4F5E]">Heading</label>
                    <input
                      type="text"
                      value={config.question.noConfirmation.step2Heading}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          question: {
                            ...config.question,
                            noConfirmation: {
                              ...config.question.noConfirmation,
                              step2Heading: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full text-xs p-1.5 bg-[#FFFDF9] rounded-lg border border-[#FFD5DF]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#7D4F5E]">Final Respectful Message</label>
                    <input
                      type="text"
                      value={config.question.noConfirmation.finalRespectfulMessage}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          question: {
                            ...config.question,
                            noConfirmation: {
                              ...config.question.noConfirmation,
                              finalRespectfulMessage: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full text-xs p-1.5 bg-[#FFFDF9] rounded-lg border border-[#FFD5DF]"
                    />
                  </div>
                </div>

                {/* Dedicated Rejection Screen Content */}
                {config.question.allowRejection && (
                  <div className="p-3 bg-white rounded-xl border border-[#FFE4EB] space-y-2 mt-3">
                    <span className="text-[11px] font-bold text-[#8B263E] uppercase">
                      Dedicated Rejection Screen Messages (No Infinite Loop)
                    </span>
                    <div>
                      <label className="text-[11px] text-[#7D4F5E]">Title</label>
                      <input
                        type="text"
                        value={config.question.rejection?.title || ''}
                        onChange={(e) =>
                          onChange({
                            ...config,
                            question: {
                              ...config.question,
                              rejection: {
                                ...config.question.rejection,
                                title: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full text-xs p-1.5 bg-[#FFFDF9] rounded-lg border border-[#FFD5DF]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#7D4F5E]">Kind Comforting Message</label>
                      <input
                        type="text"
                        value={config.question.rejection?.message || ''}
                        onChange={(e) =>
                          onChange({
                            ...config,
                            question: {
                              ...config.question,
                              rejection: {
                                ...config.question.rejection,
                                message: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full text-xs p-1.5 bg-[#FFFDF9] rounded-lg border border-[#FFD5DF]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GIF UPLOAD & FLOATING CONTROLS (UNLIMITED GIFS) */}
          {activeTab === 'gifs' && (
            <div className="space-y-6">
              {/* Unlimited GIFs Banner & Quick Actions */}
              <div className="p-4 bg-[#FAF5FF] border border-[#DDD6FE] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3B0764] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#9333EA]" />
                    <span>Unlimited Cute GIFs & Images</span>
                  </h4>
                  <p className="text-xs text-[#7E22CE] mt-0.5">
                    Add as many GIFs and photos as you want — no limit! Currently {config.floatingGifs.length} active ♡
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAllPresets}
                  className="px-3.5 py-1.5 bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#6B21A8] rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  + Add All Presets ({cutePresets.length})
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#DDD6FE] hover:border-[#9333EA] bg-[#FAF5FF] hover:bg-[#F3E8FF] rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".gif,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <div className="w-12 h-12 mb-2 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED] group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-[#3B0764]">
                  {isUploading ? 'Uploading your cute GIF...' : 'Upload your own GIFs & pictures ♡'}
                </p>
                <p className="text-xs text-[#7E22CE] mt-1">
                  Supports animated .GIF, PNG, JPG, WebP. Select as many files as you want at once!
                </p>
              </div>

              {/* Add by URL input bar */}
              <div className="p-4 bg-white rounded-2xl border border-[#DDD6FE] space-y-2">
                <label className="text-xs font-semibold text-[#3B0764]">
                  Add GIF or Image by URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste any GIF or image link (Giphy, Tenor, Pinterest, etc.)..."
                    value={newGifUrl}
                    onChange={(e) => setNewGifUrl(e.target.value)}
                    className="flex-1 text-xs p-2.5 bg-[#FAF5FF] rounded-xl border border-[#DDD6FE] text-[#3B0764] focus:outline-none focus:ring-2 focus:ring-[#C084FC]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddGif()}
                    disabled={!newGifUrl.trim()}
                    className="px-4 py-2 bg-[#9333EA] hover:bg-[#7E22CE] disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    + Add GIF
                  </button>
                </div>
              </div>

              {/* Quick Presets Grid */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#3B0764]">
                  Or click to add from adorable presets library:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {cutePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddGif(preset.url, preset.name)}
                      className="flex items-center gap-2 p-2 bg-[#FAF5FF] hover:bg-[#F3E8FF] border border-[#DDD6FE] rounded-xl text-left transition-all cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-[#E9D5FF] bg-white">
                        <CuteGif src={preset.url} alt={preset.name} className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[11px] font-medium text-[#6B21A8] group-hover:text-[#3B0764] truncate">
                        + {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {uploadError}
                </div>
              )}

              {/* Gallery of Uploaded GIFs */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B263E]">
                    Uploaded GIF Gallery ({config.floatingGifs.length})
                  </h3>
                  <button
                    onClick={resetToDefault}
                    className="text-[11px] text-[#A8586E] hover:text-[#B33951] flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset GIFs</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {config.floatingGifs.map((g) => {
                    const isSelected = g.id === selectedGifId;
                    return (
                      <div
                        key={g.id}
                        onClick={() => setSelectedGifId(g.id)}
                        className={`relative rounded-xl p-2 cursor-pointer border-2 transition-all flex flex-col items-center text-center bg-[#FFF9FA] ${
                          isSelected
                            ? 'border-[#FF4D6D] shadow-md bg-white scale-102'
                            : 'border-[#FFD9E2] hover:border-[#FF99B0]'
                        }`}
                      >
                        <div className="w-16 h-16 flex items-center justify-center overflow-hidden mb-1">
                          <CuteGif
                            src={g.url}
                            alt={g.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-[10px] font-medium text-[#6B4655] truncate w-full">
                          {g.name}
                        </p>
                        <span className="text-[9px] text-[#FF4D6D] font-mono">
                          {g.displayMode}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeGif(g.id);
                          }}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white shadow-xs border border-[#FFCAD4] text-red-500 flex items-center justify-center hover:bg-red-50"
                          title="Remove GIF"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected GIF Controls */}
              {selectedGif && (
                <div className="bg-[#FFF8FA] p-5 rounded-2xl border border-[#FFD9E2] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#FFE4EB] pb-3">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#FF4D6D]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B263E]">
                        Customizing: {selectedGif.name}
                      </h4>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-[#6B4655] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedGif.visible}
                        onChange={(e) => updateSelectedGif({ visible: e.target.checked })}
                        className="accent-[#FF4D6D] rounded"
                      />
                      <span>Visible on site</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Display Mode */}
                    <div>
                      <label className="block text-xs font-medium text-[#7D4F5E] mb-1">
                        Display Mode
                      </label>
                      <select
                        value={selectedGif.displayMode}
                        onChange={(e) =>
                          updateSelectedGif({ displayMode: e.target.value as GifDisplayMode })
                        }
                        className="w-full text-xs p-2 bg-white rounded-xl border border-[#FFCAD4] text-[#4A3B43]"
                      >
                        <option value="floating">Floating mode (drifts around edges)</option>
                        <option value="random">Random appearance mode (surprises)</option>
                        <option value="corner">Corner decoration mode</option>
                        <option value="scattered">Scattered mode</option>
                        <option value="clickToShow">Click-to-show heart icon</option>
                        <option value="custom">Custom placement (X/Y)</option>
                      </select>
                    </div>

                    {/* Target Section */}
                    <div>
                      <label className="block text-xs font-medium text-[#7D4F5E] mb-1">
                        Show on Section
                      </label>
                      <select
                        value={selectedGif.targetSection}
                        onChange={(e) =>
                          updateSelectedGif({ targetSection: e.target.value as TargetSection })
                        }
                        className="w-full text-xs p-2 bg-white rounded-xl border border-[#FFCAD4] text-[#4A3B43]"
                      >
                        <option value="all">Everywhere throughout site</option>
                        <option value="opening">Opening Screen</option>
                        <option value="message">Personal Message</option>
                        <option value="question">Question Screen</option>
                        <option value="celebration">Celebration Screen</option>
                        <option value="letter">Final Letter</option>
                      </select>
                    </div>

                    {/* Speed */}
                    <div>
                      <label className="block text-xs font-medium text-[#7D4F5E] mb-1">
                        Speed
                      </label>
                      <select
                        value={selectedGif.speed}
                        onChange={(e) =>
                          updateSelectedGif({ speed: e.target.value as AnimationSpeed })
                        }
                        className="w-full text-xs p-2 bg-white rounded-xl border border-[#FFCAD4] text-[#4A3B43]"
                      >
                        <option value="slow">Slow & gentle</option>
                        <option value="normal">Normal</option>
                        <option value="fast">Playful & lively</option>
                      </select>
                    </div>
                  </div>

                  {/* Sliders for Size, Opacity, Rotation */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <div className="flex justify-between text-xs text-[#7D4F5E] mb-1">
                        <span>Size</span>
                        <span>{selectedGif.size}px</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="220"
                        value={selectedGif.size}
                        onChange={(e) => updateSelectedGif({ size: parseInt(e.target.value) })}
                        className="w-full accent-[#FF4D6D]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-[#7D4F5E] mb-1">
                        <span>Opacity</span>
                        <span>{Math.round(selectedGif.opacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="1"
                        step="0.05"
                        value={selectedGif.opacity}
                        onChange={(e) => updateSelectedGif({ opacity: parseFloat(e.target.value) })}
                        className="w-full accent-[#FF4D6D]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-[#7D4F5E] mb-1">
                        <span>Tilt / Rotation</span>
                        <span>{selectedGif.rotation}°</span>
                      </div>
                      <input
                        type="range"
                        min="-30"
                        max="30"
                        value={selectedGif.rotation}
                        onChange={(e) =>
                          updateSelectedGif({ rotation: parseInt(e.target.value) })
                        }
                        className="w-full accent-[#FF4D6D]"
                      />
                    </div>
                  </div>

                  {/* Position Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <div className="flex justify-between text-xs text-[#7D4F5E] mb-1">
                        <span>Horizontal Position (X)</span>
                        <span>{selectedGif.customPosition.x}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        value={selectedGif.customPosition.x}
                        onChange={(e) =>
                          updateSelectedGif({
                            customPosition: {
                              ...selectedGif.customPosition,
                              x: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-[#FF4D6D]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-[#7D4F5E] mb-1">
                        <span>Vertical Position (Y)</span>
                        <span>{selectedGif.customPosition.y}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        value={selectedGif.customPosition.y}
                        onChange={(e) =>
                          updateSelectedGif({
                            customPosition: {
                              ...selectedGif.customPosition,
                              y: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-[#FF4D6D]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PERSONAL NAMES & TOUCHES */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              {/* Dedicated Official Anniversary & Monthsary Settings */}
              <div className="p-4 bg-[#FAF5FF] rounded-2xl border border-[#DDD6FE] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3B0764] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#9333EA]" />
                    <span>Official Anniversary & Monthsary Dates</span>
                  </h4>
                  <label className="flex items-center gap-1.5 text-xs text-[#6B21A8] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.celebration.dates?.showMonthsary !== false}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          celebration: {
                            ...config.celebration,
                            dates: {
                              ...config.celebration.dates,
                              showMonthsary: e.target.checked,
                            },
                          },
                        })
                      }
                      className="accent-[#9333EA] rounded"
                    />
                    <span>Show on Celebration Screen</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#7E22CE]">
                      Official Couple Date (When She Says YES)
                    </label>
                    <input
                      type="date"
                      value={config.celebration.dates?.officialStartDate || config.personalTouches.startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        onChange({
                          ...config,
                          celebration: {
                            ...config.celebration,
                            dates: {
                              ...config.celebration.dates,
                              officialStartDate: newDate,
                            },
                          },
                          personalTouches: {
                            ...config.personalTouches,
                            startDate: newDate,
                          },
                        });
                      }}
                      className="w-full text-xs p-2.5 bg-white rounded-xl border border-[#DDD6FE] text-[#3B0764] mt-1"
                    />
                    <p className="text-[11px] text-[#7E22CE] mt-1">
                      Sets the day of each month for your monthly Monthsary! ♡
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#7E22CE]">
                      Anniversary Milestone Title
                    </label>
                    <input
                      type="text"
                      value={config.celebration.dates?.anniversaryTitle || 'Day 1 as Official Boyfriend & Girlfriend 💜'}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          celebration: {
                            ...config.celebration,
                            dates: {
                              ...config.celebration.dates,
                              anniversaryTitle: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full text-xs p-2.5 bg-white rounded-xl border border-[#DDD6FE] text-[#3B0764] mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#7E22CE]">
                    Monthsary Note / Celebration Message
                  </label>
                  <input
                    type="text"
                    value={config.celebration.dates?.monthsaryNote || 'Every month on this special day is our Monthsary! ♡'}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        celebration: {
                          ...config.celebration,
                          dates: {
                            ...config.celebration.dates,
                            monthsaryNote: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full text-xs p-2.5 bg-white rounded-xl border border-[#DDD6FE] text-[#3B0764] mt-1"
                  />
                </div>
              </div>

              {/* Names, Nicknames, and Terms of Endearment */}
              <div className="p-4 bg-white rounded-2xl border border-[#DDD6FE] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3B0764]">
                  Names, Nicknames & Terms of Endearment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#7E22CE]">Her Name / Nickname</label>
                    <input
                      type="text"
                      placeholder="e.g. Maya ♡"
                      value={config.personalTouches.recipientName}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          personalTouches: {
                            ...config.personalTouches,
                            recipientName: e.target.value,
                          },
                        })
                      }
                      className="w-full text-xs p-2 bg-[#FAF5FF] rounded-xl border border-[#DDD6FE]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#7E22CE]">Your Nickname / Signature</label>
                    <input
                      type="text"
                      placeholder="e.g. your boyfriend-to-be ♡"
                      value={config.personalTouches.senderNickname}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          personalTouches: {
                            ...config.personalTouches,
                            senderNickname: e.target.value,
                          },
                        })
                      }
                      className="w-full text-xs p-2 bg-[#FAF5FF] rounded-xl border border-[#DDD6FE]"
                    />
                  </div>
                </div>
              </div>

              {/* Little Things Notes */}
              <div className="p-4 bg-[#FFF8FA] rounded-2xl border border-[#FFD9E2] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B263E]">
                  “Little things I like about you” Notes
                </h4>
                {config.personalTouches.littleThings.map((thing, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={thing}
                      onChange={(e) => {
                        const updated = [...config.personalTouches.littleThings];
                        updated[idx] = e.target.value;
                        onChange({
                          ...config,
                          personalTouches: {
                            ...config.personalTouches,
                            littleThings: updated,
                          },
                        });
                      }}
                      className="w-full text-xs p-2 bg-white rounded-xl border border-[#FFCAD4]"
                    />
                    <button
                      onClick={() => {
                        const updated = config.personalTouches.littleThings.filter((_, i) => i !== idx);
                        onChange({
                          ...config,
                          personalTouches: {
                            ...config.personalTouches,
                            littleThings: updated,
                          },
                        });
                      }}
                      className="text-red-400 hover:text-red-600 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {config.personalTouches.littleThings.length < 5 && (
                  <button
                    onClick={() => {
                      const updated = [...config.personalTouches.littleThings, 'A new little thing I love about you ♡'];
                      onChange({
                        ...config,
                        personalTouches: {
                          ...config.personalTouches,
                          littleThings: updated,
                        },
                      });
                    }}
                    className="inline-flex items-center gap-1 text-xs text-[#FF4D6D] font-medium hover:underline pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add another note</span>
                  </button>
                )}
              </div>

              {/* Toggles */}
              <div className="p-4 bg-[#FFF8FA] rounded-2xl border border-[#FFD9E2] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B263E]">
                  Experience Settings
                </h4>
                <label className="flex items-center gap-2 text-xs text-[#5A3E4B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.personalTouches.enableCursorHeartTrail}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        personalTouches: {
                          ...config.personalTouches,
                          enableCursorHeartTrail: e.target.checked,
                        },
                      })
                    }
                    className="accent-[#FF4D6D]"
                  />
                  <span>Enable desktop floating heart cursor trail</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-[#5A3E4B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.personalTouches.enableAmbientMusic}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        personalTouches: {
                          ...config.personalTouches,
                          enableAmbientMusic: e.target.checked,
                        },
                      })
                    }
                    className="accent-[#FF4D6D]"
                  />
                  <span>Enable soft romantic music player (off by default)</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#FFE4EB] bg-[#FFF8FA]">
          <button
            onClick={onClose}
            className="text-xs text-[#9C7A87] hover:text-[#5A3E4B]"
          >
            ← Back to romantic view
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onPreviewShared}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#8B263E] bg-[#FFE8EE] hover:bg-[#FFD5DF] rounded-full transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview as recipient</span>
            </button>

            <button
              onClick={handleShareWebsite}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#FF758F] to-[#FF4D6D] rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share my website ♡</span>
            </button>
          </div>
        </div>
      </div>

      {/* SHARE MODAL */}
      {shareResult && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#FFCAD4] shadow-2xl text-center relative animate-fadeIn">
            <button
              onClick={() => setShareResult(null)}
              className="absolute top-4 right-4 text-[#9C7A87] hover:text-[#B33951] p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 mx-auto mb-3 bg-[#FFE4E8] rounded-full flex items-center justify-center text-[#FF4D6D]">
              <Heart className="w-7 h-7 fill-[#FF4D6D] animate-bounce" />
            </div>

            <h3 className="font-serif-title text-2xl font-bold text-[#8B263E] mb-1">
              Your little love website is ready! ♡
            </h3>
            <p className="text-xs text-[#7A5867] mb-5">
              “send this little piece of my heart to someone special. 💗”
            </p>

            {/* Link box */}
            <div className="flex items-center gap-2 p-2 bg-[#FFF0F3] border border-[#FFCAD4] rounded-2xl mb-4">
              <input
                type="text"
                readOnly
                value={shareResult.shareUrl}
                className="w-full text-xs bg-transparent text-[#6B4655] font-mono px-2 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#FF758F] to-[#FF4D6D] rounded-xl shadow-xs hover:opacity-95 active:scale-95 transition-all shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => {
                  window.open(shareResult.shareUrl, '_blank');
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-[#8B263E] bg-[#FFE8EE] hover:bg-[#FFD5DF] rounded-full transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in new tab</span>
              </button>
              <button
                onClick={() => {
                  setShareResult(null);
                  onPreviewShared();
                }}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#FF758F] to-[#FF4D6D] rounded-full shadow-sm hover:opacity-95 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Website</span>
              </button>
            </div>

            <p className="mt-4 text-[11px] text-[#A8808E] font-light">
              This unique URL is saved persistently. Anyone with the link will see your customized GIFs and animations!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
