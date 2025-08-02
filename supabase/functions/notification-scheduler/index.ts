import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get current time
    const now = new Date().toISOString();

    // Find scheduled notifications that are ready to send
    const { data: scheduledNotifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_sent', false)
      .not('scheduled_at', 'is', null)
      .lte('scheduled_at', now);

    if (fetchError) {
      console.error('Error fetching scheduled notifications:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${scheduledNotifications?.length || 0} notifications ready to send`);

    if (!scheduledNotifications || scheduledNotifications.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No notifications to send', count: 0 }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Mark notifications as sent and update sent_at timestamp
    const notificationIds = scheduledNotifications.map(n => n.id);
    
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ 
        is_sent: true, 
        sent_at: now 
      })
      .in('id', notificationIds);

    if (updateError) {
      console.error('Error updating notifications:', updateError);
      throw updateError;
    }

    // Create notification recipients for all users
    for (const notification of scheduledNotifications) {
      try {
        // Get all users
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
        
        if (usersError) {
          console.error('Error fetching users:', usersError);
          continue;
        }

        // Create recipients
        const recipients = users.users.map(user => ({
          notification_id: notification.id,
          user_id: user.id
        }));

        if (recipients.length > 0) {
          const { error: recipientsError } = await supabase
            .from('notification_recipients')
            .insert(recipients);

          if (recipientsError) {
            console.error('Error creating recipients for notification:', notification.id, recipientsError);
          } else {
            console.log(`Created ${recipients.length} recipients for notification: ${notification.title}`);
          }
        }
      } catch (error) {
        console.error('Error processing notification:', notification.id, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Notifications sent successfully', 
        count: scheduledNotifications.length,
        notifications: scheduledNotifications.map(n => ({ id: n.id, title: n.title }))
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in notification scheduler:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});