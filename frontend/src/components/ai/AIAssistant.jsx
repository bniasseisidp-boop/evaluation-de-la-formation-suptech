import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Volume2, VolumeX, MessageCircle, Bot, Send } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const PAGE_MESSAGES = {
  '/portail': (name) => `Bonjour ${name} ! 👋 Je suis l'IA SUPTECH. Voici votre tableau de bord. Vous pouvez évaluer vos enseignants en cliquant sur les matières listées, puis évaluer la qualité des services et la formation globale.`,
  '/portail/qualite': () => `Vous êtes sur le questionnaire d'évaluation de la qualité des services ISI/SUPTECH. Évaluez chaque service de "Très satisfait" à "Pas du tout satisfait". Votre avis compte beaucoup !`,
  '/portail/formation': () => `C'est le moment d'évaluer la formation dans son ensemble. Notez de 1 (pas du tout d'accord) à 5 (tout à fait d'accord) chaque aspect de votre formation. Soyez honnête !`,
  '/portail/mes-evaluations': () => `Voici le récapitulatif de toutes vos évaluations soumises. Vous pouvez les consulter mais pas les modifier. Merci pour votre participation !`,
};

const CONTEXTUAL_TIPS = [
  '💡 Vos réponses sont anonymisées et ne sont visibles que par l\'administration.',
  '🎯 Essayez de répondre à toutes les questions pour un meilleur rapport.',
  '⭐ Vos retours permettent d\'améliorer la qualité des cours !',
  '📊 L\'administration analysera vos réponses pour améliorer les formations.',
  '🕒 Prenez votre temps — il n\'y a pas de limite de temps.',
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const { user } = useAuthStore();
  const synthRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [messages]);

  const speak = useCallback((text) => {
    if (!voiceEnabled || !synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  }, [voiceEnabled]);

  const addAIMessage = useCallback((text, autoSpeak = false) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text, time: new Date() }]);
      setIsTyping(false);
      if (autoSpeak) speak(text);
    }, 600);
  }, [speak]);

  // Greeting on first open
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      const greeting = `Bienvenue sur la plateforme d'évaluation ISI SUPTECH ! Je suis votre assistant IA. ${PAGE_MESSAGES[location.pathname]?.(user?.name?.split(' ')[0] || 'Étudiant') || 'Je suis ici pour vous aider à naviguer.'}`;
      addAIMessage(greeting, true);
      setHasGreeted(true);
    }
  }, [isOpen, hasGreeted]);

  // Page change tips
  useEffect(() => {
    if (isOpen && hasGreeted) {
      const msg = PAGE_MESSAGES[location.pathname]?.('');
      if (msg) addAIMessage(msg.replace(/^/, '📍 '), false);
    }
  }, [location.pathname]);

  // Rotate tips
  useEffect(() => {
    const t = setInterval(() => setTipIndex(i => (i + 1) % CONTEXTUAL_TIPS.length), 10000);
    return () => clearInterval(t);
  }, []);

  // Auto-open after 3s on first load
  useEffect(() => {
    const t = setTimeout(() => {
      if (!hasGreeted) setIsOpen(true);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: inputText, time: new Date() }]);
    const userMsg = inputText.toLowerCase();
    setInputText('');

    let response = 'Je suis là pour vous guider dans l\'évaluation. Parcourez les différentes sections du menu pour remplir vos questionnaires.';

    if (userMsg.includes('evaluer') || userMsg.includes('comment')) {
      response = '📋 Pour évaluer un enseignant, retournez sur votre tableau de bord et cliquez sur une matière. Répondez aux 10 questions en choisissant A (50%), B (75%) ou C (100%).';
    } else if (userMsg.includes('qualite') || userMsg.includes('service')) {
      response = '🏫 Le questionnaire Qualité de Service vous permet d\'évaluer les différents services : secrétariat, direction, connexion, salle pratique, etc.';
    } else if (userMsg.includes('pdf') || userMsg.includes('rapport')) {
      response = '📄 L\'exportation des rapports PDF est disponible uniquement pour les administrateurs dans la section Rapports.';
    } else if (userMsg.includes('note') || userMsg.includes('score')) {
      response = '📊 Les notes sont calculées ainsi : A = 50%, B = 75%, C = 100%. Le score total est la moyenne de vos 10 réponses.';
    } else if (userMsg.includes('bonjour') || userMsg.includes('salut') || userMsg.includes('hello')) {
      response = `Bonjour ${user?.name?.split(' ')[0] || ''} ! 😊 Comment puis-je vous aider aujourd'hui ?`;
    } else if (userMsg.includes('merci')) {
      response = 'Avec plaisir ! 🌟 Votre participation est précieuse pour améliorer ISI SUPTECH. N\'hésitez pas si vous avez d\'autres questions !';
    }

    addAIMessage(response, voiceEnabled);
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      addAIMessage('⚠️ La reconnaissance vocale n\'est pas disponible sur ce navigateur. Essayez Chrome.', false);
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setInputText(text);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-110 transition-transform duration-200"
            style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}
          >
            <div className="relative">
              <Bot className="w-7 h-7 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            </div>
            {isSpeaking && (
              <div className="absolute inset-0 rounded-full border-4 border-blue-400/50 animate-ping" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20, originX: 1, originY: 1 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[520px] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-white/10"
            style={{ background: 'rgba(15,23,42,0.97)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 py-3 flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-blue-900" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-blue-900 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="text-white font-bold text-sm">IA SUPTECH</div>
                <div className="text-blue-300 text-xs flex items-center gap-1">
                  {isSpeaking ? (<><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />En train de parler...</>) : 'En ligne • Prêt à vous aider'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setVoiceEnabled(!voiceEnabled)} title="Voix"
                  className={`p-1.5 rounded-lg transition-colors ${voiceEnabled ? 'text-green-400 hover:text-green-300' : 'text-slate-500 hover:text-slate-400'}`}>
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tip banner */}
            <div className="bg-blue-900/40 border-b border-white/5 px-4 py-2">
              <AnimatePresence mode="wait">
                <motion.p key={tipIndex} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="text-blue-300 text-xs">{CONTEXTUAL_TIPS[tipIndex]}</motion.p>
              </AnimatePresence>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'ai' && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${msg.role === 'ai' ? 'ai-bubble text-white' : 'user-bubble text-white'}`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="ai-bubble px-4 py-3">
                      <div className="loading-dots flex gap-1">
                        <span className="w-1.5 h-1.5 bg-white/80 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-white/80 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-white/80 rounded-full" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 flex gap-2">
              <button onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-colors flex-shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-slate-400 hover:text-white hover:bg-white/15'}`}>
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <input value={inputText} onChange={e => setInputText(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                placeholder="Posez votre question..."
                className="flex-1 bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
              <button onClick={handleSend} disabled={!inputText.trim()}
                className="p-2.5 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
