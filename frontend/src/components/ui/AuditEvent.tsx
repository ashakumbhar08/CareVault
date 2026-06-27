import { UploadCloud, UserCheck, UserX, Clock } from 'lucide-react';
import { AuditEntry } from '../../types';

interface AuditEventProps {
  event: AuditEntry;
}

const eventConfig = {
  upload: {
    icon: UploadCloud,
    color: 'bg-accent',
    badgeColor: 'bg-accent/10 text-accent',
  },
  grant: {
    icon: UserCheck,
    color: 'bg-success',
    badgeColor: 'bg-success/10 text-success',
  },
  revoke: {
    icon: UserX,
    color: 'bg-error',
    badgeColor: 'bg-error/10 text-error',
  },
  expiry: {
    icon: Clock,
    color: 'bg-warning',
    badgeColor: 'bg-warning/10 text-warning',
  },
};

export const AuditEvent = ({ event }: AuditEventProps) => {
  const actionType = event.action || (event.type as any) || 'upload';
  const { icon: Icon, color, badgeColor } = eventConfig[actionType as keyof typeof eventConfig] || eventConfig.upload;

  return (
    <div className="flex gap-4 relative pb-6 last:pb-0">
      <div className="relative flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="w-px flex-1 bg-border absolute top-8 bottom-0"></div>
      </div>

      <div className="flex-1 pt-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-badge ${badgeColor} capitalize`}>
            {actionType}
          </span>
          <span className="text-xs text-text-secondary">
            {new Date(event.timestamp).toLocaleDateString()} · {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-sm text-text-primary mb-1">{event.details}</p>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="font-mono">{event.actorWallet}</span>
          {event.fileName && (
            <span className="px-2 py-0.5 bg-surface-hover rounded-badge">{event.fileName}</span>
          )}
        </div>
      </div>
    </div>
  );
};
