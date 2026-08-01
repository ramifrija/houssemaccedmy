import { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const PREFS_KEY = 'houssem-app-prefs';

function getLocalPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { notifications: true };
    return JSON.parse(raw);
  } catch {
    return { notifications: true };
  }
}

export const requestAndRegisterPush = async () => {
  if (!Capacitor.isNativePlatform()) return false;

  let permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    return false;
  }

  await PushNotifications.register();
  return true;
};

export const disablePushNotifications = async (userId?: string) => {
  if (!userId) return;
  // Remove the FCM token from the database to stop receiving pushes
  await supabase.from('profiles').update({ fcm_token: null } as any).eq('user_id', userId);
};

export const usePushNotifications = (userId?: string) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Push notifications are only available on native devices
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications not available on web platform');
      return;
    }

    const initPush = async () => {
      const permStatus = await PushNotifications.checkPermissions();
      const prefs = getLocalPrefs();

      // If user explicitly disabled notifications in settings, do not register
      if (!prefs.notifications) return;

      if (permStatus.receive === 'prompt') {
        const reqStatus = await PushNotifications.requestPermissions();
        if (reqStatus.receive === 'granted') {
          await PushNotifications.register();
        }
      } else if (permStatus.receive === 'granted') {
        await PushNotifications.register();
      }
    };

    initPush();

    // Listeners
    PushNotifications.addListener('registration', async (t) => {
      console.log('Push registration success, token: ' + t.value);
      setToken(t.value);
      
      // Save token to Supabase if userId is provided
      if (userId) {
        const { error } = await supabase
          .from('profiles')
          .update({ fcm_token: t.value } as any) // Type as any for now in case fcm_token doesn't exist yet
          .eq('user_id', userId);
        
        if (error) {
          console.error('Error saving FCM token to Supabase:', error);
        }
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received: ', notification);
      
      // Check prefs again before showing local toast just in case
      const prefs = getLocalPrefs();
      if (!prefs.notifications) return;

      toast({
        title: notification.title || 'Nouvelle notification',
        description: notification.body || '',
      });
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed: ', notification);
      const data = notification.notification.data;
      if (data && data.url) {
        navigate(data.url);
      }
    });

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [userId, toast, navigate]);

  return { token };
};
