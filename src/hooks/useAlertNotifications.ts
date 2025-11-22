import { useEffect, useState } from "react";
import { toast } from "sonner";

export const useAlertNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        toast.success("Notifications enabled");
      }
    }
  };

  const sendAlert = (message: string, type: "danger" | "warning" | "info" = "info") => {
    // Browser notification
    if (permission === "granted" && "Notification" in window) {
      new Notification("SENTINEL AI Alert", {
        body: message,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "sentinel-alert",
        requireInteraction: type === "danger",
      });
    }

    // Toast notification
    if (type === "danger") {
      toast.error(message, {
        duration: 5000,
        className: "glow-danger",
      });
    } else if (type === "warning") {
      toast.warning(message, {
        duration: 4000,
      });
    } else {
      toast.info(message);
    }
  };

  return {
    permission,
    requestPermission,
    sendAlert,
  };
};
