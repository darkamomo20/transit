import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Bus,
  Clock,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { AIStopAnalysisResult } from '../types';

interface AIStopVisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIStopVisionModal: React.FC<AIStopVisionModalProps> = ({ isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIStopAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      setAnalysisResult(null);
      setErrorMsg(null);
      runVisionAnalysis(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const runVisionAnalysis = async (base64Image: string, mimeType: string) => {
    setAnalyzing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/gemini/analyze-stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType: mimeType || 'image/png'
        })
      });

      const data = await response.json();
      if (response.ok) {
        setAnalysisResult(data);
      } else {
        setErrorMsg(data.error || 'Could not parse image.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to connect to AI Vision service.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-400">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">AI Multimodal Stop Vision</h2>
              <p className="text-xs text-slate-400">Scan or upload a transit stop sign, schedule or pole</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload / Camera Box */}
        <div className="mt-5 space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          {!selectedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-950/40 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3 group"
            >
              <div className="w-12 h-12 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-sm text-purple-300 block">
                  Click to Snap or Upload Stop Image
                </span>
                <span className="text-xs text-slate-400">
                  Supports JPEG, PNG stop signs, timetables, or station boards
                </span>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 max-h-64 bg-black flex items-center justify-center">
              <img src={selectedImage} alt="Stop Preview" className="object-contain max-h-64" />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setAnalysisResult(null);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Analysis Loading State */}
          {analyzing && (
            <div className="p-4 bg-purple-950/40 border border-purple-800/40 rounded-2xl flex items-center gap-3 text-purple-300 text-xs animate-pulse">
              <Sparkles className="w-5 h-5 text-purple-400 animate-spin" />
              <div>
                <strong className="block font-bold">Gemini AI is analyzing image...</strong>
                <span>Extracting line numbers, station name, and real-time schedules</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* AI Vision Analysis Results */}
          {analysisResult && (
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-3 animate-fade-in text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Detected: {analysisResult.stopName || 'Stop Identified'}</span>
                </div>
                <span className="bg-purple-900/60 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-700/50">
                  {analysisResult.confidenceScore || 95}% Match
                </span>
              </div>

              {/* Detected Lines */}
              {analysisResult.detectedLines && analysisResult.detectedLines.length > 0 && (
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Detected Lines:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.detectedLines.map((line, idx) => (
                      <span key={idx} className="bg-emerald-500 text-slate-950 font-black px-2.5 py-0.5 rounded-lg text-xs shadow">
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Realtime Advice */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-700 space-y-1">
                <strong className="text-slate-200 block font-bold">💡 AI Real-Time Guidance:</strong>
                <p className="text-slate-300">{analysisResult.realtimeAdvice}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
