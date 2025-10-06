/**
 * Dummy-Implementierung für Passwort-Reset-Mail
 * In Produktion: Echte E-Mail-Logik einbauen!
 */
export async function sendPasswordResetEmail(email: string, userId: string): Promise<void> {
	// Hier würde die echte E-Mail-Logik stehen (z.B. mit nodemailer, SendGrid, etc.)
	console.log(`Sende Passwort-Reset-Link an ${email} für User ${userId}`);
	// Simuliere kurze Verzögerung
	await new Promise((resolve) => setTimeout(resolve, 500));
}
