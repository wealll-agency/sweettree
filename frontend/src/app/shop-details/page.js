import React, { cache, Suspense } from 'react';
import ShopDetailsClient from './ShopDetailsClient';

function slugify(text) {
  if (!text) return '';
  return text.toString().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function matchesProduct(product, query) {
  if (!product || !query) return false;
  const decoded = decodeURIComponent(query).toLowerCase().trim();
  const prodId = product._id ? product._id.toString() : '';
  if (prodId === decoded) return true;

  const prodName = product.name ? product.name.toLowerCase().trim() : '';
  const prodSlug = slugify(product.name).toLowerCase();
  const querySlug = slugify(decoded).toLowerCase();

  return (
    prodName === decoded ||
    prodSlug === querySlug ||
    prodName.replace(/[^a-z0-9]/g, '') === decoded.replace(/[^a-z0-9]/g, '')
  );
}

function extractProductQuery(searchParams) {
  if (!searchParams) return null;
  if (searchParams.id) return searchParams.id;
  if (searchParams.name) return searchParams.name;
  const keys = Object.keys(searchParams);
  if (keys.length > 0) {
    const rawKey = keys[0];
    if (rawKey && rawKey !== 'id' && rawKey !== 'name') {
      return rawKey;
    }
  }
  return null;
}

const getProduct = cache(async (query) => {
  if (!query) return null;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.sweettreeon.com/api';
    
    // Check if query is 24-character hex Mongo ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(query)) {
      const res = await fetch(`${apiUrl}/products/${query}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.product) return data.product;
      }
    }

    // Otherwise, fetch public products and match by name/slug
    const res = await fetch(`${apiUrl}/products`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    const products = data.products || data.data || [];

    const matched = products.find(p => matchesProduct(p, query));
    return matched || null;
  } catch (err) {
    console.error('Error fetching product for SEO metadata:', err);
    return null;
  }
});

function formatImageUrl(url) {
  if (!url) return 'https://www.sweettreeon.com/top_product1.png';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const cleanedUrl = url.startsWith('/') ? url : `/${url}`;
  return `https://www.sweettreeon.com${cleanedUrl}`;
}

function cleanDescription(desc, fallbackName) {
  if (!desc) return `Buy ${fallbackName || 'premium products'} online at SweetTree - Premium quality dry fruits, nuts, and healthy snacks.`;
  const plainText = desc.replace(/<[^>]*>?/gm, '').trim();
  if (plainText.length <= 160) return plainText;
  return `${plainText.substring(0, 157)}...`;
}

export async function generateMetadata({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const query = extractProductQuery(resolvedSearchParams);
  const product = query ? await getProduct(query) : null;

  if (!product) {
    return {
      title: 'Product Details | SweetTree',
      description: 'Explore our collection of premium dry fruits, nuts, and healthy snacks at SweetTree.',
      alternates: {
        canonical: 'https://www.sweettreeon.com/shop-details',
      },
    };
  }

  const title = product.metaTitle ? product.metaTitle : `${product.name} | SweetTree`;
  const description = product.metaDescription ? product.metaDescription : cleanDescription(product.description, product.name);
  const productSlug = slugify(product.name);
  const canonicalUrl = `https://www.sweettreeon.com/shop-details?${productSlug}`;
  const images = (product.images && product.images.length > 0)
    ? product.images.map(img => formatImageUrl(img))
    : ['https://www.sweettreeon.com/top_product1.png'];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'SweetTree',
      type: 'website',
      images: images.map(img => ({
        url: img,
        alt: product.name,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [images[0]],
    },
  };
}

export default async function ShopDetailsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const query = extractProductQuery(resolvedSearchParams);
  const product = query ? await getProduct(query) : null;

  let jsonLdScript = null;

  if (product) {
    let basePrice = product.price || 0;
    let finalPrice = basePrice;
    if (product.discount > 0) {
      if (product.discountType === 'Percent') {
        finalPrice = Math.round(basePrice * (1 - product.discount / 100));
      } else {
        finalPrice = Math.max(0, basePrice - product.discount);
      }
    }

    const publicImages = (product.images && product.images.length > 0)
      ? product.images.map(img => formatImageUrl(img))
      : ['https://www.sweettreeon.com/top_product1.png'];

    const productSlug = slugify(product.name);
    const productUrl = `https://www.sweettreeon.com/shop-details?${productSlug}`;

    const productJsonLd = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": publicImages,
      "description": cleanDescription(product.description, product.name),
      "sku": product.sku || String(product._id),
      "offers": {
        "@type": "Offer",
        "url": productUrl,
        "priceCurrency": "INR",
        "price": finalPrice,
        "availability": (product.stock && product.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/NewCondition"
      }
    };

    if (product.averageRating > 0 && product.numReviews > 0) {
      productJsonLd.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": product.averageRating,
        "reviewCount": product.numReviews
      };
    }

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.sweettreeon.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Shop",
          "item": "https://www.sweettreeon.com/shop"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": product.name,
          "item": productUrl
        }
      ]
    };

    jsonLdScript = (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </>
    );
  }

  return (
    <>
      {jsonLdScript}
      <Suspense fallback={<div className="container-fluid px-4 px-lg-5 py-5 text-center">Loading product details...</div>}>
        <ShopDetailsClient initialProduct={product} />
      </Suspense>
    </>
  );
}
