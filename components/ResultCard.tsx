import React from 'react';
import { Verse } from '../types';
import VerseAudioPlayer from './VerseAudioPlayer';

interface ResultCardProps {
  verse: Verse;
}

const ResultCard: React.FC<ResultCardProps> = ({ verse }) => {
  const filenamePrefix = `${verse.surahName.replace(/\s+/g, '_')}_${verse.surahNumber}_${verse.ayahNumber}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
        <div className="flex flex-col">
          <span className="text-emerald-800 font-bold text-lg">{verse.surahName}</span>
          <span className="text-slate-500 text-sm">Surah {verse.surahNumber}, Ayah {verse.ayahNumber}</span>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
          Relevance: {verse.relevanceReason.length > 50 ? verse.relevanceReason.substring(0, 50) + "..." : verse.relevanceReason}
        </div>
      </div>

      {/* Arabic Text */}
      <div className="mb-6 text-right" dir="rtl">
        <p className="font-arabic text-3xl leading-loose text-slate-800">{verse.arabicText}</p>
      </div>

      {/* Urdu Translation */}
      <div className="mb-6 text-right border-r-4 border-gold-400 pr-4 bg-slate-50 py-2 rounded-l-lg" dir="rtl">
         <p className="font-urdu text-xl text-slate-700 leading-relaxed">{verse.urduTranslation}</p>
      </div>

      {/* English Explanation */}
      <div className="mb-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Context & Explanation</h4>
        <p className="text-slate-600 text-sm leading-relaxed">{verse.englishExplanation}</p>
      </div>

      {/* Audio Controls */}
      <VerseAudioPlayer 
        arabicText={verse.arabicText} 
        urduText={verse.urduTranslation} 
        filenamePrefix={filenamePrefix}
      />
    </div>
  );
};

export default ResultCard;