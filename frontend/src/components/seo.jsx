import { Helmet } from 'react-helmet-async';

function SEO({ 
  title, 
  description, 
  keywords,
  ogImage = '/og-image.png',
  canonicalUrl 
}) {
  const siteName = 'LiteTools';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = 'Free online tools for text, images, PDFs, developers, and more. No sign-up required. Privacy-first.';
  const metaDescription = description || defaultDescription;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={metaDescription} />
      <meta property="twitter:image" content={ogImage} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </Helmet>
  );
}

export default SEO;