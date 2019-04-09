import Helmet from 'react-helmet';
import React from 'react';

interface MetaTagsProps {
  title?: string;
  description?: string;
}

const MetaTags: React.FC<MetaTagsProps> = ({ title, description }) => {
  const pageTitle = title
    ? `${title} – You Need A Parser`
    : 'You Need A Parser – Convert CSV files for use with YNAB';

  const pageDescription =
    description ||
    'YNAP converts CSV files from a variety of sources into a ' +
      'format that can easily be imported into You Need A Budget. ' +
      'Your files will never leave your browser.';

  return (
    <Helmet>
      <link rel="shortcut icon" href="/favicon.ico" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#3ebd93" />
      <meta name="msapplication-TileColor" content="#3ebd93" />
      <meta name="theme-color" content="#f1f4f9" />

      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://ynap.leolabs.org/" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content="/meta-image.jpg" />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://ynap.leolabs.org/" />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={pageDescription} />
      <meta property="twitter:image" content="/meta-image.jpg" />
    </Helmet>
  );
};

export default MetaTags;
