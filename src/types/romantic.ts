export type GifDisplayMode = 
  | 'floating' 
  | 'random' 
  | 'corner' 
  | 'scattered' 
  | 'clickToShow' 
  | 'custom';

export type TargetSection = 
  | 'all' 
  | 'opening' 
  | 'message' 
  | 'question' 
  | 'celebration' 
  | 'letter'
  | 'rejection';

export type FloatDirection = 'up' | 'down' | 'drift' | 'bounce';
export type AnimationSpeed = 'slow' | 'normal' | 'fast';
export type NoButtonStyle = 'dodging' | 'gentle' | 'normal' | 'stationary';

export interface FloatingGifConfig {
  id: string;
  name: string;
  url: string;
  displayMode: GifDisplayMode;
  size: number; // width in px (e.g. 70 - 200)
  opacity: number; // 0.1 - 1.0
  speed: AnimationSpeed;
  direction: FloatDirection;
  rotation: number; // in deg e.g. -25 to 25
  customPosition: { x: number; y: number }; // percentage 0-100
  frequency: 'continuous' | 'occasional' | 'rare';
  targetSection: TargetSection;
  isClickable: boolean;
  visible: boolean;
}

export interface OpeningConfig {
  greeting: string;
  subtitle1: string;
  subtitle2: string;
  buttonText: string;
  footerText: string;
  gifUrl: string;
}

export interface PersonalMessageConfig {
  title: string;
  lines: string[];
  buttonText: string;
  gifUrl: string;
}

export interface NoConfirmationConfig {
  step1Heading: string;
  step1Message: string;
  step1ThinkAgainButton: string;
  step1SureButton: string;
  thinkAgainCuteMessage: string;
  step2Heading: string;
  step2GoBackButton: string;
  step2FinalSureButton: string;
  finalRespectfulMessage: string;
}

export interface RejectionScreenConfig {
  title: string;
  message: string;
  subMessage: string;
  gifUrl: string;
  restartButtonText: string;
}

export interface QuestionConfig {
  leadText: string;
  questionText: string;
  subText: string;
  yesButtonText: string;
  noButtonText: string;
  noButtonStyle: NoButtonStyle;
  allowRejection: boolean; // if false, infinite funny prank mode (shrinks/dodges forever)
  shrinkNoButton: boolean; // shrinks NO button smaller and smaller on every hover/tap
  infiniteNoLoop: boolean; // loop playful excuses forever
  gifUrl: string;
  playfulNoMessages: string[];
  noConfirmation: NoConfirmationConfig;
  rejection: RejectionScreenConfig;
  gentleNoResponse: {
    title: string;
    message: string;
    buttonText: string;
  };
}

export interface CelebrationDatesConfig {
  showMonthsary: boolean;
  officialStartDate: string; // e.g. '2026-10-14' or ISO date string
  firstMetDate?: string; // Optional: e.g. '2024-05-20'
  anniversaryTitle: string;
  monthsaryNote: string;
}

export interface CelebrationConfig {
  title: string;
  subtitle1: string;
  subtitle2: string;
  happyText: string;
  buttonText: string;
  gifUrl: string;
  dates: CelebrationDatesConfig;
}

export interface MemoryItem {
  id: string;
  url: string;
  caption: string;
}

export interface LetterConfig {
  envelopeTitle: string;
  greeting: string;
  paragraphs: string[];
  closing: string;
  signature: string;
  gifUrl: string;
}

export interface PersonalTouchesConfig {
  recipientName: string;
  senderNickname: string;
  startDate: string; // e.g. '2024-05-20' or empty
  littleThings: string[];
  memories: MemoryItem[];
  enableCursorHeartTrail: boolean;
  enableAmbientMusic: boolean;
  customMusicUrl: string;
}

export interface RomanticWebsiteConfig {
  version: string;
  lastSaved?: string;
  opening: OpeningConfig;
  personalMessage: PersonalMessageConfig;
  question: QuestionConfig;
  celebration: CelebrationConfig;
  letter: LetterConfig;
  personalTouches: PersonalTouchesConfig;
  floatingGifs: FloatingGifConfig[];
}
