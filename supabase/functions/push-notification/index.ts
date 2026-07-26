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

    // Initialize Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Determine the receiver ID and message content based on the table
    let receiverIds: string[] = []
    let title = 'Nouvelle notification'
    let body = 'Vous avez une nouvelle notification'

    if (payload.table === 'messages') {
      const conversationId = record.conversation_id
      const senderId = record.sender_id
      body = record.content || 'Vous avez reçu un nouveau message'
      title = 'Nouveau Message'
      
      const { data: participants, error: pError } = await supabaseClient
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .neq('user_id', senderId)
        
      if (!pError && participants) {
        receiverIds = participants.map(p => p.user_id)
      }
    } else if (payload.table === 'notifications') {
      receiverIds = [record.user_id]
      title = record.title || 'Nouvelle notification'
      body = record.content || ''
    } else if (payload.table === 'announcements') {
      title = record.title || 'Nouvelle annonce'
      body = record.content ? record.content.substring(0, 100) : 'Une nouvelle annonce a été publiée.'
      
      let query = supabaseClient.from('profiles').select('user_id').neq('user_id', record.author_id)
      
      if (record.audience === 'students') {
        query = query.eq('role_id', 3)
      } else if (record.audience === 'teachers') {
        query = query.eq('role_id', 2)
      } else if (record.audience === 'parents') {
        query = query.eq('role_id', 4)
      }
      
      const { data: profilesData, error: pError } = await query
      if (!pError && profilesData) {
        receiverIds = profilesData.map(p => p.user_id)
      }
    }

    if (receiverIds.length === 0) {
      return new Response('No receiver IDs found', { status: 200 })
    }

    // Fetch the FCM tokens for the receivers
    const { data: profiles, error } = await supabaseClient
      .from('profiles')
      .select('fcm_token')
      .in('user_id', receiverIds)

    if (error || !profiles || profiles.length === 0) {
      console.log('No profiles found for users')
      return new Response('No profiles found', { status: 200 })
    }

    const fcmTokens = profiles.map(p => p.fcm_token).filter(t => t && t.length > 0)
    
    if (fcmTokens.length === 0) {
      console.log('No FCM tokens found for users')
      return new Response('No FCM tokens found', { status: 200 })
    }

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
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`
    
    // Send Push Notification to all tokens (sequentially or Promise.all)
    const promises = fcmTokens.map(token => {
      return fetch(fcmUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: {
            token: token,
            notification: {
              title: title,
              body: body,
            },
            android: {
              priority: 'high',
              notification: {
                sound: 'default',
              }
            }
          },
        }),
      })
    })

    const responses = await Promise.all(promises)
    console.log(`Sent ${responses.length} notifications.`)

    return new Response(JSON.stringify({ success: true, sent: responses.length }), {
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
