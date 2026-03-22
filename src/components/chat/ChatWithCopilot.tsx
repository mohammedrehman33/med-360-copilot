'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { ChatMessage } from '@/types';

// ---------------------------------------------------------------------------
// Quick check-in chip data
// ---------------------------------------------------------------------------
const quickChips = [
  { label: 'Emergency care', icon: 'emergency', action: 'navigate' as const, path: '/triage' },
  { label: 'Symptom identification', icon: 'symptoms', action: 'message' as const, message: 'I want to describe my symptoms and get guidance' },
  { label: 'Medication', icon: 'medication', action: 'message' as const, message: 'I need information about a medication I am taking' },
  { label: 'Providing instructions', icon: 'clinical_notes', action: 'message' as const, message: 'I need guidance on preparing for a medical test or following medication instructions' },
] as const;

// ---------------------------------------------------------------------------
// Audio waveform bars animation
// ---------------------------------------------------------------------------
function AudioWaveform({ active }: { active: boolean }) {
  const barCount = 40;
  return (
    <div className="flex items-center justify-center gap-[3px] h-16 px-6 my-4">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{
            background: active
              ? 'rgba(255,255,255,0.8)'
              : 'rgba(255,255,255,0.25)',
          }}
          animate={{
            height: active
              ? [8, Math.random() * 40 + 12, 8]
              : [4, Math.random() * 16 + 6, 4],
          }}
          transition={{
            duration: active ? 0.5 + Math.random() * 0.3 : 1.2 + Math.random() * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.03,
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Message bubble
// ---------------------------------------------------------------------------
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-end"
      >
        <div className="bg-white/20 backdrop-blur-md text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-[85%]">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className="text-[10px] text-white/50 mt-1">{time}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2"
    >
      <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
        <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
      </div>
      <div className="flex flex-col">
        <div className="bg-white/90 text-[#00345e] rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%] shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className="text-[10px] text-white/50 mt-1">{time}</span>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Typing indicator
// ---------------------------------------------------------------------------
function TypingIndicator() {
  return (
    <div className="flex items-start gap-2">
      <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
      </div>
      <div className="flex gap-1.5 px-4 py-3 bg-white/90 rounded-2xl rounded-bl-sm">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-[#0D9488] rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function ChatWithCopilot() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  // ------------------------------------------------------------------
  // Send message (supports streaming)
  // ------------------------------------------------------------------
  const sendMessage = async (overrideText?: string) => {
    const text = overrideText || input.trim();
    if (!text || isLoading) return;

    setShowWelcome(false);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('Chat request failed');

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantId = crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', timestamp: new Date().toISOString() },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: assistantContent } : m)),
        );
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Voice input (Web Speech API)
  // ------------------------------------------------------------------
  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SR =
      (window as any).SpeechRecognition || // eslint-disable-line @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const transcript: string = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleChipClick = (chip: typeof quickChips[number]) => {
    if (chip.action === 'navigate') {
      router.push(chip.path);
    } else {
      sendMessage(chip.message);
    }
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div
      className="relative rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(13,148,136,0.25)]"
      style={{ minHeight: '520px', maxHeight: '620px' }}
    >
      {/* Teal-to-mint gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D9488] via-[#14B8A6] to-[#5EEAD4]/60" />

      {/* Soft light overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 80%, rgba(255,255,255,0.15) 0%, transparent 60%)',
        }}
      />

      {/* Content */}
      <div
        className="relative z-[1] flex flex-col"
        style={{ minHeight: '520px', maxHeight: '620px' }}
      >
        {/* ---- Welcome state ---- */}
        {showWelcome && messages.length === 0 ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col flex-1"
            >
              {/* Hero text */}
              <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-4">
                <motion.h2
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white text-3xl md:text-4xl font-bold font-headline text-center mb-2"
                >
                  Hello!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-white/90 text-lg md:text-xl text-center leading-relaxed max-w-md"
                >
                  How can I help you{' '}
                  <span className="font-bold text-white">feel better</span> today?
                </motion.p>

                {/* Audio waveform */}
                <AudioWaveform active={isListening} />
              </div>

              {/* Quick check-in chips — horizontal scroll */}
              <div className="px-4 pb-4">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory justify-center">
                  {quickChips.map((chip) => (
                    <motion.button
                      key={chip.label}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleChipClick(chip)}
                      className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2.5 text-sm font-medium text-[#0F766E] whitespace-nowrap flex-shrink-0 snap-start shadow-sm hover:bg-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-base" style={{ fontSize: '18px' }}>
                        {chip.icon}
                      </span>
                      {chip.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Bottom input bar */}
              <div className="px-4 pb-5">
                <div className="flex items-center gap-2 justify-center">
                  {/* Search button */}
                  <button
                    type="button"
                    onClick={() => setShowWelcome(false)}
                    className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-colors"
                  >
                    <span className="material-symbols-outlined">search</span>
                  </button>

                  {/* Mic button (large, centered) */}
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                      isListening
                        ? 'bg-white text-[#0D9488] scale-110'
                        : 'bg-white/90 text-[#0D9488] hover:bg-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl">
                      {isListening ? 'hearing' : 'mic'}
                    </span>
                  </button>

                  {/* Close/type button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowWelcome(false);
                      // Focus input after transition
                      setTimeout(() => {
                        document.querySelector<HTMLInputElement>('.chat-input-field')?.focus();
                      }, 400);
                    }}
                    className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-colors"
                  >
                    <span className="material-symbols-outlined">keyboard</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ---- Chat conversation state ---- */
            <div
              className="flex flex-col flex-1"
              style={{ minHeight: '520px', maxHeight: '620px' }}
            >
              {/* Chat header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm">
                    <span className="material-symbols-outlined text-white">smart_toy</span>
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-sm font-headline">PharmaAI Copilot</h2>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
                      <span className="text-white/60 text-xs">Online</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (messages.length === 0) setShowWelcome(true);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">home</span>
                </button>
              </div>

              {/* Quick chips (compact row) */}
              <div className="px-3 py-2 border-b border-white/5">
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                  {quickChips.map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => handleChipClick(chip)}
                      className="flex items-center gap-1 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5 text-xs font-medium text-white/80 whitespace-nowrap flex-shrink-0 transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                        {chip.icon}
                      </span>
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages area — scrollable */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 overscroll-contain"
                style={{ maxHeight: 'calc(620px - 180px)' }}
              >
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div className="p-3 border-t border-white/10">
                <div className="flex items-center gap-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-lg">
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isListening
                        ? 'bg-[#0D9488] text-white'
                        : 'hover:bg-[#F0FDFA] text-[#0D9488]'
                    }`}
                  >
                    <span className="material-symbols-outlined">
                      {isListening ? 'hearing' : 'mic'}
                    </span>
                  </button>

                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Write something..."
                    className="chat-input-field flex-1 bg-transparent outline-none text-sm text-[#00345e] placeholder:text-[#94A3B8]"
                  />

                  <button
                    type="button"
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 rounded-full bg-[#0D9488] flex items-center justify-center text-white disabled:opacity-40 transition-all hover:bg-[#0F766E]"
                  >
                    <span className="material-symbols-outlined text-lg">send</span>
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
