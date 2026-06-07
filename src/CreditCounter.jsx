import React from 'react';

export default function CreditCounter({ credits, isPremium }) {
  const percentage = isPremium ? 100 : Math.min(100, Math.max(0, (credits / 100) * 100));
  
  return (
    <div className="credit-counter">
      <div className="credit-counter-row">
        <span className="credit-counter-label" style={{ color: isPremium ? 'var(--accent-1)' : '#cbd5e1' }}>
          {isPremium ? 'PRO PASS' : `${credits} Credits`}
        </span>
        <div className="credit-counter-badge">
          <span>⚡</span> {isPremium ? '∞' : credits}
        </div>
      </div>
      
      {!isPremium && (
        <div className="credit-counter-progress-bar">
          <div style={{ 
            width: `${percentage}%`, 
            height: '100%', 
            background: percentage > 20 ? 'var(--accent-1)' : 'var(--error-color)',
            transition: 'width 0.3s ease'
          }} />
        </div>
      )}
    </div>
  );
}
