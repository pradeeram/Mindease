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
  Bot
} from 'lucide-react';

const SUGGESTIONS = [
  'I am trapped in overthinking and catastrophizing',
  'Can we practice a 4-7-8 breathing exercise together?',
  'I made a mistake at work and my inner critic is very loud',
  'I am having trouble calming down before sleep',
  'Help me identify cognitive distortions in my thoughts'
];

export const UshaChatPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [showCrisisModal, setShowCrisisModal] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  // Smoothly scroll only within the chat messages container to keep outer page centered
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
            content: `Hello ${user ? user.name.split(' ')[0] : 'friend'}. I am USHA, your CBT wellness companion.\n\nTake a slow breath. What is on your mind today?`,
            isCrisisTriggered: false,
            timestamp: new Date().toISOString(),
          }
        ]);
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
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col">
      {/* Studio Header */}
      <div className="flex items-center justify-between border-b border-charcoal-soft/10 pb-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-deep to-clinical-blue text-sage-muted flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-serif font-bold text-slate-deep">
                USHA AI Companion Studio
              </h1>
              <Badge variant="sage">Voice & Text</Badge>
            </div>
            <p className="text-xs text-on-surface-variant">
              Empathetic, CBT-grounded conversations with automated crisis safety guardrails.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setIsVoiceEnabled(!isVoiceEnabled);
              if (isVoiceEnabled) speechService.stopSpeaking();
            }}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
              isVoiceEnabled
                ? 'bg-sage-light text-slate-deep border-sage-accent/40'
                : 'bg-surface text-on-surface-variant border-charcoal-soft/15'
            }`}
          >
            {isVoiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-error" />}
            <span className="hidden sm:inline">{isVoiceEnabled ? 'Voice Output ON' : 'Muted'}</span>
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateSession}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Session
          </Button>
        </div>
      </div>

      {/* Main Workspace Layout (Sidebar + Chat Area) */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Sessions Sidebar */}
        <div className={`w-64 bg-bone-white border border-charcoal-soft/10 rounded-xl p-3 flex-col hidden md:flex ${sidebarOpen ? '' : 'w-12'}`}>
          <div className="flex items-center justify-between pb-2 border-b border-charcoal-soft/10 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-deep">
              Past Reflections
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5">
            {sessions.map((s) => {
              const isSelected = currentSessionId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setCurrentSessionId(s.id)}
                  className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-surface-container text-slate-deep font-bold border-slate-deep/30'
                      : 'bg-surface/50 text-on-surface hover:bg-surface-container/60 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <MessageSquare className="w-3.5 h-3.5 text-on-surface-variant flex-shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-error rounded transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Studio Area */}
        <div className="flex-1 bg-bone-white border border-charcoal-soft/10 rounded-xl flex flex-col overflow-hidden shadow-sm">
          {/* Audio Wave Visualizer when Voice is Active */}
          {isListening && (
            <div className="bg-sage-light border-b border-sage-accent/30 p-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 h-6">
                  <span className="w-1 bg-slate-deep rounded-full wave-bar" />
                  <span className="w-1 bg-clinical-blue rounded-full wave-bar" />
                  <span className="w-1 bg-sage-accent rounded-full wave-bar" />
                  <span className="w-1 bg-slate-deep rounded-full wave-bar" />
                  <span className="w-1 bg-clinical-blue rounded-full wave-bar" />
                </div>
                <span className="text-xs font-semibold text-slate-deep">
                  USHA is listening... speak your thoughts naturally.
                </span>
              </div>
              <Button size="sm" variant="sage" onClick={handleToggleVoiceInput}>
                Finish Speaking
              </Button>
            </div>
          )}

          {/* Messages Feed */}
          <div ref={chatContainerRef} className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-surface/40">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 py-8">
                <div className="w-14 h-14 rounded-2xl bg-slate-deep text-sage-muted flex items-center justify-center shadow-lg">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-serif font-bold text-slate-deep">Welcome to USHA Studio</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    A safe, compassionate space to unpack anxious thoughts, practice CBT reframing, or engage in calming breathing exercises.
                  </p>
                </div>

                {/* Prompt Suggestion Pills */}
                <div className="w-full space-y-2 pt-2">
                  <span className="text-[11px] font-semibold text-slate-deep block">Try asking:</span>
                  {SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(suggestion)}
                      className="w-full text-left p-2.5 bg-bone-white border border-charcoal-soft/15 rounded-lg text-xs hover:border-clinical-blue hover:bg-surface-container transition-all"
                    >
                      "{suggestion}"
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-slate-deep text-bone-white rounded-br-none shadow-sm'
                        : m.isCrisisTriggered
                        ? 'bg-error-container border-2 border-error/40 text-on-error-container rounded-bl-none shadow-md'
                        : 'bg-bone-white border border-charcoal-soft/15 text-on-surface rounded-bl-none shadow-sm'
                    }`}
                  >
                    {m.content}

                    {m.isCrisisTriggered && (
                      <div className="mt-3 pt-3 border-t border-error/30 flex items-center justify-between text-xs">
                        <span className="font-bold flex items-center">
                          <ShieldAlert className="w-4 h-4 mr-1 text-error" />
                          Emergency Lifeline Available (988)
                        </span>
                        <button
                          onClick={() => setShowCrisisModal(true)}
                          className="px-2.5 py-1 bg-error text-white font-bold rounded hover:bg-red-700 transition-colors"
                        >
                          View 24/7 Hotlines
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Suggestion action pills from USHA */}
                  {m.metadata?.suggestedActions && m.metadata.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.metadata.suggestedActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(action)}
                          className="px-3 py-1 bg-sage-light text-slate-deep border border-sage-accent/30 rounded-full text-xs font-semibold hover:bg-sage-accent/30 transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-on-surface-variant mt-1 px-1">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}

            {isTyping && (
              <div className="flex items-center space-x-1.5 p-3 bg-bone-white border border-charcoal-soft/15 rounded-2xl rounded-bl-none w-20 shadow-sm">
                <span className="w-2 h-2 bg-clinical-blue rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-clinical-blue rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-clinical-blue rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 sm:p-4 bg-bone-white border-t border-charcoal-soft/10 flex items-center space-x-2"
          >
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className={`p-2.5 rounded-full transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-md'
                  : 'text-clinical-blue hover:bg-surface-container'
              }`}
              title="Voice Input (STT)"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? 'Listening to your voice...' : 'Type a reflection, automatic thought, or question...'}
              className="flex-1 px-4 py-2.5 text-sm bg-surface border border-charcoal-soft/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-clinical-blue focus:bg-bone-white"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputText.trim() || isTyping}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      <CrisisModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
      />
    </PageTransition>
  );
};
