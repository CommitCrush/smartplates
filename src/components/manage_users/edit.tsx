"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/Dropdowns";
import { User, UserRole } from "@/types/user";

interface UserEditFormProps {
	user: User;
}

// Entfernt: roleOptions

export default function UserEditForm({ user }: UserEditFormProps) {
	const [form, setForm] = useState({
		name: user.name || "",
		isEmailVerified: user.isEmailVerified || false
	});
		const [isActive, setIsActive] = useState((user as any).isActive !== false); // Default true, falls Feld fehlt

		const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			const { name, value, type } = e.target;
			let fieldValue: string | boolean = value;
			if (type === "checkbox") {
				fieldValue = (e.target as HTMLInputElement).checked;
			}
			setForm((prev) => ({
				...prev,
				[name]: fieldValue,
			}));
		};


		// Admin Actions
		const [actionLoading, setActionLoading] = useState("");
		const [actionError, setActionError] = useState("");
		const [actionSuccess, setActionSuccess] = useState("");

		// Delete user
		const handleDelete = async () => {
			if (!window.confirm("Are you sure you want to delete this user?")) return;
			setActionLoading("delete"); setActionError(""); setActionSuccess("");
			try {
				const res = await fetch(`/api/admin/users/${user._id}`, { method: "DELETE" });
				if (!res.ok) throw new Error("Delete failed");
				setActionSuccess("User deleted.");
			} catch {
				setActionError("Error deleting user.");
			} finally {
				setActionLoading("");
			}
		};

		// Deactivate/reactivate user
			const handleToggleActive = async () => {
				setActionLoading("toggle"); setActionError(""); setActionSuccess("");
				try {
					const res = await fetch(`/api/admin/users/${user._id}/toggle-active`, { method: "PATCH" });
					if (!res.ok) throw new Error("Toggle failed");
					const data = await res.json();
					setIsActive(data.isActive);
					setActionSuccess(data.isActive ? "User reactivated." : "User deactivated.");
				} catch {
					setActionError("Error activating/deactivating user.");
				} finally {
					setActionLoading("");
				}
			};


		   return (
			   <Card className="max-w-5xl mx-auto p-16 space-y-10">
				   <div>
					   <div className="font-medium text-sm text-gray-500">User name</div>
					   <div className="text-gray-800 dark:text-gray-200 mb-2">{user.name}</div>
				   </div>
				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						name="isEmailVerified"
						checked={form.isEmailVerified}
						disabled
						id="isEmailVerified"
					/>
					<label htmlFor="isEmailVerified">Email verified</label>
				</div>
				   <div className="flex flex-col gap-3 pt-4 mt-6">
					   <Button
						   variant="outline"
						   className=" text-red-500"
						   onClick={handleDelete}
						   disabled={actionLoading === "delete"}
					   >
						   {actionLoading === "delete" ? "Deleting..." : "Delete user"}
					   </Button>
					   <Button variant="outline" onClick={handleToggleActive} disabled={actionLoading === "toggle"}>
						   {actionLoading === "toggle"
							   ? (isActive ? "Deactivating..." : "Activating...")
							   : (isActive ? "Deactivate user" : "Reactivate user")}
					   </Button>
					   {actionSuccess && <div className="text-green-600">{actionSuccess}</div>}
					   {actionError && <div className="text-red-600">{actionError}</div>}
				   </div>
			</Card>
		);
}
