import React from 'react';
import { useTexts } from '@/hooks/useTexts';

const SkipLink = () => {
  const texts = useTexts();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gray-900 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
    >
      {texts.skipLink.text}
    </a>
  );
};

export default SkipLink;
