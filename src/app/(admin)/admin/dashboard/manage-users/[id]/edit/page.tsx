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
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit user</h1>
      <UserEditForm user={plainUser} />
    </div>
  );
}
