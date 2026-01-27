/**
 * Sistema de variants per productes
 * Permet gestionar diferents colors, talles, SKUs i preus
 */

import { formatPrice } from '@/utils/formatters';

// Talles disponibles amb informació detallada
export const SIZES = {
  XS: {
    id: 'xs',
    label: 'XS',
    measurements: {
      chest: '81-86 cm',
      length: '68 cm'
    }
  },
  S: {
    id: 's',
    label: 'S',
    measurements: {
      chest: '86-91 cm',
      length: '70 cm'
    }
  },
  M: {
    id: 'm',
    label: 'M',
    measurements: {
      chest: '91-97 cm',
      length: '72 cm'
    }
  },
  L: {
    id: 'l',
    label: 'L',
    measurements: {
      chest: '97-102 cm',
      length: '74 cm'
    }
  },
  XL: {
    id: 'xl',
    label: 'XL',
    measurements: {
      chest: '102-107 cm',
      length: '76 cm'
    }
  },
  XXL: {
    id: 'xxl',
    label: 'XXL',
    measurements: {
      chest: '107-112 cm',
      length: '78 cm'
    }
  }
};

// Colors disponibles
export const COLORS = {
  WHITE: {
    id: 'white',
    label: 'Blanc',
    hex: '#FFFFFF',
    image: '/tshirt-white.jpg'
  },
  BLACK: {
    id: 'black',
    label: 'Negre',
    hex: '#181818',
    image: '/tshirt-black.jpg'
  },
  BLUE: {
    id: 'blue',
    label: 'Blau',
    hex: '#2563EB',
    image: '/tshirt-blue.jpg'
  },
  GREEN: {
    id: 'green',
    label: 'Verd',
    hex: '#10B981',
    image: '/tshirt-green.jpg'
  },
  RED: {
    id: 'red',
    label: 'Vermell',
    hex: '#DC2626',
    image: '/tshirt-red.jpg'
  }
};

// Tipus de teixit
export const FABRICS = {
  COTTON: {
    id: 'cotton',
    label: 'Cotó 100%',
    description: 'Cotó orgànic de qualitat premium'
  },
  BLEND: {
    id: 'blend',
    label: 'Cotó i poliéster',
    description: 'Mescla de cotó (80%) i poliéster (20%)'
  }
};

/**
 * Estructura de variant de producte
 * Cada producte pot tenir múltiples variants
 */
export class ProductVariant {
  constructor({
    sku,
    productId,
    size,
    color,
    fabric = FABRICS.COTTON,
    price,
    stock = 0,
    images = [],
    weight = 150, // grams
    isAvailable = true
  }) {
    this.sku = sku; // Identificador únic
    this.productId = productId; // Referència al producte base
    this.size = size;
    this.color = color;
    this.fabric = fabric;
    this.price = price;
    this.stock = stock;
    this.images = images;
    this.weight = weight;
    this.isAvailable = isAvailable && stock > 0;
  }

  // Mètodes útils
  getDisplayName() {
    return `${this.size.label} - ${this.color.label}`;
  }

  isInStock() {
    return this.stock > 0 && this.isAvailable;
  }

  canFulfillQuantity(quantity) {
    return this.stock >= quantity;
  }

  getFormattedPrice() {
    return formatPrice(this.price);
  }
}

/**
 * Exemple de variants per a un producte
 * En producció, això vindria de l'API de Gelato
 */
export const generateVariantsForProduct = (productId, basePrice = 29.99) => {
  const variants = [];
  const availableSizes = [SIZES.S, SIZES.M, SIZES.L, SIZES.XL];
  const availableColors = [COLORS.WHITE, COLORS.BLACK, COLORS.BLUE];

  availableSizes.forEach((size) => {
    availableColors.forEach((color) => {
      const sku = `GRF-${productId}-${size.id.toUpperCase()}-${color.id.toUpperCase()}`;

      variants.push(new ProductVariant({
        sku,
        productId,
        size,
        color,
        fabric: FABRICS.COTTON,
        price: basePrice,
        stock: Math.floor(Math.random() * 50) + 10, // Stock aleatori per testing
        images: [color.image],
        weight: 150
      }));
    });
  });

  return variants;
};

/**
 * Helper per trobar variant específica
 */
export const findVariant = (variants, sizeId, colorId) => {
  return variants.find(v =>
    v.size.id === sizeId && v.color.id === colorId
  );
};

/**
 * Helper per obtenir variants disponibles per talla
 */
export const getVariantsBySize = (variants, sizeId) => {
  return variants.filter(v => v.size.id === sizeId);
};

/**
 * Helper per obtenir variants disponibles per color
 */
export const getVariantsByColor = (variants, colorId) => {
  return variants.filter(v => v.color.id === colorId);
};

/**
 * Helper per obtenir talles disponibles per a un color
 */
export const getAvailableSizesForColor = (variants, colorId) => {
  const colorVariants = getVariantsByColor(variants, colorId);
  const availableSizes = new Set();

  colorVariants.forEach(v => {
    if (v.isInStock()) {
      availableSizes.add(v.size);
    }
  });

  return Array.from(availableSizes);
};

/**
 * Helper per obtenir colors disponibles per a una talla
 */
export const getAvailableColorsForSize = (variants, sizeId) => {
  const sizeVariants = getVariantsBySize(variants, sizeId);
  const availableColors = new Set();

  sizeVariants.forEach(v => {
    if (v.isInStock()) {
      availableColors.add(v.color);
    }
  });

  return Array.from(availableColors);
};

export default {
  SIZES,
  COLORS,
  FABRICS,
  ProductVariant,
  generateVariantsForProduct,
  findVariant,
  getVariantsBySize,
  getVariantsByColor,
  getAvailableSizesForColor,
  getAvailableColorsForSize
};
