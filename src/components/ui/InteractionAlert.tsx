'use client';

import { Card, CardContent } from '@/components/ui/card';
import SeverityBadge from './SeverityBadge';
import { cn } from '@/lib/utils';
import type { DrugInteractionResult } from '@/types';

export default function InteractionAlert({ interaction }: { interaction: DrugInteractionResult }) {
  const isSerious = interaction.severity === 'major' || interaction.severity === 'contraindicated';

  return (
    <Card
      className={cn(
        "fade-up overflow-hidden",
        isSerious && "severity-alert"
      )}
    >
      {isSerious && (
        <div className="h-1 bg-[#bd0c3b]" />
      )}
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3 rounded-full flex-shrink-0",
            isSerious ? "bg-[#fc4563]/10" : "bg-[#EFF6FF]"
          )}>
            <span
              className="material-symbols-outlined"
              style={{
                color: isSerious ? '#bd0c3b' : '#475569',
                fontSize: '20px',
                fontVariationSettings: "'FILL' 1",
              }}
            >
              {isSerious ? 'warning' : 'info'}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-[#00345e]">
                {interaction.drug1} + {interaction.drug2}
              </span>
              <SeverityBadge severity={interaction.severity} />
            </div>
            <p className="text-sm mb-3 text-[#475569]">
              {interaction.description}
            </p>
            {interaction.mechanism && (
              <p className="text-xs mb-2 text-[#475569]">
                <strong className="text-[#00345e]">Mechanism:</strong> {interaction.mechanism}
              </p>
            )}
            {interaction.management && (
              <div className="mt-3 rounded-xl px-4 py-3 bg-[#EFF6FF]">
                <p className="text-xs font-bold uppercase tracking-widest text-[#475569] mb-1">Management</p>
                <p className="text-sm text-[#7C3AED] font-medium">
                  {interaction.management}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
