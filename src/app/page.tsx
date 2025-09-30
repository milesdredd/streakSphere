import { LoginForm } from "@/components/auth/login-form";
import { Flame } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-2 mb-10">
        <div className="flex items-center space-x-2">
          <Flame className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">StreakSphere</h1>
        </div>
        <p className="text-muted-foreground">
          Build habits, track consistency, and achieve your goals.
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
