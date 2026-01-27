import React from 'react';
import { Helmet } from 'react-helmet';
import { SITE_ORIGIN, buildSiteUrl } from '@/config/siteOrigin.js';

/**
 * Component SEO reutilitzable amb suport per:
 * - Meta tags bàsics
 * - Open Graph (Facebook, LinkedIn)
 * - Twitter Cards
 * - Schema.org JSON-LD
 */
function SEO({
  title,
  description,
  keywords,
  image = '/custom_logos/brand/marca-grafic-logo.svg', // Imatge per defecte
  url,
  type = 'website', // website, article, product
  article = null, // { publishedTime, modifiedTime, author, section, tags }
  product = null, // { price, currency, availability, brand }
  noindex = false,
  nofollow = false,
  canonical = null,
  schema = null, // Custom Schema.org data
}) {

  const contactEmail = (import.meta?.env?.VITE_CONTACT_EMAIL || 'higginsgrafic@gmail.com').toString().trim();

  // URL completa per Open Graph
  const fullUrl = buildSiteUrl(url || (typeof window !== 'undefined' ? window.location.pathname : '/'));

  // Imatge completa per Open Graph
  const fullImage = image.startsWith('http') ? image : buildSiteUrl(image);

  // Robots meta tag
  const robotsContent = [];
  if (noindex) robotsContent.push('noindex');
  else robotsContent.push('index');
  if (nofollow) robotsContent.push('nofollow');
  else robotsContent.push('follow');

  // Schema.org base Organization
  const baseOrganizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GRÀFIC",
    "url": SITE_ORIGIN,
    "logo": buildSiteUrl('/custom_logos/brand/marca-grafic-logo.svg'),
    "description": "Roba amb disseny únic. Samarretes amb dissenys exclusius que combinen art, ciència-ficció i filosofia.",
    "sameAs": [
      // Xarxes socials (afegir quan estiguin disponibles)
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": contactEmail,
      "availableLanguage": ["ca"]
    }
  };

  // WebSite schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GRÀFIC",
    "url": SITE_ORIGIN,
    "potentialAction": {
      "@type": "SearchAction",
      "target": buildSiteUrl('/search?q={search_term_string}'),
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang="ca" />
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robotsContent.join(', ')} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="GRÀFIC" />
      <meta property="og:locale" content="ca_ES" />

      {/* Article specific OG tags */}
      {type === 'article' && article && (
        <>
          {article.publishedTime && <meta property="article:published_time" content={article.publishedTime} />}
          {article.modifiedTime && <meta property="article:modified_time" content={article.modifiedTime} />}
          {article.author && <meta property="article:author" content={article.author} />}
          {article.section && <meta property="article:section" content={article.section} />}
          {article.tags && article.tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Product specific OG tags */}
      {type === 'product' && product && (
        <>
          {product.price && <meta property="product:price:amount" content={product.price} />}
          {product.currency && <meta property="product:price:currency" content={product.currency} />}
          {product.availability && <meta property="product:availability" content={product.availability} />}
          {product.brand && <meta property="product:brand" content={product.brand} />}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      {/* <meta name="twitter:site" content="@grafic" /> */}
      {/* <meta name="twitter:creator" content="@grafic" /> */}

      {/* Schema.org JSON-LD - Organization */}
      <script type="application/ld+json">
        {JSON.stringify(baseOrganizationSchema)}
      </script>

      {/* Schema.org JSON-LD - WebSite */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>

      {/* Custom Schema.org data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

export default SEO;
