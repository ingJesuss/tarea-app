import { useState } from "react";

export function useToast() {
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success"
  });

  const showToast = (message, type = "success", duration = 3000) => {
    setToast({
      isVisible: true,
      message,
      type,
      duration
    });
  };

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  return {
    toast,
    showToast,
    hideToast
  };
}