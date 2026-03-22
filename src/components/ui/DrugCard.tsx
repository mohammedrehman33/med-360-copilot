'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { DrugInfo } from '@/types';

export default function DrugCard({ drug }: { drug: DrugInfo }) {
  return (
    <Card className="fade-up">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-[#00345e] font-headline">
              {drug.brandName}
            </h3>
            <p className="text-sm font-medium text-[#3B82F6] uppercase tracking-wider mt-1">
              Salt: {drug.saltComposition}
            </p>
          </div>
          <Badge variant="default">
            {drug.drugClass}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {drug.mechanism && (
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '20px' }}>science</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#475569] mb-1">Mechanism</p>
              <p className="text-sm text-[#475569]">{drug.mechanism}</p>
            </div>
          </div>
        )}

        {drug.standardDosage && (
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#7C3AED]" style={{ fontSize: '20px' }}>event_repeat</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#475569] mb-1">Standard Dosage</p>
              <p className="font-semibold text-[#00345e]">{drug.standardDosage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {drug.sideEffects.length > 0 && (
            <div className="rounded-xl p-4 bg-[#EFF6FF]">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[#9f403d]" style={{ fontSize: '18px' }}>warning</span>
                <span className="text-xs font-bold uppercase tracking-widest text-[#475569]">
                  Side Effects
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {drug.sideEffects.map((se, i) => (
                  <Badge key={i} variant="warning" className="text-xs">
                    {se}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {drug.foodInteractions.length > 0 && (
            <div className="rounded-xl p-4 bg-[#EFF6FF]">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '18px' }}>restaurant</span>
                <span className="text-xs font-bold uppercase tracking-widest text-[#475569]">
                  Food Interactions
                </span>
              </div>
              <ul className="text-sm space-y-1.5 text-[#475569]">
                {drug.foodInteractions.map((fi, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#7C3AED]" style={{ fontSize: '14px' }}>check_circle</span>
                    {fi}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
