'use client';

import { cn } from '@/lib/utils';
import { SHORT_DISCLAIMER } from '@/lib/constants';

export default function DisclaimerBanner({ text, className }: { text?: string; className?: string }) {
  return (
    <div className={cn("bg-[#EFF6FF] rounded-xl p-5 flex items-start gap-3", className)}>
      <span className="material-symbols-outlined text-[#475569] flex-shrink-0 mt-0.5" style={{ fontSize: '20px' }}>info</span>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#475569] mb-1">Clinical Disclaimer</p>
        <p className="text-sm text-[#475569] leading-relaxed">{text || SHORT_DISCLAIMER}</p>
      </div>
    </div>
  );
}
