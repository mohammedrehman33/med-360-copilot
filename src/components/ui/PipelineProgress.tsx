'use client';

import { Check, Loader2, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { PIPELINE_AGENTS } from '@/lib/constants';
import type { PipelineState } from '@/types';

const statusVariantMap: Record<string, 'success' | 'destructive' | 'default' | 'secondary'> = {
  completed: 'success',
  failed: 'destructive',
  running: 'default',
  pending: 'secondary',
};

export default function PipelineProgress({ state }: { state: PipelineState }) {
  const completedCount = PIPELINE_AGENTS.filter((agent) => {
    const result = state.agents[agent.key as keyof PipelineState['agents']];
    return result !== null;
  }).length;
  const progressValue = (completedCount / PIPELINE_AGENTS.length) * 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Analysis Pipeline</CardTitle>
          <Badge variant={statusVariantMap[state.status] || 'secondary'}>
            {state.status.charAt(0).toUpperCase() + state.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Progress value={progressValue} />

        <div className="space-y-3">
          {PIPELINE_AGENTS.map((agent) => {
            const result = state.agents[agent.key as keyof PipelineState['agents']];
            const isActive = state.currentAgent === agent.key;
            const isDone = result !== null;
            const hasError = result?.status === 'error';

            return (
              <div key={agent.key} className="flex items-center gap-3">
                {isDone && !hasError ? (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[#EDE9FE]/30">
                    <Check className="w-3.5 h-3.5 text-[#7C3AED]" />
                  </div>
                ) : isDone && hasError ? (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[#fe8983]/20">
                    <Circle className="w-3.5 h-3.5 text-[#9f403d]" />
                  </div>
                ) : isActive ? (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[#DBEAFE] agent-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3B82F6]" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#EFF6FF]" />
                )}
                <span className={cn(
                  "text-sm",
                  isActive && "font-bold text-[#3B82F6]",
                  isDone ? "text-[#00345e]" : "text-[#CBD5E1]"
                )}>
                  {agent.label}
                </span>
              </div>
            );
          })}
        </div>

        {state.errors.length > 0 && (
          <div className="rounded-xl p-4 bg-[#fe8983]/10">
            {state.errors.map((err, i) => (
              <p key={i} className="text-xs text-[#9f403d]">{err}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
