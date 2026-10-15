import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Dominio público del sitio (el WordPress vive en /admin de este mismo dominio).
const site = process.env.SITE_URL || 'https://etchegarayautos.cl';

export default defineConfig({
  site,
  base: process.env.BASE_PATH || '/',
  integrations: [sitemap()],
  build: { format: 'directory' },
  trailingSlash: 'always',
});
