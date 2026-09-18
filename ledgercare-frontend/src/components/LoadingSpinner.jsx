import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading blockchain data...', size = 32 }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      gap: '1rem',
      color: 'var(--text-secondary)',
      textAlign: 'center',
    }}>
      <Loader2 size={size} className="animate-spin" color="#60a5fa" />
      <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{message}</div>
    </div>
  );
}
