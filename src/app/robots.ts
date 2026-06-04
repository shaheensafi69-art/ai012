import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/'], // جلوگیری از ورود گوگل به داشبورد و API
    },
    sitemap: 'https://safiai.site/sitemap.xml',
  };
}