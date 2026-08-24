import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterOverlay from '@/components/fullwide/RegisterOverlay';
import SEO from '@/components/SEO';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEO title="Inici de sessió — Higgins Gràfic" />
      <RegisterOverlay
        initialMode="login"
        onClose={() => navigate('/')}
      />
    </>
  );
}

