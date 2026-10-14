import { useCallback, useRef, useState } from "react";

export type AppToast = {
  id: string;
  kind: "success" | "error" | "info";
  title: string;
  message?: string;
};

export function useToasts() {
  const [toasts, setToasts] = useState<AppToast[]>([]);
  const timeoutMapRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((toastId: string) => {
    const timeoutId = timeoutMapRef.current.get(toastId);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutMapRef.current.delete(toastId);
    }

    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }, []);

  const pushToast = useCallback(
    (kind: AppToast["kind"], title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      setToasts((current) => [...current, { id, kind, title, message }]);

      const timeoutId = window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
        timeoutMapRef.current.delete(id);
      }, 3200);

      timeoutMapRef.current.set(id, timeoutId);
    },
    [],
  );

  return {
    toasts,
    dismissToast,
    pushSuccessToast: (title: string, message?: string) =>
      pushToast("success", title, message),
    pushErrorToast: (title: string, message?: string) =>
      pushToast("error", title, message),
    pushInfoToast: (title: string, message?: string) =>
      pushToast("info", title, message),
  };
}