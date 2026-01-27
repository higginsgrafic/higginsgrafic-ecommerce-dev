import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseKey,
  keyLength: supabaseKey?.length
});

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!', { supabaseUrl, hasKey: !!supabaseKey });
}

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export { supabase };

const requireSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase no configurat: falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
  }
  return supabase;
};

export const productsService = {
  async getProducts(includeInactive = false) {
    return includeInactive ? this.getAllProductsIncludingInactive() : this.getAllProducts();
  },

  async enrichOutcastedImages(products) {
    if (!supabase) return Array.isArray(products) ? products : [];
    const items = Array.isArray(products) ? products : [];
    const outcasted = items.filter((p) => (p?.collection || '').toString().toLowerCase() === 'outcasted');

    if (outcasted.length === 0) return items;

    const inferNameFromUrl = (url) => {
      try {
        const u = new URL(url);
        const marker = '/media/outcasted/';
        const idx = u.pathname.indexOf(marker);
        if (idx === -1) return null;
        const rest = u.pathname.slice(idx + marker.length);
        const parts = rest.split('/').filter(Boolean);
        // parts: [productName, colorFolder, filename]
        return parts?.[0] || null;
      } catch {
        return null;
      }
    };

    const listAllFilesRecursivelyShallow = async (basePath) => {
      // list(basePath) returns files and subfolders; we then list each subfolder one level deep.
      const { data: top, error: topErr } = await requireSupabase()
        .storage
        .from('media')
        .list(basePath, { limit: 100, offset: 0 });

      if (topErr) {
        console.warn('⚠️ Could not list storage path:', basePath, topErr);
        return [];
      }

      const looksLikeFile = (name) => {
        const lower = (name || '').toString().toLowerCase();
        return lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp') || lower.endsWith('.gif') || lower.endsWith('.svg');
      };

      const isFileEntry = (x) => {
        if (!x || !x.name) return false;
        if (x.metadata) return true;
        if (x.created_at || x.updated_at || x.last_accessed_at) return true;
        return looksLikeFile(x.name);
      };

      const isFolderEntry = (x) => {
        if (!x || !x.name) return false;
        return !isFileEntry(x);
      };

      const folders = (top || []).filter(isFolderEntry);
      const files = (top || []).filter(isFileEntry);

      const nestedFiles = [];
      for (const folder of folders) {
        const folderPath = `${basePath}/${folder.name}`;
        const { data: sub, error: subErr } = await requireSupabase()
          .storage
          .from('media')
          .list(folderPath, { limit: 200, offset: 0 });
        if (subErr) {
          console.warn('⚠️ Could not list storage subpath:', folderPath, subErr);
          continue;
        }
        nestedFiles.push(...(sub || []).filter(isFileEntry).map((x) => ({ ...x, __path: folderPath })));
      }

      return [
        ...files.map((x) => ({ ...x, __path: basePath })),
        ...nestedFiles
      ];
    };

    const toPublicUrl = (path) => {
      const { data } = requireSupabase().storage.from('media').getPublicUrl(path);
      return data?.publicUrl || null;
    };

    const enrichOne = async (p) => {
      const existing = Array.isArray(p?.images) ? p.images.filter(Boolean) : [];
      // If you already have multiple images, don't touch it.
      if (existing.length > 1) return p;

      const name = p?.name || inferNameFromUrl(existing?.[0]) || null;
      if (!name) return p;

      const basePath = `outcasted/${name}`;
      console.log('🖼️ [OUTCASTED] Enrich images for:', {
        slug: p?.slug,
        name,
        basePath,
        existingCount: existing.length,
        existingSample: existing[0]
      });
      const files = await listAllFilesRecursivelyShallow(basePath);
      console.log('🖼️ [OUTCASTED] Storage files found:', {
        basePath,
        count: files.length,
        sample: files?.[0]
      });

      const urls = files
        .map((f) => {
          const fullPath = `${f.__path}/${f.name}`;
          return toPublicUrl(fullPath);
        })
        .filter(Boolean);

      console.log('🖼️ [OUTCASTED] Public URLs built:', {
        basePath,
        count: urls.length,
        sample: urls?.[0]
      });

      const deduped = Array.from(new Set([...existing, ...urls]));
      if (deduped.length === 0) return p;

      console.log('🖼️ [OUTCASTED] Final images:', {
        slug: p?.slug,
        basePath,
        count: deduped.length,
        first: deduped[0]
      });

      return {
        ...p,
        image: deduped[0],
        images: deduped
      };
    };

    const enriched = await Promise.all(items.map((p) => {
      if ((p?.collection || '').toString().toLowerCase() !== 'outcasted') return p;
      return enrichOne(p);
    }));

    return enriched;
  },

  async getAllProducts() {
    try {
      console.log('🔍 Fetching products from Supabase...');

      const { data, error } = await requireSupabase()
        .from('products')
        .select(`
          *,
          product_images (
            id,
            url,
            position
          ),
          product_variants (
            id,
            gelato_variant_id,
            sku,
            size,
            color,
            color_hex,
            price,
            stock,
            is_available,
            image_url,
            design
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching products:', error);
        throw error;
      }

      console.log('✅ Products fetched:', data?.length);
      console.log('📦 Sample product:', data?.[0]);

      let transformed = data.map(transformProduct);
      transformed = await this.enrichOutcastedImages(transformed);
      console.log('📦 Sample transformed:', transformed?.[0]);

      return transformed;
    } catch (err) {
      console.error('❌ Error in getAllProducts:', err);
      throw err;
    }
  },

  async getAllProductsIncludingInactive() {
    try {
      console.log('🔍 Fetching ALL products (including inactive) from Supabase...');

      const { data, error } = await requireSupabase()
        .from('products')
        .select(`
          *,
          product_images (
            id,
            url,
            position
          ),
          product_variants (
            id,
            gelato_variant_id,
            sku,
            size,
            color,
            color_hex,
            price,
            stock,
            is_available,
            image_url,
            design
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching products:', error);
        throw error;
      }

      console.log('✅ Products fetched (including inactive):', data?.length);
      console.log('📦 Sample product:', data?.[0]);

      let transformed = data.map(transformProduct);
      transformed = await this.enrichOutcastedImages(transformed);
      console.log('📦 Sample transformed:', transformed?.[0]);

      return transformed;
    } catch (err) {
      console.error('❌ Error in getAllProductsIncludingInactive:', err);
      throw err;
    }
  },

  async getProductById(id) {
    const { data, error } = await requireSupabase()
      .from('products')
      .select(`
        *,
        product_images (
          id,
          url,
          position
        ),
        product_variants (
          id,
          gelato_variant_id,
          sku,
          size,
          color,
          color_hex,
          price,
          stock,
          is_available,
          image_url,
          design
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }

    console.log('📦 Product loaded:', data);
    return data ? transformProduct(data) : null;
  },

  async getProductsByCollection(collection) {
    const { data, error } = await requireSupabase()
      .from('products')
      .select(`
        *,
        product_images (
          id,
          url,
          position
        ),
        product_variants (
          id,
          gelato_variant_id,
          sku,
          size,
          color,
          color_hex,
          price,
          stock,
          is_available,
          image_url
        )
      `)
      .eq('collection', collection)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching collection products:', error);
      throw error;
    }

    return data.map(transformProduct);
  },

  async searchProducts(searchTerm) {
    const { data, error } = await requireSupabase()
      .from('products')
      .select(`
        *,
        product_images (
          id,
          url,
          position
        ),
        product_variants (
          id,
          gelato_variant_id,
          sku,
          size,
          color,
          color_hex,
          price,
          stock,
          is_available,
          image_url
        )
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching products:', error);
      throw error;
    }

    return data.map(transformProduct);
  },

  async createProduct(product) {
    const productData = {
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency || 'EUR',
      image: product.images?.[0] || '/placeholder-product.svg',
      category: product.category || 'apparel',
      collection: product.collection || 'first-contact',
      sku: product.sku,
      gelato_product_id: product.gelatoProductId,
      is_active: true
    };

    const { data: createdProduct, error: productError } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (productError) {
      console.error('Error creating product:', productError);
      throw productError;
    }

    if (product.images && product.images.length > 0) {
      const images = product.images.map((url, index) => ({
        product_id: createdProduct.id,
        url,
        position: index
      }));

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(images);

      if (imagesError) {
        console.error('Error creating images:', imagesError);
      }
    }

    if (product.variants && product.variants.length > 0) {
      const variants = product.variants.map(v => ({
        product_id: createdProduct.id,
        gelato_variant_id: v.gelatoVariantId,
        sku: v.sku || `${product.sku}-${v.size}-${v.color}`,
        size: v.size,
        color: v.color,
        color_hex: v.colorHex,
        price: v.price,
        stock: v.stock || 999,
        is_available: v.isAvailable !== undefined ? v.isAvailable : true,
        image_url: v.image || null
      }));

      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(variants);

      if (variantsError) {
        console.error('Error creating variants:', variantsError);
      }
    }

    return transformProduct({
      ...createdProduct,
      product_images: product.images?.map((url, index) => ({ url, position: index })) || [],
      product_variants: product.variants || []
    });
  },

  async upsertProduct(product) {
    const { product_images, product_variants, ...productData } = product;

    const { data, error } = await requireSupabase()
      .from('products')
      .upsert(productData)
      .select()
      .single();

    if (error) {
      console.error('Error upserting product:', error);
      throw error;
    }

    if (product_images && product_images.length > 0) {
      await requireSupabase()
        .from('product_images')
        .delete()
        .eq('product_id', data.id);

      const images = product_images.map((img, index) => ({
        product_id: data.id,
        url: img.url || img,
        position: img.position !== undefined ? img.position : index
      }));

      await requireSupabase().from('product_images').insert(images);
    }

    if (product_variants && product_variants.length > 0) {
      await requireSupabase()
        .from('product_variants')
        .delete()
        .eq('product_id', data.id);

      const variants = product_variants.map(v => ({
        ...v,
        product_id: data.id
      }));

      await requireSupabase().from('product_variants').insert(variants);
    }

    return data;
  },

  async updateProduct(id, updates) {
    try {
      const { images: imageUrls, variants: variantData, ...productData } = updates;

      // Update main product
      const { data, error } = await requireSupabase()
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      // Update images if provided
      if (imageUrls && imageUrls.length > 0) {
        await requireSupabase()
          .from('product_images')
          .delete()
          .eq('product_id', id);

        const images = imageUrls.map((url, index) => ({
          product_id: id,
          url,
          position: index
        }));

        await requireSupabase().from('product_images').insert(images);
      }

      // Update variants if provided
      if (variantData && variantData.length > 0) {
        await requireSupabase()
          .from('product_variants')
          .delete()
          .eq('product_id', id);

        const variants = variantData.map(v => ({
          product_id: id,
          gelato_variant_id: v.gelatoVariantId,
          sku: v.sku,
          size: v.size,
          color: v.color,
          color_hex: v.colorHex,
          price: v.price,
          stock: v.stock || 999,
          is_available: v.isAvailable !== undefined ? v.isAvailable : true,
          image_url: v.image || null,
          design: v.design || null
        }));

        await requireSupabase().from('product_variants').insert(variants);
      }

      return data;
    } catch (err) {
      console.error('Error in updateProduct:', err);
      throw err;
    }
  },

  async deleteProduct(id) {
    const { error } = await requireSupabase()
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};

function transformProduct(dbProduct) {
  const images = (dbProduct.product_images || [])
    .sort((a, b) => a.position - b.position)
    .map(img => img.url);

  const variants = (dbProduct.product_variants || []).map(v => ({
    id: v.id,
    sku: v.sku,
    size: v.size,
    color: v.color,
    colorHex: v.color_hex,
    price: parseFloat(v.price),
    stock: v.stock,
    isAvailable: v.is_available,
    image: v.image_url,
    gelatoVariantId: v.gelato_variant_id,
    design: v.design
  }));

  const productImage = images.length > 0 ? images[0] : (dbProduct.image || '/placeholder-product.svg');
  const finalImages = images.length > 0 ? images : [productImage];

  return {
    id: dbProduct.id,
    slug: dbProduct.slug,
    name: dbProduct.name,
    description: dbProduct.description,
    price: parseFloat(dbProduct.price),
    currency: dbProduct.currency,
    image: productImage,
    images: finalImages,
    category: dbProduct.category,
    collection: dbProduct.collection,
    sku: dbProduct.sku,
    gelatoProductId: dbProduct.gelato_product_id,
    variants,
    isActive: dbProduct.is_active,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at
  };
}

export default productsService;
