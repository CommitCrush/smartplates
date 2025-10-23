import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Login to your account
          </h2>
          <p className="mt-2 text-center text-sm text-foreground-muted">
            Welcome back to SmartPlates
          </p>
        </div>
        <LoginForm />
        <div className="">
          <Button className="w-full mt-2 text-neutral-700" variant="default">
            Don&apos;t have an account yet?
            <span className="text-coral-500">Register Now</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
