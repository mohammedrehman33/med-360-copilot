'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareResultModalProps {
  title: string;
  summary: string;
  isOpen: boolean;
  onClose: () => void;
}

const COUNTRY_CODES = [
  { code: '+92', country: 'PK', flag: '🇵🇰' },
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+971', country: 'AE', flag: '🇦🇪' },
  { code: '+966', country: 'SA', flag: '🇸🇦' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
];

export default function ShareResultModal({
  title,
  summary,
  isOpen,
  onClose,
}: ShareResultModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+92');
  const [copied, setCopied] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setShowCountryDropdown(false);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const shareText = `${title}\n\n${summary}`;
  const encodedText = encodeURIComponent(shareText);
  const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;

  const handleWhatsApp = useCallback(() => {
    const url = phoneNumber.trim()
      ? `https://wa.me/${fullPhone.replace('+', '')}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [phoneNumber, fullPhone, encodedText]);

  const handleSMS = useCallback(() => {
    const recipient = phoneNumber.trim() ? fullPhone : '';
    window.open(`sms:${recipient}?body=${encodedText}`, '_self');
  }, [phoneNumber, fullPhone, encodedText]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  }, [shareText]);

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Glassmorphism overlay */}
          <motion.div
            className="absolute inset-0 bg-[#000f21]/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal card */}
          <motion.div
            className="relative w-full max-w-md mx-4 bg-white rounded-2xl p-8 shadow-[var(--shadow-float)] z-10 max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#DBEAFE] flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-[#3B82F6]"
                    style={{ fontSize: '22px' }}
                  >
                    share
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#00345e]">Share Results</h2>
                  <p className="text-xs text-[#475569]">Send this analysis to anyone</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] flex items-center justify-center transition-colors"
              >
                <span
                  className="material-symbols-outlined text-[#475569]"
                  style={{ fontSize: '20px' }}
                >
                  close
                </span>
              </button>
            </div>

            {/* Preview snippet */}
            <div className="rounded-xl bg-[#f8f9ff] p-4 mb-6">
              <p className="text-sm font-medium text-[#00345e] mb-1 truncate">{title}</p>
              <p className="text-xs text-[#475569] line-clamp-3 leading-relaxed">{summary}</p>
            </div>

            {/* Phone number input */}
            <div className="mb-6">
              <label className="text-xs font-medium text-[#475569] mb-2 block">
                Recipient phone (optional)
              </label>
              <div className="flex gap-2">
                {/* Country code selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center gap-1.5 h-11 px-3 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] transition-colors text-sm text-[#00345e] font-medium min-w-[90px]"
                  >
                    <span className="text-base">{selectedCountry.flag}</span>
                    <span>{countryCode}</span>
                    <span
                      className="material-symbols-outlined text-[#475569]"
                      style={{ fontSize: '16px' }}
                    >
                      expand_more
                    </span>
                  </button>

                  <AnimatePresence>
                    {showCountryDropdown && (
                      <motion.div
                        className="absolute top-full left-0 mt-1 w-44 bg-white rounded-xl shadow-[var(--shadow-float)] z-20 overflow-hidden"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                      >
                        {COUNTRY_CODES.map((c) => (
                          <button
                            key={c.code}
                            onClick={() => {
                              setCountryCode(c.code);
                              setShowCountryDropdown(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                              countryCode === c.code
                                ? 'bg-[#DBEAFE] text-[#3B82F6] font-medium'
                                : 'text-[#00345e] hover:bg-[#f8f9ff]'
                            }`}
                          >
                            <span className="text-base">{c.flag}</span>
                            <span>{c.code}</span>
                            <span className="text-[#475569] text-xs ml-auto">{c.country}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Phone input */}
                <input
                  type="tel"
                  placeholder="3001234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 h-11 px-4 rounded-xl bg-[#EFF6FF] text-sm text-[#00345e] placeholder:text-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-shadow"
                />
              </div>
            </div>

            {/* Share options */}
            <div className="space-y-3">
              {/* WhatsApp */}
              <button
                onClick={handleWhatsApp}
                className="w-full group flex items-center gap-4 p-4 rounded-xl bg-[#f0fdf4] hover:bg-[#dcfce7] transition-all duration-200 hover:shadow-[0_4px_20px_-6px_rgba(37,211,102,0.15)]"
              >
                <div className="w-12 h-12 rounded-xl bg-[#25D366]/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#00345e]">WhatsApp</p>
                  <p className="text-xs text-[#475569]">
                    {phoneNumber.trim() ? `Send to ${countryCode}${phoneNumber}` : 'Share via WhatsApp'}
                  </p>
                </div>
                <span
                  className="material-symbols-outlined ml-auto text-[#25D366]/50 group-hover:text-[#25D366] transition-colors"
                  style={{ fontSize: '20px' }}
                >
                  arrow_forward
                </span>
              </button>

              {/* SMS */}
              <button
                onClick={handleSMS}
                className="w-full group flex items-center gap-4 p-4 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] transition-all duration-200 hover:shadow-[0_4px_20px_-6px_rgba(59,130,246,0.15)]"
              >
                <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <span
                    className="material-symbols-outlined text-[#3B82F6]"
                    style={{ fontSize: '24px' }}
                  >
                    sms
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#00345e]">SMS / Text</p>
                  <p className="text-xs text-[#475569]">
                    {phoneNumber.trim() ? `Text to ${countryCode}${phoneNumber}` : 'Share via text message'}
                  </p>
                </div>
                <span
                  className="material-symbols-outlined ml-auto text-[#3B82F6]/30 group-hover:text-[#3B82F6] transition-colors"
                  style={{ fontSize: '20px' }}
                >
                  arrow_forward
                </span>
              </button>

              {/* Copy to Clipboard */}
              <button
                onClick={handleCopy}
                className="w-full group flex items-center gap-4 p-4 rounded-xl bg-[#f8f9ff] hover:bg-[#EFF6FF] transition-all duration-200 hover:shadow-[0_4px_20px_-6px_rgba(0,52,94,0.08)]"
              >
                <div className="w-12 h-12 rounded-xl bg-[#475569]/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.span
                        key="check"
                        className="material-symbols-outlined text-[#7C3AED]"
                        style={{ fontSize: '24px' }}
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                      >
                        check_circle
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        className="material-symbols-outlined text-[#475569]"
                        style={{ fontSize: '24px' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        content_copy
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="text-left">
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="copied"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                      >
                        <p className="text-sm font-semibold text-[#7C3AED]">Copied!</p>
                        <p className="text-xs text-[#7C3AED]/70">Ready to paste anywhere</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                      >
                        <p className="text-sm font-semibold text-[#00345e]">Copy to Clipboard</p>
                        <p className="text-xs text-[#475569]">Copy the full analysis text</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {copied && (
                    <motion.div
                      className="ml-auto px-2.5 py-1 rounded-lg bg-[#EDE9FE]/30"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      <span className="text-xs font-medium text-[#7C3AED]">Done</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* Footer */}
            <p className="text-[11px] text-[#CBD5E1] text-center mt-6 leading-relaxed">
              Shared results are for informational purposes only and do not constitute medical advice.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
