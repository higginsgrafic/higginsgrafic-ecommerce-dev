import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useTexts } from '@/hooks/useTexts';

const NotFoundPage = () => {
  const texts = useTexts();

  return (
    <>
      <Helmet>
        <title>{texts.notFound.seo.title}</title>
        <meta name="description" content={texts.notFound.seo.description} />
      </Helmet>

      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
          {/* 404 Number */}
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-9xl font-bold font-oswald mb-4"
            style={{ color: '#141414' }}
          >
            {texts.notFound.number}
          </motion.h1>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold font-oswald mb-4" style={{ color: '#141414' }}>
            {texts.notFound.title}
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-8 font-roboto">
            {texts.notFound.message}
          </p>

          {/* Actions */}
          <div className="space-y-4">
            <Link
              to="/"
              className="block w-full bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors font-oswald uppercase tracking-wider"
            >
              {texts.notFound.backHome}
            </Link>

            <Link
              to="/first-contact"
              className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors font-oswald uppercase tracking-wider"
            >
              {texts.notFound.viewCollections}
            </Link>
          </div>

          {/* Decorative element */}
          <div className="mt-12 opacity-20">
            <svg
              className="mx-auto h-24 w-24"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default NotFoundPage;
