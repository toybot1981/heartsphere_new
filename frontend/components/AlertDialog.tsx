import React from 'react';

export interface AlertDialogProps {
  open: boolean;
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
  confirmText?: string;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  title,
  message,
  type = 'info',
  onClose,
  confirmText = '确定'
}) => {
  if (!open) return null;

  const typeStyles = {
    info: {
      icon: 'ℹ️',
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/50',
      text: 'text-blue-400'
    },
    success: {
      icon: '✅',
      bg: 'bg-green-500/20',
      border: 'border-green-500/50',
      text: 'text-green-400'
    },
    warning: {
      icon: '⚠️',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400'
    },
    error: {
      icon: '❌',
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-400'
    }
  };

  const style = typeStyles[type];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className={`bg-slate-900 border ${style.border} rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in`}>
        <div className={`p-6 ${style.bg} border-b ${style.border}`}>
          <div className="flex items-start gap-4">
            <div className="text-3xl">{style.icon}</div>
            <div className="flex-1">
              {title && (
                <h3 className={`text-xl font-bold ${style.text} mb-2`}>
                  {title}
                </h3>
              )}
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              type === 'error' 
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : type === 'warning'
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : type === 'success'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  type?: 'info' | 'warning' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  type = 'warning',
  onConfirm,
  onCancel,
  confirmText = '确定',
  cancelText = '取消'
}) => {
  if (!open) return null;

  const typeStyles = {
    info: {
      icon: 'ℹ️',
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/50',
      text: 'text-blue-400',
      confirmBg: 'bg-blue-600 hover:bg-blue-700'
    },
    warning: {
      icon: '⚠️',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700'
    },
    danger: {
      icon: '🗑️',
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-400',
      confirmBg: 'bg-red-600 hover:bg-red-700'
    }
  };

  const style = typeStyles[type];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className={`bg-slate-900 border ${style.border} rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in`}>
        <div className={`p-6 ${style.bg} border-b ${style.border}`}>
          <div className="flex items-start gap-4">
            <div className="text-3xl">{style.icon}</div>
            <div className="flex-1">
              {title && (
                <h3 className={`text-xl font-bold ${style.text} mb-2`}>
                  {title}
                </h3>
              )}
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-950/50 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg font-medium bg-slate-700 hover:bg-slate-600 text-white transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${style.confirmBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
