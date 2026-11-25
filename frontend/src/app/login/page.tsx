import { AuthPortalShell } from "@/components/auth/auth-portal-shell";
import { AuthRedirectIfSession } from "@/components/auth-redirect-if-session";
import { SignInForm } from "@/components/sign-in-form";

export default function LoginPage() {
  return (
    <AuthPortalShell
      variant="login"
      title="Welcome back to your learning journey"
      subtitle="Access fee statements, notices, and academic records. Students need an admitted profile linked to this account."
      illustration="/images/illustrations/undraw_education_3vwh.svg"
    >
      <AuthRedirectIfSession />
      <SignInForm />
    </AuthPortalShell>
  );
}