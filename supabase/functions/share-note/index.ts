import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, content-type',
        },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { note_id, email, role, expires_at } = await req.json();

    if (!note_id || !email || !role) {
      return new Response(JSON.stringify({ error: 'note_id, email, and role are required' }), { status: 400 });
    }

    if (!['editor', 'viewer'].includes(role)) {
      return new Response(JSON.stringify({ error: 'role must be editor or viewer' }), { status: 400 });
    }

    // Verify note ownership
    const { data: note } = await supabase
      .from('notes')
      .select('id')
      .eq('id', note_id)
      .eq('user_id', user.id)
      .single();

    if (!note) {
      return new Response(JSON.stringify({ error: 'Note not found or access denied' }), { status: 404 });
    }

    // Find recipient
    const { data: recipientList } = await supabase.auth.admin.listUsers();
    const recipient = recipientList?.users?.find((u: { email?: string }) => u.email === email);

    if (!recipient) {
      return new Response(JSON.stringify({ error: 'Recipient not found' }), { status: 404 });
    }

    if (recipient.id === user.id) {
      return new Response(JSON.stringify({ error: 'Cannot share with yourself' }), { status: 400 });
    }

    // Create share record
    const { data: share, error: shareError } = await supabase
      .from('shares')
      .insert({
        note_id,
        owner_id: user.id,
        shared_with_id: recipient.id,
        role,
        expires_at: expires_at || null,
      })
      .select()
      .single();

    if (shareError) {
      return new Response(JSON.stringify({ error: 'Failed to create share' }), { status: 500 });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'share_note',
      resource_type: 'note',
      resource_id: note_id,
      metadata: { shared_with: email, role },
    });

    return new Response(JSON.stringify({ success: true, share }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
});
