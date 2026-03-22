'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { InteractionSeverity } from '@/types';

const severityConfig: Record<InteractionSeverity, { label: string; variant: 'info' | 'warning' | 'destructive'; className?: string }> = {
  minor: { label: 'Minor', variant: 'info' },
  moderate: { label: 'Moderate', variant: 'warning' },
  major: { label: 'Major', variant: 'destructive', className: 'bg-[#fc4563]/20 text-[#bd0c3b]' },
  contraindicated: { label: 'Contraindicated', variant: 'destructive' },
};

export default function SeverityBadge({ severity }: { severity: InteractionSeverity }) {
  const config = severityConfig[severity] || severityConfig.minor;
  return (
    <Badge variant={config.variant} className={cn("font-bold", config.className)}>
      {config.label}
    </Badge>
  );
}
