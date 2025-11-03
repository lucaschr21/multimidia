import React, { useEffect } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface ToastData {
  message: string;
  type: "success" | "warning";
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) {
    return null;
  }

  const isSuccess = toast.type === "success";
  const icon = isSuccess ? (
    <CheckCircle2 size={22} />
  ) : (
    <AlertCircle size={22} />
  );
  const toastClass = isSuccess ? "toast-success" : "toast-warning";

  return (
    <div className={`toast-container ${toastClass}`}>
      <span className="toast-icon">{icon}</span>
      <span>{toast.message}</span>
    </div>
  );
};
