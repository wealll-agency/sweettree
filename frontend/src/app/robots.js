export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/user/'],
    },
    sitemap: 'https://www.sweettreeon.com/sitemap.xml',
  }
}
