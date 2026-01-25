import { GoogleServiceType, GoogleServiceConfig } from '@/types/common';
import { FileText, Mail, Calendar, HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';

const GOOGLE_SERVICES: GoogleServiceConfig[] = [
  {
    type: 'drive',
    name: 'Google Drive',
    description: 'Access and manage files in Google Drive',
    icon: 'drive',
    scopes: ['https://www.googleapis.com/auth/drive'],
  },
  {
    type: 'sheets',
    name: 'Google Sheets',
    description: 'Read and write Google Sheets',
    icon: 'sheets',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  },
  {
    type: 'gmail',
    name: 'Gmail',
    description: 'Send and read emails',
    icon: 'gmail',
    scopes: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
    ],
  },
  {
    type: 'calendar',
    name: 'Google Calendar',
    description: 'Manage calendar events',
    icon: 'calendar',
    scopes: ['https://www.googleapis.com/auth/calendar'],
  },
];

interface GoogleServiceSelectorProps {
  selectedService: GoogleServiceType | null;
  onSelectService: (service: GoogleServiceType) => void;
  disabled?: boolean;
}

const getServiceIcon = (icon: string) => {
  switch (icon) {
    case 'drive':
      return <HardDrive className="h-5 w-5" />;
    case 'sheets':
      return <FileText className="h-5 w-5" />;
    case 'gmail':
      return <Mail className="h-5 w-5" />;
    case 'calendar':
      return <Calendar className="h-5 w-5" />;
    default:
      return null;
  }
};

export const GoogleServiceSelector = ({
  selectedService,
  onSelectService,
  disabled = false,
}: GoogleServiceSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {GOOGLE_SERVICES.map((service) => (
        <button
          key={service.type}
          type="button"
          onClick={() => !disabled && onSelectService(service.type)}
          disabled={disabled}
          className={cn(
            'relative flex flex-col items-start p-4 rounded-lg border-2 transition-all',
            'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            selectedService === service.type
              ? 'border-primary bg-primary/5'
              : 'border-border bg-background hover:bg-accent/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex items-center gap-3 w-full">
            <div
              className={cn(
                'p-2 rounded-md',
                selectedService === service.type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {getServiceIcon(service.icon)}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-sm text-foreground">{service.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{service.description}</div>
            </div>
            {selectedService === service.type && (
              <div className="absolute top-2 right-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export { GOOGLE_SERVICES };

