import React from 'react';
import Layout from '@/components/layout/Layout';
interface UserLayoutProps {
  children: React.ReactNode;
}
export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <Layout>
      <div className="max-w-[2000px] mx-auto py-6 px-2 sm:px-4 lg:px-6 xl:px-8">
        {children}
      </div>
    </Layout>
  );
}