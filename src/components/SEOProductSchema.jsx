import React from 'react';
import { Helmet } from 'react-helmet';
import { buildSiteUrl } from '@/config/siteOrigin.js';

/**
 * react-helmet insereix el contingut de <script type="application/ld+json">
 * sense escapar: un `</script>` dins del nom o la descripció d'un producte
 * trencaria el tag i injectaria HTML/JS. Escapem `<` com a \u003c.
 */
function jsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/**
 * Component per afegir structured data (JSON-LD) a les pàgines de producte
 * Això ajuda Google i altres motors de cerca a entendre millor el contingut
 */
const SEOProductSchema = ({ product, url }) => {
  if (!product) return null;

  const resolvedUrl = buildSiteUrl(url || `/product/${product.id}`);
  const priceNumber = typeof product?.price === 'number'
    ? product.price
    : Number.parseFloat(String(product?.price ?? ''));
  const hasPrice = Number.isFinite(priceNumber);

  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image,
    "offers": {
      "@type": "Offer",
      "url": resolvedUrl,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "GRÀFIC"
      }
    },
    "brand": {
      "@type": "Brand",
      "name": "GRÀFIC"
    }
  };

  if (product?.sku) {
    schema.sku = String(product.sku);
  }

  if (hasPrice) {
    schema.offers.price = priceNumber.toFixed(2);
  }

  // Afegir aggregateRating si tenim reviews (futur)
  if (product.rating && product.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviewCount
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {jsonLd(schema)}
      </script>
    </Helmet>
  );
};

export default SEOProductSchema;
