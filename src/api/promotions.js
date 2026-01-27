import { supabase } from './supabase-products';

/**
 * Get the current promotions configuration
 * @returns {Promise<Object>} The promotions config
 */
export async function getPromotionsConfig() {
  try {
    const { data, error } = await supabase
      .from('promotions_config')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error fetching promotions config:', error);
      return null;
    }

    if (!data) {
      return {
        enabled: true,
        text: 'Enviament gratuït en comandes superiors a 50€',
        link: '/offers',
        bgColor: '#111827',
        textColor: '#ffffff',
        fontSize: '14px',
        font: 'Roboto'
      };
    }

    return {
      id: data.id,
      enabled: data.enabled,
      text: data.text,
      link: data.link,
      bgColor: data.bg_color,
      textColor: data.text_color,
      fontSize: data.font_size,
      font: data.font,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error in getPromotionsConfig:', error);
    return null;
  }
}

/**
 * Update the promotions configuration
 * @param {Object} config - The new configuration
 * @returns {Promise<Object>} The updated config
 */
export async function updatePromotionsConfig(config) {
  try {
    const existing = await supabase
      .from('promotions_config')
      .select('id')
      .maybeSingle();

    const updateData = {
      enabled: config.enabled,
      text: config.text,
      link: config.link,
      bg_color: config.bgColor,
      text_color: config.textColor,
      font_size: config.fontSize,
      font: config.font
    };

    let result;

    if (existing.data) {
      result = await supabase
        .from('promotions_config')
        .update(updateData)
        .eq('id', existing.data.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('promotions_config')
        .insert([updateData])
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error updating promotions config:', result.error);
      throw result.error;
    }

    return {
      id: result.data.id,
      enabled: result.data.enabled,
      text: result.data.text,
      link: result.data.link,
      bgColor: result.data.bg_color,
      textColor: result.data.text_color,
      fontSize: result.data.font_size,
      font: result.data.font,
      updatedAt: result.data.updated_at
    };
  } catch (error) {
    console.error('Error in updatePromotionsConfig:', error);
    throw error;
  }
}

/**
 * Toggle the promotions banner on/off
 * @param {boolean} enabled - Whether to enable or disable
 * @returns {Promise<Object>} The updated config
 */
export async function togglePromotionsBanner(enabled) {
  try {
    const existing = await supabase
      .from('promotions_config')
      .select('*')
      .maybeSingle();

    if (!existing.data) {
      const defaultConfig = {
        enabled,
        text: 'Enviament gratuït en comandes superiors a 50€',
        link: '/offers',
        bg_color: '#111827',
        text_color: '#ffffff',
        font_size: '14px',
        font: 'Roboto'
      };

      const { data, error } = await supabase
        .from('promotions_config')
        .insert([defaultConfig])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        enabled: data.enabled,
        text: data.text,
        link: data.link,
        bgColor: data.bg_color,
        textColor: data.text_color,
        fontSize: data.font_size,
        font: data.font
      };
    }

    const { data, error } = await supabase
      .from('promotions_config')
      .update({ enabled })
      .eq('id', existing.data.id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      enabled: data.enabled,
      text: data.text,
      link: data.link,
      bgColor: data.bg_color,
      textColor: data.text_color,
      fontSize: data.font_size,
      font: data.font
    };
  } catch (error) {
    console.error('Error toggling promotions banner:', error);
    throw error;
  }
}
