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

  const getTypeStyles = (type: 'info' | 'success' | 'warning' | 'error') => {
    const styles = {
      info: {
        icon: 'ℹ️',
        bg: 'var(--color-info, rgba(59, 130, 246, 0.2))',
        border: 'var(--color-info, rgba(59, 130, 246, 0.5))',
        text: 'var(--color-info, #60a5fa)',
        buttonBg: 'var(--color-info, #3b82f6)',
        buttonHover: 'var(--color-info, #2563eb)',
      },
      success: {
        icon: '✅',
        bg: 'var(--color-success, rgba(34, 197, 94, 0.2))',
        border: 'var(--color-success, rgba(34, 197, 94, 0.5))',
        text: 'var(--color-success, #4ade80)',
        buttonBg: 'var(--color-success, #16a34a)',
        buttonHover: 'var(--color-success, #15803d)',
      },
      warning: {
        icon: '⚠️',
        bg: 'var(--color-warning, rgba(234, 179, 8, 0.2))',
        border: 'var(--color-warning, rgba(234, 179, 8, 0.5))',
        text: 'var(--color-warning, #fbbf24)',
        buttonBg: 'var(--color-warning, #ca8a04)',
        buttonHover: 'var(--color-warning, #a16207)',
      },
      error: {
        icon: '❌',
        bg: 'var(--color-error, rgba(239, 68, 68, 0.2))',
        border: 'var(--color-error, rgba(239, 68, 68, 0.5))',
        text: 'var(--color-error, #f87171)',
        buttonBg: 'var(--color-error, #dc2626)',
        buttonHover: 'var(--color-error, #b91c1c)',
      }
    };
    return styles[type];
  };

  const style = getTypeStyles(type);

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in"
      style={{
        backgroundColor: 'var(--bg-modal-backdrop, rgba(0, 0, 0, 0.8))',
      }}
    >
      <div 
        className="border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in"
        style={{
          backgroundColor: 'var(--bg-secondary, #0f172a)',
          borderColor: style.border,
        }}
      >
        <div 
          className="p-6 border-b"
          style={{
            backgroundColor: style.bg,
            borderColor: style.border,
          }}
        >
          <div className="flex items-start gap-4">
            <div className="text-3xl">{style.icon}</div>
            <div className="flex-1">
              {title && (
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: style.text }}
                >
                  {title}
                </h3>
              )}
              <p 
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: 'var(--text-secondary)' }}
              >
                {message}
              </p>
            </div>
          </div>
        </div>
        <div 
          className="p-4 flex justify-end"
          style={{
            backgroundColor: 'var(--bg-overlay, rgba(15, 23, 42, 0.5))',
          }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: style.buttonBg,
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = style.buttonHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = style.buttonBg;
            }}
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

  const getTypeStyles = (type: 'info' | 'warning' | 'danger') => {
    const styles = {
      info: {
        icon: 'ℹ️',
        bg: 'var(--color-info, rgba(59, 130, 246, 0.2))',
        border: 'var(--color-info, rgba(59, 130, 246, 0.5))',
        text: 'var(--color-info, #60a5fa)',
        confirmBg: 'var(--color-info, #3b82f6)',
        confirmHover: 'var(--color-info, #2563eb)',
      },
      warning: {
        icon: '⚠️',
        bg: 'var(--color-warning, rgba(234, 179, 8, 0.2))',
        border: 'var(--color-warning, rgba(234, 179, 8, 0.5))',
        text: 'var(--color-warning, #fbbf24)',
        confirmBg: 'var(--color-warning, #ca8a04)',
        confirmHover: 'var(--color-warning, #a16207)',
      },
      danger: {
        icon: '🗑️',
        bg: 'var(--color-error, rgba(239, 68, 68, 0.2))',
        border: 'var(--color-error, rgba(239, 68, 68, 0.5))',
        text: 'var(--color-error, #f87171)',
        confirmBg: 'var(--color-error, #dc2626)',
        confirmHover: 'var(--color-error, #b91c1c)',
      }
    };
    return styles[type];
  };

  const style = getTypeStyles(type);

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in"
      style={{
        backgroundColor: 'var(--bg-modal-backdrop, rgba(0, 0, 0, 0.8))',
      }}
    >
      <div 
        className="border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in"
        style={{
          backgroundColor: 'var(--bg-secondary, #0f172a)',
          borderColor: style.border,
        }}
      >
        <div 
          className="p-6 border-b"
          style={{
            backgroundColor: style.bg,
            borderColor: style.border,
          }}
        >
          <div className="flex items-start gap-4">
            <div className="text-3xl">{style.icon}</div>
            <div className="flex-1">
              {title && (
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: style.text }}
                >
                  {title}
                </h3>
              )}
              <p 
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: 'var(--text-secondary)' }}
              >
                {message}
              </p>
            </div>
          </div>
        </div>
        <div 
          className="p-4 flex justify-end gap-3"
          style={{
            backgroundColor: 'var(--bg-overlay, rgba(15, 23, 42, 0.5))',
          }}
        >
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: 'var(--bg-overlay, rgba(51, 65, 85, 1))',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(71, 85, 105, 1))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(51, 65, 85, 1))';
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: style.confirmBg,
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = style.confirmHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = style.confirmBg;
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
