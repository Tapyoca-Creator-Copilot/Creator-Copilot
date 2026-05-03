import tapyIcon from "@/assets/tapy.png";
import tapyocaLogoClean from "@/assets/tapyoca-logo-clean.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAuth } from "@/features/auth/context/AuthContext";
import { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const { sendPasswordResetEmail } = UserAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Enter the email address for your account.");
      return;
    }

    setIsSubmitting(true);
    const result = await sendPasswordResetEmail(trimmedEmail);
    setIsSubmitting(false);

    if (!result?.success) {
      setError(result?.error || "Unable to send reset instructions. Please try again.");
      return;
    }

    setMessage("Check your email for a secure link to reset your password.");
  };

  return (
    <div className="min-h-screen min-[980px]:grid min-[980px]:grid-cols-[1fr_minmax(36rem,1fr)]">
      <section className="auth-left-background flex items-center justify-center p-6 min-[980px]:p-10">
        <div className="flex w-full max-w-lg flex-col items-center gap-2.5 text-center">
          <img
            src={tapyIcon}
            alt="Creator Copilot icon"
            className="h-28 w-28 min-[980px]:h-32 min-[980px]:w-32"
          />
          <h1 className="text-4xl font-semibold tracking-tight text-foreground min-[980px]:text-5xl">
            Creator Copilot
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-xl font-medium text-muted-foreground min-[980px]:text-3xl">
              powered by
            </p>
            <img
              src={tapyocaLogoClean}
              alt="Tapyoca"
              className="mt-2.5 h-6 w-auto min-[980px]:h-7"
            />
          </div>
        </div>
      </section>

      <section className="auth-right-background flex items-center justify-center p-6 min-[980px]:p-12 min-[1200px]:p-16">
        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-semibold tracking-tight">Forgot Password</h2>
            <p className="text-muted-foreground">
              Enter your email and we’ll send you a secure reset link.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
                setMessage("");
              }}
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p> : null}
          </div>

          <div className="space-y-4">
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
            <p className="text-sm">
              Remember your password?
              <Link to="/signin" className="ml-1 font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ForgotPassword;
