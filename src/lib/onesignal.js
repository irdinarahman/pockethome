const ONESIGNAL_APP_ID = "20a72419-d917-4e5c-a1a8-493c0967741f";

function withOneSignal(callback) {
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(callback);
}

// Call once, as soon as you know the signed-in user's id. Logging in with
// an external id lets you target this exact user later from OneSignal's
// REST API (send to external_id) instead of a raw device/player id.
export function initOneSignal(externalUserId) {
  withOneSignal(async (OneSignal) => {
    await OneSignal.init({ appId: ONESIGNAL_APP_ID });
    if (externalUserId) {
      await OneSignal.login(externalUserId);
    }
  });
}

export function requestNotificationPermission() {
  withOneSignal(async (OneSignal) => {
    await OneSignal.Notifications.requestPermission();
  });
}

export function getNotificationPermission() {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission; // "default" | "granted" | "denied"
}

export function isPushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}
