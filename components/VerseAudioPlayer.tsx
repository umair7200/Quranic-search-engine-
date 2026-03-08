import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech } from '../services/geminiService';
import { decodeBase64, decodeAudioData, createWavBlob } from '../services/audioUtils';
import { PlayIcon, PauseIcon, SpinnerIcon, DownloadIcon } from './Icons';

interface VerseAudioPlayerProps {
  arabicText: string;
  urduText: string;
  filenamePrefix: string;
}

const VerseAudioPlayer: React.FC<VerseAudioPlayerProps> = ({ arabicText, urduText, filenamePrefix }) => {
  const [loading, setLoading] = useState<'arabic' | 'urdu' | 'download' | null>(null);
  const [playing, setPlaying] = useState<'arabic' | 'urdu' | null>(null);
  
  // Refs for Audio Context and Source to manage playback
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000, // Gemini TTS sample rate
      });
    }
    // Resume context if suspended (browser autoplay policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) {
        // Ignore error if already stopped
      }
      sourceNodeRef.current = null;
    }
    setPlaying(null);
  };

  const playAudio = async (type: 'arabic' | 'urdu') => {
    // If clicking the same button that is currently playing, stop it.
    if (playing === type) {
      stopAudio();
      return;
    }

    // Stop any currently playing audio before starting new
    stopAudio();
    initAudioContext();
    setLoading(type);

    try {
      const textToSpeak = type === 'arabic' ? arabicText : urduText;
      const base64Data = await generateSpeech(textToSpeak, type === 'arabic' ? 'ar' : 'ur');
      
      const audioBytes = decodeBase64(base64Data);
      
      if (!audioContextRef.current) return;

      const audioBuffer = await decodeAudioData(
        audioBytes,
        audioContextRef.current,
        24000,
        1
      );

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setPlaying(null);
        sourceNodeRef.current = null;
      };

      sourceNodeRef.current = source;
      source.start();
      setPlaying(type);
    } catch (error) {
      console.error("Audio playback error:", error);
      alert("Unable to play audio. Please check your connection.");
    } finally {
      setLoading(null);
    }
  };

  const handleDownload = async () => {
    setLoading('download');
    try {
      // 1. Fetch Arabic Audio
      const arabicB64 = await generateSpeech(arabicText, 'ar');
      const arabicBytes = decodeBase64(arabicB64);

      // 2. Fetch Urdu Audio
      const urduB64 = await generateSpeech(urduText, 'ur');
      const urduBytes = decodeBase64(urduB64);

      // 3. Create Silence (1 second)
      // 24000 samples/sec * 1 sec * 2 bytes/sample (16-bit)
      const silenceBytes = new Uint8Array(24000 * 2); 

      // 4. Combine and create WAV
      const wavBlob = createWavBlob([arabicBytes, silenceBytes, urduBytes], 24000);

      // 5. Trigger Download
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filenamePrefix}_Recitation_Translation.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to generate download. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const ButtonStyle = "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border";

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      <button
        onClick={() => playAudio('arabic')}
        disabled={loading !== null && loading !== 'arabic'}
        className={`${ButtonStyle} ${
          playing === 'arabic' 
            ? 'bg-emerald-600 text-white border-emerald-600' 
            : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
        }`}
      >
        {loading === 'arabic' ? <SpinnerIcon /> : playing === 'arabic' ? <PauseIcon /> : <PlayIcon />}
        <span>Arabic Recitation</span>
      </button>

      <button
        onClick={() => playAudio('urdu')}
        disabled={loading !== null && loading !== 'urdu'}
        className={`${ButtonStyle} ${
          playing === 'urdu' 
            ? 'bg-gold-600 text-white border-gold-600' 
            : 'text-gold-700 border-gold-200 hover:bg-gold-50'
        }`}
      >
        {loading === 'urdu' ? <SpinnerIcon /> : playing === 'urdu' ? <PauseIcon /> : <PlayIcon />}
        <span>Urdu Translation</span>
      </button>

      <div className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto">
        <button
            onClick={handleDownload}
            disabled={loading !== null}
            className={`${ButtonStyle} text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800 w-full justify-center sm:w-auto`}
        >
            {loading === 'download' ? <SpinnerIcon /> : <DownloadIcon />}
            <span>Download MP3 (WAV)</span>
        </button>
      </div>
    </div>
  );
};

export default VerseAudioPlayer;