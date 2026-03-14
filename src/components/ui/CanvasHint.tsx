import React, { useCallback, useRef } from 'react';

export type CanvasHintButton = {
  label: string;
  onClick?: () => void; // Optional now if it's an upload button
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  isUpload?: boolean;
};

export type CanvasHintProps = {
  title: string;
  description: string;
  buttons: CanvasHintButton[];
  onDismiss: () => void;
  error?: string | null;
  isProcessing?: boolean;
  onUpload?: (file: File | null) => void;
};

export const CanvasHint: React.FC<CanvasHintProps> = ({
  title,
  description,
  buttons,
  onDismiss,
  error,
  isProcessing = false,
  onUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      if (onUpload) onUpload(file);
      event.target.value = '';
    },
    [onUpload]
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto w-[340px] rounded-xl border border-gray-200 bg-white/75 p-4 shadow-lg backdrop-blur dark:border-[#2a2845] dark:bg-slate-900/70">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{description}</p>

        <div className="mt-4 grid gap-2">
          {buttons.map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={btn.isUpload ? handleUploadClick : btn.onClick}
              disabled={btn.disabled || isProcessing}
              className={`w-full rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                btn.variant === 'secondary'
                  ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-[#2a2845] dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800'
                  : 'bg-primary text-white hover:bg-indigo-600'
              } ${btn.disabled || isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {btn.isUpload && isProcessing ? 'Importing…' : btn.label}
            </button>
          ))}

          <button
            type="button"
            onClick={onDismiss}
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-[#2a2845] dark:bg-[#0f0e1f] dark:text-slate-300 dark:hover:bg-[#1b1a30]"
          >
            Dismiss
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-900/40 dark:text-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};
