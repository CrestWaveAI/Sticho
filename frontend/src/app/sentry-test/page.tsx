'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SentryTestPage() {
  const triggerError = () => {
    throw new Error("Sentry Frontend Verification Success");
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-canvas)', padding: '2rem' }}>
      <Card style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-ink)' }}>Sentry Integration Test</h1>
        <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Click the button below to trigger a test client-side runtime exception. If Sentry is correctly initialized, the error will be reported to the dashboard.
        </p>
        <Button onClick={triggerError} variant="danger" fullWidth>
          Trigger Test Error
        </Button>
      </Card>
    </div>
  );
}
