import axios from 'axios';

export default async function sitemap() {
  const baseUrl = 'https://www.sweettreeon.com';

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.sweettreeon.com/api';
    const response = await axios.get(`${apiUrl}/products/public?limit=1000`);
    const products = response.data?.data || [];

    const productUrls = products.map((product) => ({
      url: `${baseUrl}/shop-details?id=${product._id}&name=${encodeURIComponent(product.name)}`,
      lastModified: new Date(product.updatedAt || new Date()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/shop`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      ...productUrls,
    ];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    // Fallback sitemap
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/shop`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      }
    ];
  }
}
