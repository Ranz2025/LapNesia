import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

let toastQueue = [];
let listeners = [];

export const toast = {
  success: (msg) => addToast("success", msg),
  error:   (msg) => addToast("error", msg),
  info:    (msg) => addToast("info", msg),
};

function addToast(type, message) {
  const id = Date.now() + Math.random();
  toastQueue = [...toastQueue, { id, type, message }];
  listeners.forEach((fn) => fn([...toastQueue]));
  setTimeout(() => removeToast(id), 4000);
}

function removeToast(id) {
  toastQueue = toastQueue.filter((t) => t.id !== id);
  listeners.forEach((fn) => fn([...toastQueue]));
}

const icons = {
  success: <CheckCircle size={18} className="text-green-400" />,
  error:   <XCircle    size={18} className="text-red-400" />,
  info:    <AlertCircle size={18} className="text-blue-400" />,
};

const colors = {
  success: "border-green-500/30 bg-green-500/10",
  error:   "border-red-500/30 bg-red-500/10",
  info:    "border-blue-500/30 bg-blue-500/10",
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    listeners.push(setToasts);
    return () => { listeners = listeners.filter((l) => l !== setToasts); };
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs w-full">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-start gap-3 p-3 rounded-lg border shadow-md ${colors[t.type]} animate-fade-in`}>
          {icons[t.type]}
          <span className="text-sm text-[#0F172A] flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="text-gray-500 hover:text-gray-300">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export { ToastContainer };
