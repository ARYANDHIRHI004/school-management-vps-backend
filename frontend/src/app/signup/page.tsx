import { AuthPortalShell } from "@/components/auth/auth-portal-shell";
import { AuthRedirectIfSession } from "@/components/auth-redirect-if-session";
import { SignUpForm } from "@/components/sign-up-form";

export default function SignUpPage() {
  return (
    <AuthPortalShell
      variant="signup"
      title="Join the Vikas Valley community"
      subtitle="Student accounts are issued after admission. Admins can create users when signed in. For new admissions, use the enquiry form on our website."
      illustration="/images/illustrations/undraw_back-to-school-offers_uorw.svg"
      badge="Admissions & portal access"
    >
      <AuthRedirectIfSession />
      <SignUpForm />
    </AuthPortalShell>
  );
}