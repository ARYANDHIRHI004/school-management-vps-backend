import { AuthPortalShell } from "@/components/auth/auth-portal-shell";
import { AuthRedirectIfSession } from "@/components/auth-redirect-if-session";
import { SignInForm } from "@/components/sign-in-form";

export default function LoginPage() {
  return (
    <AuthPortalShell
      variant="login"
      title="Welcome back to your learning journey"
      subtitle="Choose Admin or Student, then sign in. The server assigns your role; we verify it matches your selection before opening your portal."
      illustration="/images/illustrations/undraw_education_3vwh.svg"
    >
      <AuthRedirectIfSession />
      <SignInForm />
    </AuthPortalShell>
  );
}