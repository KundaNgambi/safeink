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

  // Reassign notes if needed
  if (reassignTo) {
    await supabase
      .from('notes')
      .update({ category_id: reassignTo })
      .eq('category_id', id);
  } else {
    // Set notes' category to null
    await supabase
      .from('notes')
      .update({ category_id: null })
      .eq('category_id', id);
  }

  // Delete category (cascades to children)
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
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
