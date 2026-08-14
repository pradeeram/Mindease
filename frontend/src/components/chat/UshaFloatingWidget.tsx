import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, X, Send, Mic, MicOff, Volume2, VolumeX, Maximize2, ShieldAlert } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { speechService } from '../../services/speech';
import { ChatMessage } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { CrisisModal } from './CrisisModal';

export const UshaFloatingWidget: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [aiName, setAiName] = useState<string>(speechService.getActiveAiName());
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [showCrisisModal, setShowCrisisModal] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Don't show floating widget if already on the dedicated /chat page
  const isChatPage = location.pathname === '/chat';

  useEffect(() => {
    setAiName(speechService.getActiveAiName());
  }, [user]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sessionId: '',
          role: 'usha',
          content: `Hello ${user ? user.name.split(' ')[0] : 'friend'}! I am ${aiName}, your CBT wellness companion. How are you feeling in your mind and body right now?`,
          isCrisisTriggered: false,
          timestamp: new Date().toISOString(),
        }
      ]);
    }
  }, [isOpen, user, aiName]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId: sessionId || '',
      role: 'user',
      content: text.trim(),
      isCrisisTriggered: false,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      if (user) {
        const res = await api.post('/chat/message', {
          sessionId,
          message: text.trim(),
          aiName,
        });

        const data = res.data?.data;
        if (data?.sessionId) setSessionId(data.sessionId);

        if (data?.ushaMessage) {
          const ushaMsg: ChatMessage = data.ushaMessage;
          setMessages(prev => [...prev, ushaMsg]);

          if (ushaMsg.isCrisisTriggered) {
            setShowCrisisModal(true);
          }

          // Voice playback if enabled
          if (isVoiceEnabled) {
            speechService.speak(ushaMsg.content);
          }
        }
      } else {
        // Fallback for guest users before login
        setTimeout(() => {
          const guestReply: ChatMessage = {
            id: `guest-${Date.now()}`,
            sessionId: '',
            role: 'usha',
            content: `Thank you for reaching out. Please sign in or create an account to securely save your reflections with ${aiName}.`,
            isCrisisTriggered: false,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, guestReply]);
          setIsTyping(false);
        }, 600);
        return;
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleToggleVoiceInput = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      const started = speechService.startListening(
        (transcript, isFinal) => {
          setInputText(transcript);
          if (isFinal) {
            handleSendMessage(transcript);
          }
        },
        (err) => {
          console.warn('Speech recognition error:', err);
          setIsListening(false);
        },
        () => setIsListening(false)
      );
      if (started) setIsListening(true);
    }
  };

  if (isChatPage) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-80 sm:w-96 h-[500px] bg-bone-white border border-charcoal-soft/15 shadow-2xl rounded-2xl flex flex-col overflow-hidden mb-4 glass-card"
            >
              {/* Header */}
              <div className="p-3.5 bg-slate-deep text-bone-white flex items-center justify-between border-b border-charcoal-soft/20">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-sage-accent/20 border border-sage-accent/40 flex items-center justify-center text-sage-muted">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-serif font-bold tracking-wide">{aiName} Companion</div>
                    <div className="text-[10px] text-sage-muted/90 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                      CBT Wellness Assistant
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      setIsVoiceEnabled(!isVoiceEnabled);
                      if (isVoiceEnabled) speechService.stopSpeaking();
                    }}
                    className="p-1.5 text-bone-white/80 hover:text-white rounded hover:bg-white/10"
                    title={isVoiceEnabled ? 'Mute Voice' : 'Enable Voice'}
                  >
                    {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-300" />}
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/chat');
                    }}
                    className="p-1.5 text-bone-white/80 hover:text-white rounded hover:bg-white/10"
                    title="Open Full Chat Studio"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      speechService.stopSpeaking();
                      speechService.stopListening();
                      setIsOpen(false);
                    }}
                    className="p-1.5 text-bone-white/80 hover:text-white rounded hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Messages List */}
              <div ref={chatContainerRef} className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-surface/50 text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-xl whitespace-pre-wrap leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-slate-deep text-bone-white rounded-br-none shadow-sm'
                          : m.isCrisisTriggered
                          ? 'bg-error-container/70 border border-error/30 text-on-error-container rounded-bl-none'
                          : 'bg-bone-white border border-charcoal-soft/10 text-on-surface rounded-bl-none shadow-sm'
                      }`}
                    >
                      {m.content}
                    </div>

                    {/* Quick suggestion pills */}
                    {m.metadata?.suggestedActions && m.metadata.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {m.metadata.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(action)}
                            className="px-2 py-0.5 bg-sage-light text-slate-deep border border-sage-accent/30 rounded-full text-[10px] font-medium hover:bg-sage-accent/30 transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center space-x-1 p-2 bg-bone-white rounded-lg border border-charcoal-soft/10 w-16">
                    <span className="w-1.5 h-1.5 bg-clinical-blue rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-clinical-blue rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-clinical-blue rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
              </div>

              {/* Speech Visualizer Banner (when recording) */}
              {isListening && (
                <div className="bg-sage-light border-t border-sage-accent/20 px-3 py-1.5 flex items-center justify-between text-xs text-slate-deep animate-pulse">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="font-semibold">Listening... speak your thought</span>
                  </div>
                  <button
                    onClick={handleToggleVoiceInput}
                    className="text-[10px] text-clinical-blue underline font-bold"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-2.5 bg-bone-white border-t border-charcoal-soft/10 flex items-center space-x-2"
              >
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  className={`p-2 rounded-full transition-colors ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'text-clinical-blue hover:bg-surface-container'
                  }`}
                  title={`Speak to ${aiName}`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isListening ? 'Listening...' : `Message ${aiName}...`}
                  className="flex-1 px-3 py-1.5 text-xs bg-surface border border-charcoal-soft/15 rounded-lg focus:outline-none focus:ring-1 focus:ring-clinical-blue"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="p-2 bg-slate-deep text-bone-white rounded-full hover:bg-primary disabled:opacity-40 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Circle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-slate-deep to-clinical-blue text-bone-white shadow-xl flex items-center justify-center border-2 border-sage-muted/30 focus:outline-none focus:ring-4 focus:ring-sage-accent/30 group relative"
          aria-label={`Open ${aiName} Companion`}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Sparkles className="w-6 h-6 text-sage-muted group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </>
          )}
        </motion.button>
      </div>

      <CrisisModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
      />
    </>
  );
};
