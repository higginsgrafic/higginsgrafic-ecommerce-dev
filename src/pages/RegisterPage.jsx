import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterOverlay from '@/components/fullwide/RegisterOverlay';
import SEO from '@/components/SEO';

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEO title="Registre — Higgins Gràfic" />
      <RegisterOverlay
        initialMode="register"
        onClose={() => navigate('/')}
      />
    </>
  );
}

