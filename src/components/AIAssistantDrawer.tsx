import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  Zap,
  Navigation,
  Compass,
  ArrowRight,
  MapPin,
  ExternalLink,
  Star,
  Quote,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { CityNetwork, TransitLine } from '../types';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCity: CityNetwork;
  nearbyLines: TransitLine[];
  userGpsPosition?: { lat: number; lng: number } | null;
}

interface GroundingSource {
  title: string;
  uri: string;
  snippet?: string;
  reviewSnippets?: string[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  groundingSources?: GroundingSource[];
  hasMapsGrounding?: boolean;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  activeCity,
  nearbyLines,
  userGpsPosition,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `¡Hola! Soy **Transit AI Copilot** conectado con **Google Maps en vivo** para ${activeCity.name}.\n\nPuedo ayudarte con:\n• 🗺️ **Rutas exactas e itinerarios multimodales**\n• 📍 **Estaciones, paradas y transbordos cercanos**\n• ☕ **Restaurantes, cafeterías y lugares de interés**\n• ⏱️ **Frecuencias, ocupación y retrasos en tiempo real**`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hasMapsGrounding: true
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [useGoogleMaps, setUseGoogleMaps] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      // Determine lat/lng for Grounding
      const lat = userGpsPosition?.lat || activeCity.center[0];
      const lng = userGpsPosition?.lng || activeCity.center[1];

      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          userLocation: activeCity.locationLabel,
          activeCity: activeCity.name,
          lat,
          lng,
          useMapsGrounding: useGoogleMaps,
          nearbyLines: nearbyLines.map(l => ({
            lineNumber: l.lineNumber,
            destination: l.destination,
            nextArrivalMins: l.arrivals[0],
            crowdLevel: l.crowdLevel
          }))
        })
      });

      const data = await response.json();

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.text || 'He analizado las redes y lugares con Google Maps.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingSources: data.groundingSources || [],
        hasMapsGrounding: Boolean(data.hasMapsGrounding || (data.groundingSources && data.groundingSources.length > 0))
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Disculpa, ha ocurrido una incidencia temporal en la red. Inténtalo de nuevo en unos momentos.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('El reconocimiento de voz no está disponible en este navegador.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = activeCity.id === 'paris' ? 'fr-FR' : activeCity.id === 'madrid' || activeCity.id === 'barcelona' ? 'es-ES' : 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputPrompt(transcript);
      handleSendMessage(transcript);
    };

    recognition.start();
  };

  const PRESET_PROMPTS = [
    `📍 ¿Cuáles son las estaciones de metro y paradas más cercanas?`,
    `🥐 Mejores cafeterías y panaderías cerca en ${activeCity.name}`,
    `🗼 Cómo llegar a puntos turísticos emblemáticos en transporte`,
    `🚴 ¿Dónde hay estaciones de bicicletas y carriles bici cercanos?`,
    `🏥 Farmacias o servicios de urgencia próximos`
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#0B1120] border-l border-slate-800 h-full flex flex-col shadow-2xl text-slate-100">
        {/* Header */}
        <div className="p-4 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 relative">
              <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0F172A] flex items-center justify-center">
                <MapPin className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white tracking-tight">TRANSIT AI COPILOT</h2>
                <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                  Google Maps Grounding
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">Gemini 3.5 Flash • Datos y Lugares en Vivo</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseGoogleMaps(!useGoogleMaps)}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                useGoogleMaps 
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Activar/Desactivar Google Maps Grounding"
            >
              <MapPin className="w-3 h-3 text-blue-400" />
              <span>{useGoogleMaps ? 'Maps Activo' : 'Maps Off'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 border border-slate-700 text-blue-400'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Google Maps Grounding Sources Section */}
                {msg.groundingSources && msg.groundingSources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>Lugares y Enlaces en Google Maps ({msg.groundingSources.length})</span>
                    </div>

                    <div className="space-y-1.5">
                      {msg.groundingSources.map((source, sIdx) => (
                        <a
                          key={sIdx}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/50 p-2.5 rounded-xl transition-all group shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center shrink-0">
                                <MapPin className="w-3 h-3 text-blue-400" />
                              </div>
                              <span className="font-bold text-slate-100 text-xs truncate group-hover:text-blue-300 transition-colors">
                                {source.title}
                              </span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 shrink-0" />
                          </div>

                          {/* Review Snippets from Google Maps */}
                          {source.reviewSnippets && source.reviewSnippets.length > 0 && (
                            <div className="mt-1.5 pl-7 text-[11px] text-slate-400 italic flex items-start gap-1">
                              <Quote className="w-2.5 h-2.5 text-slate-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">"{source.reviewSnippets[0]}"</span>
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[9px] mt-1.5 text-right ${
                    msg.sender === 'user' ? 'text-blue-200' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 text-xs text-blue-300 bg-blue-950/40 p-3 rounded-2xl border border-blue-800/50 w-fit animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
              <span>Consultando Google Maps y datos en tiempo real...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggested Prompts */}
        <div className="px-4 py-2 bg-[#0F172A] border-t border-slate-800 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            {PRESET_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-slate-800 transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#0F172A] border-t border-slate-800 flex items-center gap-2">
          <button
            onClick={handleVoiceInput}
            className={`p-2.5 rounded-xl border transition-colors ${
              isListening
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
            }`}
            title="Búsqueda por voz"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-blue-400" />}
          </button>

          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Pregunta por rutas, paradas, lugares o restaurantes..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputPrompt.trim() || loading}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors shadow"
            title="Enviar mensaje"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
