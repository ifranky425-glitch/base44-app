import { useEffect, useState } from "react";

const listeners = [];
let counter = 0;

export function toast({ title, description, variant = "default", duration = 5000 }) {
  const id = ++counter;
  const item = { id, title, description, variant, duration };
  listeners.forEach((listener) => listener(item));
  return {
    id,
    dismiss: () => listeners.forEach((listener) => listener({ id, dismiss: true })),
  };
}

export function useToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (item) => {
      setToasts((prev) => {
        if (item.dismiss) return prev.filter((t) => t.id !== item.id);
        if (prev.some((t) => t.id === item.id)) return prev;
        return [...prev, item];
      });
    };
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    toasts,
    toast,
    dismiss: (id) => listeners.forEach((listener) => listener({ id, dismiss: true })),
  };
}