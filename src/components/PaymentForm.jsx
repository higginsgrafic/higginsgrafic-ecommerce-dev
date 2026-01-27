import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/ToastContext';

const PaymentForm = ({ amount, onSuccess, billingDetails }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { error: showError } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const readCssVar = (name) => {
    try {
      const raw = window.getComputedStyle(document.documentElement).getPropertyValue(name);
      const value = (raw || '').toString().trim();
      return value || null;
    } catch {
      return null;
    }
  };

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: `hsl(${readCssVar('--foreground') || '0 0% 0%'})`,
        fontFamily: 'Roboto, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '14px',
        '::placeholder': {
          color: `hsl(${readCssVar('--muted-foreground') || '0 0% 50%'})`,
        },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: true,
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Crear Payment Intent al backend
      const response = await fetch('/.netlify/functions/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convertir a cèntims
          currency: 'eur',
        }),
      });

      if (!response.ok) {
        throw new Error('Error creant Payment Intent');
      }

      const { clientSecret } = await response.json();

      // Confirmar pagament amb Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: `${billingDetails.firstName} ${billingDetails.lastName}`,
              email: billingDetails.email,
              address: {
                line1: billingDetails.address,
                city: billingDetails.city,
                postal_code: billingDetails.postalCode,
                country: billingDetails.country === 'Espanya' ? 'ES' : billingDetails.country,
              },
            },
          },
        }
      );

      if (stripeError) {
        const errorMsg = getErrorMessage(stripeError);
        setErrorMessage(errorMsg);
        showError(errorMsg);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        if (onSuccess) {
          onSuccess(paymentIntent);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = 'Error processant el pagament';
      setErrorMessage(errorMsg);
      showError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const getErrorMessage = (error) => {
    const errorMessages = {
      card_declined: 'La targeta ha estat rebutjada. Si us plau, prova amb una altra targeta.',
      insufficient_funds: 'Fons insuficients. Si us plau, prova amb una altra targeta.',
      invalid_cvc: 'El codi CVV és invàlid.',
      expired_card: 'La targeta ha caducat.',
      incorrect_cvc: 'El codi CVV és incorrecte.',
      processing_error: 'Error processant el pagament. Si us plau, torna-ho a intentar.',
      invalid_number: 'El número de targeta és invàlid.',
    };

    return errorMessages[error.code] || error.message || 'Error desconegut. Si us plau, torna-ho a intentar.';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-border rounded-md">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-12 text-sm font-oswald uppercase tracking-wider rounded-sm"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Processant...
          </span>
        ) : (
          'Valida el pagament'
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground opacity-50">
        Les teves dades estan protegides amb encriptació SSL
      </p>
    </form>
  );
};

export default PaymentForm;
