export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  severity?: ErrorSeverity;
  title?: string;
  retryAction?: {
    label: string;
    onClick: () => void;
  };
}

const severityConfig = {
  error: {
    bg: 'bg-error/10',
    border: 'border-error/20',
    text: 'text-error',
    iconColor: 'text-error',
    icon: (
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    ),
  },
  warning: {
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    text: 'text-warning',
    iconColor: 'text-warning',
    icon: (
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    ),
  },
  info: {
    bg: 'bg-info/10',
    border: 'border-info/20',
    text: 'text-info',
    iconColor: 'text-info',
    icon: (
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    ),
  },
};

export function ErrorMessage({
  message,
  onDismiss,
  severity = 'error',
  title,
  retryAction,
}: ErrorMessageProps) {
  const config = severityConfig[severity];

  return (
    <div
      className={`${config.bg} border ${config.border} ${config.text} px-4 py-3 rounded-lg shadow-sm animate-in fade-in slide-in-from-top-2 duration-base`}
      role="alert"
    >
      <div className="flex items-start">
        <svg
          className={`h-5 w-5 ${config.iconColor} mr-3 mt-0.5 flex-shrink-0`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          {config.icon}
        </svg>
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-semibold mb-1">
              {title}
            </h3>
          )}
          <p className="text-sm font-medium">
            {message}
          </p>
          {retryAction && (
            <button
              onClick={retryAction.onClick}
              className={`mt-2 text-sm font-semibold underline hover:no-underline focus:outline-none transition-all duration-fast`}
            >
              {retryAction.label}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`ml-3 ${config.iconColor} hover:opacity-70 focus:outline-none transition-opacity duration-fast`}
            aria-label="Dismiss message"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
