import { supabase } from './supabase-products';

export const mockupsAPI = {
  _applyFilters(query, filters = {}) {
    const f = filters || {};

    if (f.collection) {
      query = query.eq('collection', f.collection);
    }

    if (f.subcategory) {
      query = query.eq('subcategory', f.subcategory);
    }

    if (f.sub_subcategory) {
      query = query.eq('sub_subcategory', f.sub_subcategory);
    }

    if (f.design_name) {
      const d = String(f.design_name);
      // Some legacy rows stored design_name like: "wormhole-black".
      // Include both exact and "design-color" forms.
      query = query.or(`design_name.eq.${d},design_name.ilike.${d}-%`);
    }

    if (f.base_color) {
      query = query.eq('base_color', f.base_color);
    }

    if (f.drawing_color) {
      query = query.eq('drawing_color', f.drawing_color);
    }

    if (f.product_type) {
      query = query.eq('product_type', f.product_type);
    }

    if (f.variant_id) {
      query = query.eq('variant_id', f.variant_id);
    }

    if (f.is_active !== undefined) {
      query = query.eq('is_active', f.is_active);
    }

    return query;
  },

  async countAll(filters = {}) {
    let query = supabase
      .from('product_mockups')
      .select('*', { count: 'exact', head: true });

    query = this._applyFilters(query, filters);

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  },

  async getAll(filters = {}) {
    let query = supabase
      .from('product_mockups')
      .select('*')
      .order('display_order', { ascending: true });

    query = this._applyFilters(query, filters);

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('product_mockups')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getByVariant(variantId) {
    const { data, error } = await supabase
      .from('product_mockups')
      .select('*')
      .eq('variant_id', variantId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getByCollection(collection) {
    return this.getAll({ collection, is_active: true });
  },

  async getByDesign(collection, design_name) {
    return this.getAll({ collection, design_name, is_active: true });
  },

  async getVariations(design_name, filters = {}) {
    return this.getAll({ design_name, is_active: true, ...filters });
  },

  async create(mockupData) {
    const { data, error } = await supabase
      .from('product_mockups')
      .insert(mockupData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async bulkCreate(mockupsArray) {
    const { data, error } = await supabase
      .from('product_mockups')
      .insert(mockupsArray)
      .select();

    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('product_mockups')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('product_mockups')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async toggleActive(id) {
    const mockup = await this.getById(id);
    if (!mockup) throw new Error('Mockup not found');

    return this.update(id, { is_active: !mockup.is_active });
  },

  async reorder(mockups) {
    const updates = mockups.map((mockup, index) => ({
      id: mockup.id,
      display_order: index
    }));

    const promises = updates.map(({ id, display_order }) =>
      this.update(id, { display_order })
    );

    return Promise.all(promises);
  },

  async getCollections() {
    const { data, error } = await supabase
      .from('product_mockups')
      .select('collection')
      .eq('is_active', true);

    if (error) throw error;

    const unique = [...new Set(data.map(m => m.collection))];
    return unique.sort();
  },

  async getDesignNames(collection) {
    const { data, error } = await supabase
      .from('product_mockups')
      .select('design_name')
      .eq('collection', collection)
      .eq('is_active', true);

    if (error) throw error;

    const unique = [...new Set(data.map(m => m.design_name))];
    return unique.sort();
  },

  async getColors(type = 'base') {
    const field = type === 'base' ? 'base_color' : 'drawing_color';

    const { data, error } = await supabase
      .from('product_mockups')
      .select(field)
      .eq('is_active', true);

    if (error) throw error;

    const unique = [...new Set(data.map(m => m[field]))];
    return unique.sort();
  }
};
