import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { speechService } from '../services/speech';
import { ChatSession, ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CrisisModal } from '../components/chat/CrisisModal';
import { PageTransition, FadeIn } from '../components/motion/MotionWrapper';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  ShieldAlert,
  MessageSquare,
  Wind,
  HeartHandshake,
  Bot,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SUGGESTIONS = [
  'I am trapped in overthinking and catastrophizing',
  'Can we practice a 4-7-8 breathing exercise together?',
  'I made a mistake at work and my inner critic is very loud',
  'I am having trouble calming down before sleep',
  'Help me identify cognitive distortions in my thoughts'
];

export const UshaChatPage: React.FC = () => {
  const { user } = useAuth();
  const [aiName, setAiName] = useState<string>(speechService.getActiveAiName());
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [showCrisisModal, setShowCrisisModal] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false); // clean default for mobile

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Sync active AI name whenever user profile changes or local storage is updated
  useEffect(() => {
    setAiName(speechService.getActiveAiName());
  }, [user]);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/chat/sessions');
      if (res.data?.data?.sessions) {
        const list = res.data.data.sessions;
        setSessions(list);
        if (list.length > 0 && !currentSessionId) {
          setCurrentSessionId(list[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch chat sessions:', err);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      const res = await api.get(`/chat/sessions/${sessionId}/messages`);
      if (res.data?.data?.messages) {
        setMessages(res.data.data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (currentSessionId) {
      fetchMessages(currentSessionId);
    }
  }, [currentSessionId]);

  // Smoothly scroll only within the chat messages container
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleCreateSession = async () => {
    try {
      const res = await api.post('/chat/sessions', {
        title: `Reflection ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
      });
      if (res.data?.data?.session) {
        const newSession = res.data.data.session;
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        setMessages([
          {
            id: 'welcome',
            sessionId: newSession.id,
            role: 'usha',
            content: `Hello ${user ? user.name.split(' ')[0] : 'friend'}! I am ${aiName}, your dedicated CBT wellness companion.\n\nTake a slow, gentle breath. What is on your mind today?`,
            isCrisisTriggered: false,
            timestamp: new Date().toISOString(),
          }
        ]);
        setSidebarOpen(false);
      }
    } catch (err) {
      console.error('Error creating new session:', err);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/chat/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        const remaining = sessions.filter(s => s.id !== sessionId);
        if (remaining.length > 0) {
          setCurrentSessionId(remaining[0].id);
        } else {
          setCurrentSessionId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId: currentSessionId || '',
      role: 'user',
      content: text.trim(),
      isCrisisTriggered: false,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await api.post('/chat/message', {
        sessionId: currentSessionId || undefined,
        message: text.trim(),
        aiName,
      });

      const data = res.data?.data;
      if (data?.sessionId && (!currentSessionId || currentSessionId !== data.sessionId)) {
        setCurrentSessionId(data.sessionId);
        fetchSessions();
      }

      if (data?.ushaMessage) {
        const ushaMsg: ChatMessage = data.ushaMessage;
        setMessages(prev => [...prev, ushaMsg]);

        if (ushaMsg.isCrisisTriggered) {
          setShowCrisisModal(true);
        }

        if (isVoiceEnabled) {
          speechService.speak(ushaMsg.content);
        }
      }
    } catch (err) {
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

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bone-white border border-charcoal-soft/10 p-5 sm:p-7 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-deep text-sage-muted flex items-center justify-center shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-deep">
                {aiName} Wellness Studio
              </h1>
              <Badge variant="sage" size="sm">CBT Companion</Badge>
            </div>
            <p className="text-xs text-on-surface-variant">
              Continuous reflection with mindful CBT reframing, active listening, and evidence-based guidance.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Mobile Sessions Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2.5 bg-surface border border-charcoal-soft/15 rounded-xl text-slate-deep hover:bg-surface-container"
            title="Toggle Sessions Sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Voice Output Toggle */}
          <button
            onClick={() => {
              if (isVoiceEnabled) speechService.stopSpeaking();
              setIsVoiceEnabled(!isVoiceEnabled);
            }}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all ${
              isVoiceEnabled
                ? 'bg-slate-deep text-bone-white border-slate-deep shadow-sm'
                : 'bg-surface border-charcoal-soft/15 text-on-surface-variant hover:text-slate-deep'
            }`}
            title={isVoiceEnabled ? 'Voice output enabled' : 'Voice output muted'}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isVoiceEnabled ? 'Voice On' : 'Muted'}</span>
          </button>

          {/* Settings Customization Link */}
          <Link to="/settings#customization">
            <button
              className="p-2.5 rounded-xl border border-charcoal-soft/15 bg-surface text-slate-deep hover:bg-surface-container transition-all flex items-center space-x-2 text-xs font-semibold"
              title="Customize Name & Voice"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Customize</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[72vh] min-h-[550px]">
        {/* 1. Sessions Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } md:block md:col-span-1 bg-bone-white border border-charcoal-soft/10 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between overflow-hidden`}
        >
          <div className="space-y-3 overflow-hidden flex flex-col flex-1">
            <div className="flex items-center justify-between border-b border-charcoal-soft/10 pb-3">
              <span className="text-xs font-serif font-bold text-slate-deep uppercase tracking-wider">
                Reflections
              </span>
              <Button
                variant="sage"
                size="sm"
                onClick={handleCreateSession}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                New
              </Button>
            </div>

            <div className="space-y-2 overflow-y-auto pr-1 flex-1">
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-xs text-on-surface-variant italic">
                  No previous sessions.<br />Start a fresh conversation!
                </div>
              ) : (
                sessions.map((s) => {
                  const isSelected = currentSessionId === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        setCurrentSessionId(s.id);
                        setSidebarOpen(false);
                      }}
                      className={`p-3 rounded-xl cursor-pointer text-xs transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'bg-slate-deep text-bone-white font-semibold shadow-sm'
                          : 'bg-surface/70 hover:bg-surface-container text-slate-deep border border-charcoal-soft/10'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate mr-2">
                        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{s.title}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(s.id, e)}
                        className={`opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity ${
                          isSelected ? 'text-bone-white/70' : 'text-on-surface-variant'
                        }`}
                        title="Delete reflection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Grounding Hint Card */}
          <div className="pt-3 border-t border-charcoal-soft/10 text-[11px] text-on-surface-variant flex items-center space-x-2 bg-surface-container/40 p-3 rounded-xl">
            <Wind className="w-4 h-4 text-clinical-blue flex-shrink-0" />
            <span>Need a quick pause? Ask for the 4-7-8 breathing pacer.</span>
          </div>
        </div>

        {/* 2. Main Chat Conversation Area */}
        <div className="md:col-span-3 bg-bone-white border border-charcoal-soft/10 rounded-2xl flex flex-col shadow-sm overflow-hidden">
          {/* Messages Scroll Area */}
          <div
            ref={chatContainerRef}
            className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto bg-surface/30"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6 py-12">
                <div className="w-16 h-16 rounded-3xl bg-sage-light text-slate-deep flex items-center justify-center shadow-inner">
                  <Sparkles className="w-8 h-8 text-slate-deep" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-deep">
                    A Quiet Place to Check In
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Say whatever is on your mind. {aiName} is listening with clinical empathy, memory of your recent conversation, and evidence-based CBT techniques.
                  </p>
                </div>

                <div className="w-full space-y-2 pt-2">
                  <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
                    Suggested prompts to begin:
                  </span>
                  <div className="flex flex-col gap-2">
                    {SUGGESTIONS.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(sug)}
                        className="text-left px-4 py-2.5 bg-surface border border-charcoal-soft/15 rounded-xl text-xs text-slate-deep hover:bg-surface-container hover:border-clinical-blue transition-all"
                      >
                        "{sug}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id || idx}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                  >
                    <div className="flex items-center space-x-2 text-[10px] text-on-surface-variant px-1">
                      <span className="font-bold">{isUser ? 'You' : aiName}</span>
                      <span>•</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      className={`max-w-xl sm:max-w-2xl px-5 py-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-slate-deep text-bone-white rounded-tr-sm shadow-md'
                          : msg.isCrisisTriggered
                          ? 'bg-rose-50 border-2 border-rose-300 text-rose-900 rounded-tl-sm shadow-md'
                          : 'bg-surface border border-charcoal-soft/15 text-slate-deep rounded-tl-sm shadow-sm'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Suggested Action Chips */}
                    {!isUser && msg.metadata?.suggestedActions && msg.metadata.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1.5 pl-1">
                        {msg.metadata.suggestedActions.map((action, ai) => (
                          <button
                            key={ai}
                            onClick={() => handleSendMessage(action)}
                            className="px-3 py-1 bg-sage-light/80 hover:bg-sage-light text-slate-deep border border-sage-accent/30 rounded-lg text-[11px] font-semibold transition-all shadow-xs"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="flex items-center space-x-2.5 text-xs text-on-surface-variant pl-2 py-2">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-deep animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-slate-deep animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-slate-deep animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="italic font-serif">{aiName} is thinking...</span>
              </div>
            )}
          </div>

          {/* Composer Input Bar */}
          <div className="p-4 sm:p-5 border-t border-charcoal-soft/10 bg-bone-white space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-3"
            >
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className={`p-3 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-md'
                    : 'bg-surface border-charcoal-soft/20 text-slate-deep hover:bg-surface-container'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Voice input (Dictate)'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Share what you are feeling with ${aiName}...`}
                className="flex-1 px-4 py-3 text-xs sm:text-sm bg-surface border border-charcoal-soft/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-clinical-blue text-slate-deep shadow-inner"
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!inputText.trim() || isTyping}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Send
              </Button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-on-surface-variant px-1">
              <span>{aiName} uses evidence-based CBT methods. Not a replacement for emergency clinical care.</span>
              <span className="hidden sm:inline">24/7 Helpline: 9152987821</span>
            </div>
          </div>
        </div>
      </div>

      <CrisisModal isOpen={showCrisisModal} onClose={() => setShowCrisisModal(false)} />
    </PageTransition>
  );
};
