import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function PremiumUpgradeModal({ onClose, currentCredits, googleId, userName, userEmail, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Create order on backend
      const orderRes = await fetch(`${API_BASE}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleId }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.error || 'Failed to create payment order');
      }

      const { orderId, amount, currency, keyId } = await orderRes.json();

      // 2. Open Razorpay checkout
      const options = {
        key: keyId,
        amount,
        currency,
        name: 'KCET Predictor',
        description: 'KCET Pro Pass — Unlimited Predictions',
        order_id: orderId,
        handler: async (response) => {
          // 3. Verify payment on backend
          try {
            const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                googleId,
              }),
            });

            if (verifyRes.ok) {
              const data = await verifyRes.json();
              if (data.success) {
                onPaymentSuccess && onPaymentSuccess(data);
                onClose();
              } else {
                setError('Payment verification failed. Contact support.');
              }
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch {
            setError('Network error during verification. Your payment is safe — contact support if not upgraded.');
          }
        },
        prefill: {
          name: userName || '',
          email: userEmail || '',
        },
        theme: {
          color: '#7c3aed',
          backdrop_color: 'rgba(15, 23, 42, 0.85)',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      if (!window.Razorpay) {
        throw new Error('Payment gateway is loading. Please try again in a moment.');
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setError(`Payment failed: ${response.error.description || 'Unknown error'}. Please try again.`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" style={{ zIndex: 300 }} onClick={onClose}>
      <div 
        className="auth-shell" 
        style={{ maxWidth: '500px', width: '90%', padding: '32px' }}
        onClick={e => e.stopPropagation()}
      >
        <button className="rating-close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', color: 'var(--accent-1)', marginBottom: '8px' }}>
            Insufficient Credits
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.5' }}>
            You have {currentCredits} credits remaining. Each prediction requires 20 credits. 
            Upgrade to Premium for unlimited predictions, or wait until your daily reset.
          </p>
        </div>

        <div 
          className="premium-plan-card" 
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(99, 102, 241, 0.1))',
            border: '1px solid var(--accent-1)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--accent-1)', color: '#fff', fontSize: '12px', fontWeight: 'bold', padding: '4px 16px', borderBottomLeftRadius: '12px' }}>
            BEST VALUE
          </div>
          <h3 style={{ fontSize: '22px', marginBottom: '12px', color: '#fff' }}>KCET Pro Pass</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--accent-1)', marginBottom: '16px' }}>
            ₹99 <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 'normal' }}>/ one-time</span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: '#e2e8f0' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--green)' }}>✓</span> Unlimited Predictions
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--green)' }}>✓</span> Priority Access
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--green)' }}>✓</span> Faster Processing
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--green)' }}>✓</span> No Daily Limits
            </li>
          </ul>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
            color: '#fca5a5',
            fontSize: '13px',
            lineHeight: '1.4',
          }}>
            {error}
          </div>
        )}

        <button 
          className="primary-btn" 
          style={{ 
            width: '100%', 
            padding: '16px', 
            fontSize: '16px', 
            fontWeight: 'bold',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'wait' : 'pointer',
          }}
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Upgrade to Premium — ₹99'}
        </button>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '6px',
          color: '#64748b', 
          fontSize: '12px' 
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          Secured by Razorpay • UPI, Cards, Netbanking accepted
        </div>
      </div>
    </div>
  );
}
