import React from "react";
import { notFound } from "next/navigation";
import { getUserById } from "@/services/userService";
import UserEditForm from "@/components/manage_users/edit";

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

function serializeUser(user: any) {
  return {
    ...user,
    _id: user._id?.toString() ?? '',
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : '',
    updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : '',
    lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : '',
    // Nur primitive Werte weitergeben
  };
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) return notFound();
  const plainUser = serializeUser(user);
  return (
    <div className="bg-primary-100 min-h-screen flex flex-col">
      <div className="max-w-2xl w-full mx-auto py-8 flex-1 ">
        <h1 className="text-2xl font-bold mb-6">Edit user</h1>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <UserEditForm user={plainUser} />
        </div>
      </div>
    </div>
  );
}
