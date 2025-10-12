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
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");

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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess(false);
		try {
			const res = await fetch(`/api/admin/users/${user._id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: form.name,
					isEmailVerified: form.isEmailVerified
				}),
			});
			if (!res.ok) throw new Error("Update failed");
			setSuccess(true);
		} catch {
			setError("Fehler beim Speichern.");
		} finally {
			setLoading(false);
		}
	};

		// Admin Actions
		const [actionLoading, setActionLoading] = useState("");
		const [actionError, setActionError] = useState("");
		const [actionSuccess, setActionSuccess] = useState("");

		// User löschen
		const handleDelete = async () => {
			if (!window.confirm("Diesen User wirklich löschen?")) return;
			setActionLoading("delete"); setActionError(""); setActionSuccess("");
			try {
				const res = await fetch(`/api/admin/users/${user._id}`, { method: "DELETE" });
				if (!res.ok) throw new Error("Delete failed");
				setActionSuccess("User gelöscht.");
			} catch {
				setActionError("Fehler beim Löschen.");
			} finally {
				setActionLoading("");
			}
		};

		// User deaktivieren/reaktivieren
			const handleToggleActive = async () => {
				setActionLoading("toggle"); setActionError(""); setActionSuccess("");
				try {
					const res = await fetch(`/api/admin/users/${user._id}/toggle-active`, { method: "PATCH" });
					if (!res.ok) throw new Error("Toggle failed");
					const data = await res.json();
					setIsActive(data.isActive);
					setActionSuccess(data.isActive ? "User reaktiviert." : "User deaktiviert.");
				} catch {
					setActionError("Fehler beim Aktivieren/Deaktivieren.");
				} finally {
					setActionLoading("");
				}
			};


		return (
			<Card className="p-6 space-y-6">
				<div>
					<label className="block font-medium mb-1">Name</label>
					<Input name="name" value={form.name} disabled />
				</div>
				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						name="isEmailVerified"
						checked={form.isEmailVerified}
						disabled
						id="isEmailVerified"
					/>
					<label htmlFor="isEmailVerified">Email verifiziert</label>
				</div>
				<div className="flex flex-col gap-2 pt-4 mt-6">
					<Button variant="destructive" onClick={handleDelete} disabled={actionLoading === "delete"}>
						{actionLoading === "delete" ? "Lösche..." : "User löschen"}
					</Button>
					<Button variant="outline" onClick={handleToggleActive} disabled={actionLoading === "toggle"}>
						{actionLoading === "toggle"
							? (isActive ? "Deaktiviere..." : "Aktiviere...")
							: (isActive ? "User deaktivieren" : "User reaktivieren")}
					</Button>
					{actionSuccess && <div className="text-green-600">{actionSuccess}</div>}
					{actionError && <div className="text-red-600">{actionError}</div>}
				</div>
			</Card>
		);
}
