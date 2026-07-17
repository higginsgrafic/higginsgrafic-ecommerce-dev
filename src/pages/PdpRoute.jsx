import React from 'react';
import { useParams } from 'react-router-dom';
import ProductDetailTemplate from '@/components/ProductDetailTemplate';
import { findPdpProduct } from '@/config/pdpProducts';

export default function PdpRoute() {
  const { collection, product } = useParams();
  const productData = findPdpProduct(collection, product);

  if (!productData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Producte no trobat
      </div>
    );
  }

  return <ProductDetailTemplate product={productData} />;
}
