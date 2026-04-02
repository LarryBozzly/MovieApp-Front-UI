/* ONE function to manage all metadata */
export function setPageMeta(options: {
  title: string;
  description: string;
  robots?: string;
  ogImage?: string;
  canonicalUrl?: string;
}) {
  document.title = options.title;

  const upsertMeta = (attr: string, key: string, content: string) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Update or create meta tags
  upsertMeta('name', 'description', options.description);
  upsertMeta('name', 'robots', options.robots ?? 'index, follow');
  upsertMeta('property', 'og:title', options.title);
  upsertMeta('property', 'og:description', options.description);
  upsertMeta('property', 'og:type', 'website');

  if (options.ogImage) {
    upsertMeta('property', 'og:image', options.ogImage);
  }

  // Handle canonical URL to prevent duplicate content issues in SPAs
  if (options.canonicalUrl) {
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', options.canonicalUrl);
  }
}
