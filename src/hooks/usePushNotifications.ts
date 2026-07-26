import { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = (userId?: string) => {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Push notifications are only available on native devices
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications not available on web platform');
      return;
    }

    const registerPush = async () => {
      // Check permissions
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.warn('User denied push notification permissions');
        return;
      }

      // Register with Apple / Google to receive push via APNS/FCM
      await PushNotifications.register();
    };

    registerPush();

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
      toast({
        title: notification.title || 'Nouvelle notification',
        description: notification.body || '',
      });
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed: ', notification);
      // Handle notification click (e.g., navigate to a specific page)
    });

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [userId, toast]);

  return { token };
};
