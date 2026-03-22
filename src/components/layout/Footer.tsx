'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#EFF6FF] via-[#f0f0ff] to-[#EDE9FE] mt-auto">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-[#475569]">
            <span className="font-bold text-[#bd0c3b]">EMERGENCY: 911</span>
            <Link href="#" className="hover:text-[#3B82F6] transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-[#3B82F6] transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-[#3B82F6] transition-colors">Medical Disclaimer</Link>
          </div>
          <p className="text-xs text-[#475569]/70">
            © {new Date().getFullYear()} PharmaAI Copilot. For informational purposes only. Not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
