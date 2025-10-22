import Link from "next/link";
import { RegisterForm } from "@/components/forms/registerForm";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-foreground-muted">
            Join SmartPlates and start planning your meals
          </p>
        </div>
        <RegisterForm />
        <div className="">
          <Button className="w-full mt-2 text-neutral-700" variant="default">
            Already have an account?
            <span className="text-coral-500">Sign In</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
