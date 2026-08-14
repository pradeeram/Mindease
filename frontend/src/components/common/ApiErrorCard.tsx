import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface ApiErrorCardProps {
  title?: string;
  message: string;
  code?: string;
  onRetry?: () => void | Promise<void>;
  onDismiss?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export const ApiErrorCard: React.FC<ApiErrorCardProps> = ({
  title = 'Action Could Not Be Completed',
  message,
  code,
  onRetry,
  onDismiss,
  isRetrying = false,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`w-full bg-rose-50/90 border border-rose-200 text-rose-900 rounded-2xl p-4 sm:p-5 shadow-sm animate-fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-start gap-3 flex-1">
        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 mt-0.5 sm:mt-0">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs sm:text-sm font-bold font-serif text-rose-950">{title}</h4>
            {code && (
              <span className="px-2 py-0.5 bg-rose-200/70 text-rose-900 text-[10px] font-mono font-semibold rounded-md uppercase">
                {code}
              </span>
            )}
          </div>
          <p className="text-xs text-rose-800/90 mt-0.5 leading-relaxed font-sans">{message}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Retry'}
          </button>
        )}

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
