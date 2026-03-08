export interface Verse {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  urduTranslation: string;
  englishExplanation: string;
  relevanceReason: string;
}

export interface SearchResult {
  topic: string;
  summary: string;
  verses: Verse[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  currentType: 'arabic' | 'urdu' | null;
}
