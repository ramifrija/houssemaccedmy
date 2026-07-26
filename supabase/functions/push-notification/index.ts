import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { GoogleAuth } from 'npm:google-auth-library@9.0.0'

const FIREBASE_PROJECT_ID = 'houssemacademy-73001'

serve(async (req) => {
  try {
    // Check if it's a valid request
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Parse the webhook payload
    const payload = await req.json()
    console.log('Webhook payload:', payload)

    const record = payload.record
    if (!record) {
      return new Response('No record in payload', { status: 400 })
    }

    // Determine the receiver ID and message content based on the table
    let receiverId = null
    let title = 'Nouvelle notification'
    let body = 'Vous avez une nouvelle notification'

    if (payload.table === 'messages') {
      receiverId = record.receiver_id
      body = record.content || 'Vous avez reçu un nouveau message'
      title = 'Nouveau Message'
    } else if (payload.table === 'announcements') {
      // Announcements might not have a specific receiver, maybe broadcast?
      // For now, let's just handle messages to specific users
      return new Response('Broadcast not implemented yet', { status: 200 })
    }

    if (!receiverId) {
      return new Response('No receiver ID found', { status: 200 })
    }

    // Initialize Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch the FCM token for the receiver
    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .select('fcm_token')
      .eq('user_id', receiverId)
      .single()

    if (error || !profile?.fcm_token) {
      console.log('No FCM token found for user:', receiverId)
      return new Response('No FCM token for user', { status: 200 })
    }

    const fcmToken = profile.fcm_token

    // Initialize Firebase Auth
    const serviceAccountStr = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
    if (!serviceAccountStr) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set')
    }
    
    const serviceAccount = JSON.parse(serviceAccountStr)
    const auth = new GoogleAuth({
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
      },
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    })

    const accessToken = await auth.getAccessToken()

    // Send Push Notification via FCM HTTP v1 API
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`
    
    const fcmResponse = await fetch(fcmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          notification: {
            title: title,
            body: body,
          },
        },
      }),
    })

    const fcmResult = await fcmResponse.json()
    console.log('FCM Send Result:', fcmResult)

    return new Response(JSON.stringify({ success: true, result: fcmResult }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error sending push notification:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
