import React from 'react';
import { Link } from 'react-router-dom';
import { useTexts } from '@/hooks/useTexts';
import { ExternalLink } from 'lucide-react';
import SEO from '@/components/SEO';

const CreativeCommonsPage = () => {
  const texts = useTexts();
  const cc = texts.pages.cc;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={cc.seo.title}
        description={cc.seo.description}
        type="website"
        url="/cc"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-oswald uppercase mb-4" style={{ color: '#141414' }}>
            {cc.title}
          </h1>
          <p className="text-base sm:text-lg font-roboto" style={{ color: '#141414', opacity: 0.7 }}>
            {cc.content}
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 lg:p-10 mb-8">
          {/* License Name */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold font-oswald uppercase mb-3" style={{ color: '#141414' }}>
              {cc.license}
            </h2>
            <p className="text-sm sm:text-base font-roboto leading-relaxed" style={{ color: '#141414', opacity: 0.8 }}>
              {cc.description}
            </p>
          </div>

          {/* What it means */}
          <div className="mb-8">
            <h3 className="text-lg sm:text-xl font-bold font-oswald uppercase mb-4" style={{ color: '#141414' }}>
              {cc.meaning}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">✓</span>
                <p className="text-sm sm:text-base font-roboto" style={{ color: '#141414' }}>
                  <strong className="font-medium">BY</strong> — {cc.attribution}
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">✓</span>
                <p className="text-sm sm:text-base font-roboto" style={{ color: '#141414' }}>
                  <strong className="font-medium">NC</strong> — {cc.nonCommercial}
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">✓</span>
                <p className="text-sm sm:text-base font-roboto" style={{ color: '#141414' }}>
                  <strong className="font-medium">ND</strong> — {cc.noDerivatives}
                </p>
              </li>
            </ul>
          </div>

          {/* External Link */}
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <p className="text-sm sm:text-base font-roboto mb-2" style={{ color: '#141414', opacity: 0.8 }}>
              {cc.moreInfo}
            </p>
            <a
              href={cc.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm sm:text-base font-roboto font-medium hover:underline transition-all"
              style={{ color: '#141414' }}
            >
              Creative Commons Official Website
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Copyright Notice */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-xs sm:text-sm font-roboto italic" style={{ color: '#141414', opacity: 0.6 }}>
              {cc.copyright}
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-block text-sm sm:text-base font-roboto font-medium hover:underline transition-all"
            style={{ color: '#141414', opacity: 0.7 }}
          >
            ← {texts.common.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreativeCommonsPage;
