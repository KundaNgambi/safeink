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

    const { items } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'items array is required' }), { status: 400 });
    }

    // Verify all categories belong to the user
    const ids = items.map((item: { id: string }) => item.id);
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .in('id', ids)
      .eq('user_id', user.id);

    if (!categories || categories.length !== ids.length) {
      return new Response(JSON.stringify({ error: 'Invalid category IDs' }), { status: 403 });
    }

    // Batch update sort_order
    for (const item of items) {
      await supabase
        .from('categories')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id)
        .eq('user_id', user.id);
    }

    return new Response(JSON.stringify({ success: true, updated: items.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
});
