'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DisclaimerBanner from './DisclaimerBanner';
import type { PatientGuide } from '@/types';

export default function MedicationGuidePanel({ guide }: { guide: PatientGuide }) {
  return (
    <Card className="fade-up">
      <CardHeader className="pb-3">
        <h3 className="text-2xl font-bold text-[#00345e] font-headline">
          {guide.medicineName}
        </h3>
        <p className="text-sm font-medium text-[#3B82F6] uppercase tracking-wider">{guide.saltName}</p>
        <p className="text-sm mt-2 text-[#475569] leading-relaxed">{guide.whatItDoes}</p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-xl p-4 bg-[#DBEAFE]/30">
          <p className="text-xs font-bold uppercase tracking-widest text-[#475569] mb-1">How to Take</p>
          <p className="text-sm font-semibold text-[#00345e]">
            {guide.howToTake}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Do's */}
          <div className="rounded-xl p-4 bg-[#EDE9FE]/15">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#7C3AED]" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#5B21B6]">
                Do&apos;s
              </span>
            </div>
            <ul className="space-y-1.5">
              {guide.dos.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2 text-[#475569]">
                  <span className="text-[#7C3AED] font-bold">+</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div className="rounded-xl p-4 bg-[#fc4563]/8">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#bd0c3b]" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>cancel</span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#bd0c3b]">
                Don&apos;ts
              </span>
            </div>
            <ul className="space-y-1.5">
              {guide.donts.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2 text-[#475569]">
                  <span className="text-[#bd0c3b] font-bold">-</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Side Effects */}
        <div className="rounded-xl p-4 bg-[#EFF6FF]">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[#9f403d]" style={{ fontSize: '18px' }}>warning</span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#475569]">
              Possible Side Effects
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {guide.commonSideEffects.map((se, i) => (
              <Badge key={i} variant="outline" className="text-xs bg-white text-[#475569]">
                {se}
              </Badge>
            ))}
          </div>
        </div>

        {/* When to Call Doctor */}
        {guide.whenToCallDoctor.length > 0 && (
          <div className="rounded-xl p-4 bg-[#fc4563]/8">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#bd0c3b]" style={{ fontSize: '18px' }}>call</span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#bd0c3b]">
                Call Your Doctor If
              </span>
            </div>
            <ul className="space-y-1.5">
              {guide.whenToCallDoctor.map((item, i) => (
                <li key={i} className="text-sm text-[#475569] flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#bd0c3b]" style={{ fontSize: '14px' }}>arrow_forward</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Food Interactions */}
        {guide.foodInteractions.length > 0 && (
          <div className="rounded-xl p-4 bg-[#DBEAFE]/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '18px' }}>restaurant</span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#475569]">
                Food & Drink
              </span>
            </div>
            <ul className="space-y-1.5">
              {guide.foodInteractions.map((item, i) => (
                <li key={i} className="text-sm text-[#475569] flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '14px' }}>check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <DisclaimerBanner text={guide.disclaimer} />
      </CardContent>
    </Card>
  );
}
