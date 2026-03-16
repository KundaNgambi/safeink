import { createClient } from '@/lib/supabase/client';
import type { Category } from '@safeink/shared';

export async function fetchCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createCategory(
  name: string,
  icon: string,
  color: string,
  parentId: string | null
): Promise<Category> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get next sort_order
  const { data: existing } = await supabase
    .from('categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: user.id,
      name,
      icon,
      color,
      parent_id: parentId,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(
  id: string,
  updates: Partial<Pick<Category, 'name' | 'icon' | 'color'>>
): Promise<Category> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string, reassignTo: string | null): Promise<void> {
  const supabase = createClient();

  // Reassign notes first — fail early if this doesn't work
  const newCategoryId = reassignTo || null;
  const { error: reassignError } = await supabase
    .from('notes')
    .update({ category_id: newCategoryId })
    .eq('category_id', id);

  if (reassignError) throw new Error(`Failed to reassign notes: ${reassignError.message}`);

  // Delete category (cascades to children)
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Notes were reassigned but category deletion failed: ${error.message}`);
}

export async function reorderCategories(items: Array<{ id: string; sort_order: number }>): Promise<void> {
  const supabase = createClient();

  // Update each category's sort_order
  for (const item of items) {
    const { error } = await supabase
      .from('categories')
      .update({ sort_order: item.sort_order })
      .eq('id', item.id);

    if (error) throw error;
  }
}
