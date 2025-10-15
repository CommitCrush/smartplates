import React from 'react';
import Layout from '@/components/layout/Layout';
interface UserLayoutProps {
  children: React.ReactNode;
}
export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <Layout>
      <div>
        {children}
      </div>
    </Layout>
  );
}