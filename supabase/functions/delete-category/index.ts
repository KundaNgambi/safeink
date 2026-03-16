import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

serve(async (req: Request) => {
  try {
    // CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, content-type',
        },
      });
    }

    // Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { category_id, reassign_to } = await req.json();

    if (!category_id) {
      return new Response(JSON.stringify({ error: 'category_id is required' }), { status: 400 });
    }

    // Verify ownership
    const { data: category } = await supabase
      .from('categories')
      .select('*')
      .eq('id', category_id)
      .eq('user_id', user.id)
      .single();

    if (!category) {
      return new Response(JSON.stringify({ error: 'Category not found' }), { status: 404 });
    }

    // Collect all descendant IDs
    async function getDescendants(parentId: string): Promise<string[]> {
      const { data: children } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', parentId)
        .eq('user_id', user!.id);

      if (!children || children.length === 0) return [];

      const ids = children.map((c: { id: string }) => c.id);
      for (const id of ids) {
        const subIds = await getDescendants(id);
        ids.push(...subIds);
      }
      return ids;
    }

    const descendantIds = await getDescendants(category_id);
    const allIds = [category_id, ...descendantIds];

    // Reassign notes
    await supabase
      .from('notes')
      .update({ category_id: reassign_to || null })
      .in('category_id', allIds)
      .eq('user_id', user.id);

    // Delete categories (cascade handles children via FK)
    await supabase
      .from('categories')
      .delete()
      .eq('id', category_id)
      .eq('user_id', user.id);

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'delete_category',
      resource_type: 'category',
      resource_id: category_id,
      metadata: { reassign_to, descendants_removed: descendantIds.length },
    });

    return new Response(JSON.stringify({ success: true, deleted: allIds.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
});
