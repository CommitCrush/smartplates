import { Suspense } from 'react';

export default function ManageCookwareCommissionsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Cookware Commissions</h1>
      <Suspense fallback={<div>Loading commissions...</div>}>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-muted-foreground">
            Cookware commission management will be implemented here.
          </p>
        </div>
      </Suspense>
    </div>
  );
}