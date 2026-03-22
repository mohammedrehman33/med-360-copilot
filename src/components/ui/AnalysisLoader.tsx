'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisLoaderProps {
  estimatedSeconds: number;
  agentCount: number;
  variant: 'prescription' | 'triage' | 'lab';
}

const STATUS_MESSAGES: Record<AnalysisLoaderProps['variant'], string[]> = {
  prescription: [
    'Identifying medications...',
    'Checking drug interactions...',
    'Analyzing dosages...',
    'Cross-referencing contraindications...',
    'Finding alternatives...',
    'Evaluating patient safety...',
    'Generating patient guide...',
    'Almost there...',
  ],
  triage: [
    'Reviewing symptoms...',
    'Cross-referencing conditions...',
    'Evaluating clinical patterns...',
    'Assessing urgency level...',
    'Checking red-flag indicators...',
    'Preparing recommendations...',
    'Almost there...',
  ],
  lab: [
    'Processing lab data...',
    'Parsing test results...',
    'Comparing with reference ranges...',
    'Identifying abnormal values...',
    'Correlating biomarkers...',
    'Generating interpretation...',
    'Almost there...',
  ],
};

const VARIANT_ICONS: Record<AnalysisLoaderProps['variant'], string> = {
  prescription: 'medication',
  triage: 'emergency',
  lab: 'biotech',
};

const HEALTH_TIPS = [
  'Drinking water can help reduce headaches by up to 70%.',
  'Walking for just 20 minutes a day lowers heart disease risk by 30%.',
  'Deep breathing for 60 seconds can measurably lower blood pressure.',
  'Laughing increases blood flow by 20%, similar to light exercise.',
  'A handful of almonds contains as much calcium as 1/4 cup of milk.',
  'Honey has natural antibacterial properties and never spoils.',
  'Your nose can detect over 1 trillion different scents.',
  'The human body contains enough iron to make a 3-inch nail.',
  'Sleeping on your left side can ease heartburn symptoms.',
  'Dark chocolate can improve brain function and blood flow.',
  'Turmeric contains curcumin, a powerful natural anti-inflammatory.',
  'Your heart beats about 100,000 times every single day.',
];

export default function AnalysisLoader({
  estimatedSeconds,
  agentCount,
  variant,
}: AnalysisLoaderProps) {
  const [elapsed, setElapsed] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * HEALTH_TIPS.length));

  const messages = STATUS_MESSAGES[variant];
  const icon = VARIANT_ICONS[variant];

  // Elapsed timer - tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate status messages every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [messages.length]);

  // Rotate health tips every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % HEALTH_TIPS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const progress = useMemo(() => {
    // Ease-out curve so it slows down near the end and never quite reaches 100%
    const raw = elapsed / estimatedSeconds;
    // Asymptotic approach: fast at start, slows near 95%
    return Math.min(raw < 1 ? raw * 92 : 92 + (1 - Math.exp(-(raw - 1) * 2)) * 7, 99);
  }, [elapsed, estimatedSeconds]);

  const remainingSeconds = useMemo(() => {
    return Math.max(0, estimatedSeconds - elapsed);
  }, [elapsed, estimatedSeconds]);

  const formatTime = useCallback((seconds: number): string => {
    if (seconds <= 0) return 'finishing up...';
    if (seconds < 60) {
      return '~' + seconds + 's remaining';
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return '~' + mins + 'm ' + secs + 's remaining';
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="rounded-2xl bg-white p-8 shadow-[var(--shadow-float)]">
        {/* Animated pulse icon + DNA helix */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            {/* Outer pulsing ring */}
            <div className="absolute inset-0 rounded-full agent-pulse" />

            {/* Animated DNA helix SVG */}
            <div className="w-20 h-20 rounded-full bg-[#DBEAFE] flex items-center justify-center relative overflow-hidden">
              {/* Background helix animation */}
              <svg
                className="absolute inset-0 w-full h-full opacity-20"
                viewBox="0 0 80 80"
                fill="none"
              >
                <g>
                  <motion.path
                    d="M20 10 Q40 20 60 10 Q40 30 20 20 Q40 40 60 30 Q40 50 20 40 Q40 60 60 50 Q40 70 20 60"
                    stroke="#3B82F6"
                    strokeWidth="1.5"
                    fill="none"
                    initial={{ pathOffset: 0 }}
                    animate={{ pathOffset: 1 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.path
                    d="M60 10 Q40 20 20 10 Q40 30 60 20 Q40 40 20 30 Q40 50 60 40 Q40 60 20 50 Q40 70 60 60"
                    stroke="#7C3AED"
                    strokeWidth="1.5"
                    fill="none"
                    initial={{ pathOffset: 0 }}
                    animate={{ pathOffset: 1 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 0.5 }}
                  />
                  {/* Connecting rungs */}
                  {[15, 25, 35, 45, 55].map((y, i) => (
                    <motion.line
                      key={i}
                      x1="28"
                      y1={y}
                      x2="52"
                      y2={y}
                      stroke="#3B82F6"
                      strokeWidth="1"
                      opacity="0.3"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: [0, 1, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.4,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </g>
              </svg>

              {/* Center icon */}
              <motion.span
                className="material-symbols-outlined text-[#3B82F6] relative z-10"
                style={{ fontSize: '32px' }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {icon}
              </motion.span>
            </div>
          </div>
        </div>

        {/* Rotating status message */}
        <div className="text-center mb-6 h-7 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              className="text-sm font-semibold text-[#00345e] absolute inset-x-0"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {messages[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-2 rounded-full bg-[#EFF6FF] overflow-hidden">
            <motion.div
              className="h-full rounded-full relative overflow-hidden"
              style={{
                background: 'linear-gradient(90deg, #3B82F6, #7C3AED)',
              }}
              initial={{ width: '0%' }}
              animate={{ width: progress + '%' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {/* Shimmer overlay on the progress bar */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
            </motion.div>
          </div>

          {/* Progress stats row */}
          <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-center gap-1.5">
              <span
                className="material-symbols-outlined text-[#475569] animate-spin"
                style={{ fontSize: '14px', animationDuration: '2s' }}
              >
                progress_activity
              </span>
              <span className="text-xs text-[#475569]">
                {agentCount} AI agent{agentCount !== 1 ? 's' : ''} working
              </span>
            </div>
            <span className="text-xs font-medium text-[#3B82F6]">
              {formatTime(remainingSeconds)}
            </span>
          </div>
        </div>

        {/* Agent activity indicators */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {Array.from({ length: agentCount }).map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[#3B82F6]"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: i * 0.25,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Pulse line animation */}
        <div className="mb-6 overflow-hidden rounded-xl bg-[#f8f9ff] p-3">
          <svg
            viewBox="0 0 400 60"
            className="w-full h-10"
            fill="none"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M0 30 L60 30 L80 30 L90 10 L100 50 L110 20 L120 40 L130 30 L200 30 L220 30 L230 12 L240 48 L250 22 L260 38 L270 30 L340 30 L400 30"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.4 }}
              animate={{ pathLength: 1, opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Glow trail */}
            <motion.path
              d="M0 30 L60 30 L80 30 L90 10 L100 50 L110 20 L120 40 L130 30 L200 30 L220 30 L230 12 L240 48 L250 22 L260 38 L270 30 L340 30 L400 30"
              stroke="#DBEAFE"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>
        </div>

        {/* Health tip */}
        <div className="rounded-xl bg-[#EDE9FE]/10 p-4">
          <div className="flex items-start gap-3">
            <span
              className="material-symbols-outlined text-[#7C3AED] shrink-0 animate-float"
              style={{ fontSize: '20px' }}
            >
              lightbulb
            </span>
            <div className="min-h-[40px] relative overflow-hidden flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tipIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-[11px] font-medium text-[#7C3AED] mb-0.5">Did you know?</p>
                  <p className="text-xs text-[#7C3AED]/80 leading-relaxed">
                    {HEALTH_TIPS[tipIndex]}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
