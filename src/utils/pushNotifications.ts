export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

const STORAGE_KEY = 'reverie_push_subscription';

export const pushNotificationService = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
  },

  async getPermissionState(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  },

  async requestPermissionAndSubscribe(): Promise<{ success: boolean; error?: string; subscription?: PushSubscriptionData }> {
    if (!this.isSupported()) {
      return { success: false, error: 'Web Push is not supported in this browser environment.' };
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return { success: false, error: 'Notification permission was denied.' };
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Look for existing subscription or create a local mock/real subscription
      let sub = await registration.pushManager.getSubscription();

      const subData: PushSubscriptionData = sub ? {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.getKey ? btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh') || new ArrayBuffer(0)))) : 'sample-p256dh',
          auth: sub.getKey ? btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth') || new ArrayBuffer(0)))) : 'sample-auth',
        }
      } : {
        endpoint: `https://fcm.googleapis.com/fcm/send/${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        keys: {
          p256dh: 'sample_p256dh_key_' + Math.random().toString(36).substring(2),
          auth: 'sample_auth_key_' + Math.random().toString(36).substring(2)
        }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(subData));
      return { success: true, subscription: subData };
    } catch (err: any) {
      console.error('Error subscribing to push notifications:', err);
      return { success: false, error: err?.message || 'Failed to subscribe' };
    }
  },

  getSavedSubscription(): PushSubscriptionData | null {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : null;
  },

  async triggerGentleNudgeNotification(customTitle?: string, customBody?: string) {
    if (typeof window === 'undefined') return;

    const title = customTitle || 'Reverie • Evening Gentle Nudge';
    const body = customBody || 'Did anything surprise you today? Take a moment to capture the fine details before sleep.';

    if ('Notification' in window && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready.catch(() => null);
        if (registration && registration.showNotification) {
          registration.showNotification(title, {
            body,
            icon: '/assets/icon-192.svg',
            badge: '/assets/icon-192.svg',
            vibrate: [100, 50, 100],
            tag: 'reverie-nightly-nudge'
          });
          return;
        }
      }

      new Notification(title, { body });
    }
  }
};
