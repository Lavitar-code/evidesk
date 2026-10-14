type ToastItem = {
  id: string;
  kind: "success" | "error" | "info";
  title: string;
  message?: string;
};

type ToastStackProps = {
  toasts: ToastItem[];
  onDismiss: (toastId: string) => void;
};

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div className={`toast-card toast-${toast.kind}`} key={toast.id}>
          <div className="toast-copy">
            <strong>{toast.title}</strong>
            {toast.message ? <p>{toast.message}</p> : null}
          </div>

          <button
            className="toast-close-btn"
            onClick={() => onDismiss(toast.id)}
            type="button"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}