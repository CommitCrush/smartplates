import { Suspense } from 'react';

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Details</h1>
      <Suspense fallback={<div>Loading user details...</div>}>
        <div className="bg-white rounded-lg shadow p-6">
          <p>User ID: {id}</p>
          <p className="text-muted-foreground mt-2">
            User detail component will be implemented here.
          </p>
        </div>
      </Suspense>
    </div>
  );
}