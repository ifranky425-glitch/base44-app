import React from 'react';
import { Button } from '@/components/ui/button';

export default function UserNotRegisteredError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-semibold mb-2">Access not granted</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Your account is not registered for this app. Please contact an administrator to request access.
      </p>
      <Button onClick={() => window.location.reload()}>Try again</Button>
    </div>
  );
}